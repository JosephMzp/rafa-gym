import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

import ClientNavbar from '../../components/ClientDashboard/ClientNavbar'
import ProfileHeader from '../../components/ClientDashboard/ProfileHeader'
import ClientCalendar from '../../components/ClientDashboard/ClientCalendar'
import InfoCards from '../../components/ClientDashboard/InfoCards'
import ClassesEnrollment from '../../components/ClientDashboard/ClassesEnrollment'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

async function uploadToCloudinary(file) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'rafagym/clients')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    return (await res.json()).secure_url
}

export default function ClientDashboard() {
    const { user, updateUser, logout } = useAuth()
    const navigate = useNavigate()

    const [theme, setTheme] = useState(localStorage.getItem('rafagym-theme') || 'dark')
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('rafagym-theme', theme)
    }, [theme])
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    // ── ESTADOS DE DATOS ──
    const [loading, setLoading] = useState(true)
    const [membership, setMembership] = useState(null)
    const [attendances, setAttendances] = useState([])
    const [payments, setPayments] = useState([])
    const [classes, setClasses] = useState([])
    const [allClasses, setAllClasses] = useState([])
    const [location, setLocation] = useState(null)

    // ── ESTADOS UI Y FORMULARIO ──
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [editAddress, setEditAddress] = useState('')
    const [editEmergency, setEditEmergency] = useState('')
    const [saving, setSaving] = useState(false)

    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(null)
    const [message, setMessage] = useState(null)

    // ── ESTADOS CALENDARIO ──
    const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    const [calendarView, setCalendarView] = useState('weekly')

    // ── ESTADOS MATRÍCULA CLASES ──
    const [enrolling, setEnrolling] = useState(false)
    const [enrollMsg, setEnrollMsg] = useState(null)

    useEffect(() => {
        if (!user || !user.id) return
        loadClientData()
        const channel = supabase.channel('client_dashboard_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'class_enrollments', filter: `client_id=eq.${user.id}` }, () => loadClientData())
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [user?.id])

    async function loadClientData() {
        try {
            const clientId = user.id

            const { data: memData } = await supabase.from('client_memberships').select('*, membership_type:membership_types(*)').eq('client_id', clientId).eq('status', 'active').order('end_date', { ascending: false }).limit(1)
            setMembership(memData?.[0] || null)

            if (user.location_id) {
                const { data: locData } = await supabase.from('locations').select('*').eq('id', user.location_id).single()
                setLocation(locData || null)
            }

            const { data: attData } = await supabase.from('attendances').select('*, location:locations(name)').eq('client_id', clientId).order('check_in', { ascending: false }).limit(8)
            setAttendances(attData || [])

            const { data: payData } = await supabase.from('payments').select('*').eq('client_id', clientId).order('date', { ascending: false }).limit(5)
            setPayments(payData || [])

            const { data: clsData } = await supabase.from('class_enrollments').select('*, class:classes(name, instructor, schedule)').eq('client_id', clientId).eq('status', 'active')
            setClasses(clsData || [])

            const { data: allClsData } = await supabase.from('classes').select('*, location:locations(name), class_enrollments(id, client_id)').eq('status', 'active').order('name')
            setAllClasses(allClsData || [])

        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const startEditing = () => {
        setEditName(user?.name || ''); setEditPhone(user?.phone || ''); setEditAddress(user?.address || ''); setEditEmergency(user?.emergency_contact || ''); setEditing(true)
    }

    const saveProfile = async () => {
        setSaving(true)
        try {
            const updates = { name: editName, phone: editPhone, address: editAddress, emergency_contact: editEmergency }
            await supabase.from('clients').update(updates).eq('id', user.id)
            updateUser(updates)
            setEditing(false)
            setMessage('Datos actualizados correctamente')
            setTimeout(() => setMessage(null), 3000)
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const handlePhoto = async (file) => {
        if (!file || !file.type.startsWith('image/')) return
        if (file.size > 5 * 1024 * 1024) return

        const reader = new FileReader()
        reader.onload = ev => setPreview(ev.target.result)
        reader.readAsDataURL(file)

        setUploading(true)
        try {
            const url = await uploadToCloudinary(file)
            await supabase.from('clients').update({ photo_url: url }).eq('id', user.id)
            updateUser({ photo_url: url })
            setPreview(null)
            setMessage('Foto actualizada')
            setTimeout(() => setMessage(null), 3000)
        } catch (err) { console.error(err); setPreview(null) }
        finally { setUploading(false) }
    }

    const handleEnroll = async (cls) => {
        if (enrolling) return
        const alreadyEnrolled = (cls.class_enrollments || []).some(e => e.client_id === user.id)
        setEnrolling(true)
        try {
            if (alreadyEnrolled) {
                const myEnrollment = (cls.class_enrollments || []).find(e => e.client_id === user.id)
                if (myEnrollment) await supabase.from('class_enrollments').delete().eq('id', myEnrollment.id)
                setEnrollMsg('✓ Matrícula cancelada de ' + cls.name)
            } else {
                const currentCount = (cls.class_enrollments || []).length
                if (currentCount >= cls.capacity) {
                    setEnrollMsg(`⚠ Esta clase está llena (capacidad: ${cls.capacity})`)
                    setTimeout(() => setEnrollMsg(null), 3000)
                    setEnrolling(false); return
                }
                await supabase.from('class_enrollments').insert({ class_id: cls.id, client_id: user.id, status: 'active' })
                setEnrollMsg('✓ ¡Matriculado en ' + cls.name + '!')
            }
            setTimeout(() => setEnrollMsg(null), 3000)
            loadClientData()
        } catch (err) { setEnrollMsg('Error al procesar la solicitud'); setTimeout(() => setEnrollMsg(null), 3000) }
        finally { setEnrolling(false) }
    }

    if (loading) return <div style={{ minHeight: '100vh', background: 'var(--dark-900)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner spinner-lg" /></div>

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)' }}>
            <ClientNavbar user={user} theme={theme} toggleTheme={toggleTheme} handleLogout={() => { logout(); navigate('/login') }} onEditClick={() => { document.getElementById('mis-datos').scrollIntoView({ behavior: 'smooth' }); startEditing() }} />

            <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
                {message && <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-lg)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>{'✓'} {message}</div>}

                <ProfileHeader user={user} location={location} membership={membership} preview={preview} uploading={uploading} handlePhoto={handlePhoto} />

                <ClientCalendar classes={classes} calView={calendarView} setCalendarView={setCalendarView} calendarMonth={calendarMonth} setCalendarMonth={setCalendarMonth} />

                <ClassesEnrollment membershipName={membership?.membership_type?.name} allClasses={allClasses} user={user} enrollMsg={enrollMsg} enrolling={enrolling} handleEnroll={handleEnroll} />

                <InfoCards
                    user={user} attendances={attendances} payments={payments} classesCount={classes.length} totalAttendances={attendances.length} lastPayment={payments[0]}
                    editing={editing} setEditing={setEditing} startEditing={startEditing}
                    editName={editName} setEditName={setEditName} editPhone={editPhone} setEditPhone={setEditPhone}
                    editAddress={editAddress} setEditAddress={setEditAddress} editEmergency={editEmergency} setEditEmergency={setEditEmergency}
                    saving={saving} saveProfile={saveProfile}
                />
            </div>
        </div>
    )
}