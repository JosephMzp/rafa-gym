import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
    FiUser, FiAward, FiCalendar, FiDollarSign, FiActivity,
    FiBookOpen, FiCamera, FiMapPin, FiClock, FiPhone, FiMail,
    FiEdit2, FiSave, FiX, FiLogOut
} from 'react-icons/fi'

var CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
var UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', '/upload/w_' + w + ',h_' + h + ',c_fill,g_face,q_auto,f_auto/')
}

async function uploadToCloudinary(file) {
    var fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'rafagym/clients')
    var res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    var data = await res.json()
    return data.secure_url
}

export default function ClientDashboard() {
    var auth = useAuth()
    var user = auth.user
    var updateUser = auth.updateUser
    var logout = auth.logout
    var navigate = useNavigate()

    var _loading = useState(true)
    var _membership = useState(null)
    var _attendances = useState([])
    var _payments = useState([])
    var _routine = useState(null)
    var _classes = useState([])
    var _location = useState(null)
    var _editing = useState(false)
    var _editName = useState('')
    var _editPhone = useState('')
    var _editAddress = useState('')
    var _editEmergency = useState('')
    var _saving = useState(false)
    var _uploading = useState(false)
    var _preview = useState(null)
    var _message = useState(null)

    var loading = _loading[0], setLoading = _loading[1]
    var membership = _membership[0], setMembership = _membership[1]
    var attendances = _attendances[0], setAttendances = _attendances[1]
    var payments = _payments[0], setPayments = _payments[1]
    var routine = _routine[0], setRoutine = _routine[1]
    var classes = _classes[0], setClasses = _classes[1]
    var location = _location[0], setLocation = _location[1]
    var editing = _editing[0], setEditing = _editing[1]
    var editName = _editName[0], setEditName = _editName[1]
    var editPhone = _editPhone[0], setEditPhone = _editPhone[1]
    var editAddress = _editAddress[0], setEditAddress = _editAddress[1]
    var editEmergency = _editEmergency[0], setEditEmergency = _editEmergency[1]
    var saving = _saving[0], setSaving = _saving[1]
    var uploading = _uploading[0], setUploading = _uploading[1]
    var preview = _preview[0], setPreview = _preview[1]
    var message = _message[0], setMessage = _message[1]
    var fileRef = useRef(null)

    useEffect(function () {
        if (user && user.id) loadClientData()
    }, [user?.id])

    async function loadClientData() {
        try {
            var clientId = user.id

            // Membership
            var memRes = await supabase
                .from('client_memberships')
                .select('*, membership_type:membership_types(id, name, price)')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .single()
            if (memRes.data) setMembership(memRes.data)

            // Location
            if (user.location_id) {
                var locRes = await supabase.from('locations').select('*').eq('id', user.location_id).single()
                if (locRes.data) setLocation(locRes.data)
            }

            // Attendances (last 8)
            var attRes = await supabase
                .from('attendances')
                .select('*, location:locations(name)')
                .eq('client_id', clientId)
                .order('check_in', { ascending: false })
                .limit(8)
            setAttendances(attRes.data || [])

            // Payments (last 5)
            var payRes = await supabase
                .from('payments')
                .select('*')
                .eq('client_id', clientId)
                .order('date', { ascending: false })
                .limit(5)
            setPayments(payRes.data || [])

            // Routine
            var routRes = await supabase
                .from('routines')
                .select('*, routine_exercises(*, exercises(name, muscle_group))')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .single()
            if (routRes.data) setRoutine(routRes.data)

            // Enrolled classes
            var clsRes = await supabase
                .from('class_enrollments')
                .select('*, class:classes(name, instructor, schedule)')
                .eq('client_id', clientId)
                .eq('status', 'active')
            setClasses(clsRes.data || [])

        } catch (err) { console.error('loadClientData error:', err) }
        finally { setLoading(false) }
    }

    function handleLogout() { logout(); navigate('/login') }

    function startEditing() {
        setEditName(user?.name || '')
        setEditPhone(user?.phone || '')
        setEditAddress(user?.address || '')
        setEditEmergency(user?.emergency_contact || '')
        setEditing(true)
    }

    async function saveProfile() {
        setSaving(true)
        try {
            var updates = { name: editName, phone: editPhone, address: editAddress, emergency_contact: editEmergency }
            var res = await supabase.from('clients').update(updates).eq('id', user.id)
            if (res.error) throw res.error
            updateUser(updates)
            setEditing(false)
            setMessage('Datos actualizados correctamente')
            setTimeout(function () { setMessage(null) }, 3000)
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    async function handlePhoto(file) {
        if (!file || !file.type.startsWith('image/')) return
        if (file.size > 5 * 1024 * 1024) return

        var reader = new FileReader()
        reader.onload = function (ev) { setPreview(ev.target.result) }
        reader.readAsDataURL(file)

        setUploading(true)
        try {
            var url = await uploadToCloudinary(file)
            await supabase.from('clients').update({ photo_url: url }).eq('id', user.id)
            updateUser({ photo_url: url })
            setPreview(null)
            setMessage('Foto actualizada')
            setTimeout(function () { setMessage(null) }, 3000)
        } catch (err) { console.error(err); setPreview(null) }
        finally { setUploading(false) }
    }

    // Computed values
    var daysLeft = 0
    if (membership && membership.end_date) {
        daysLeft = Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    }
    var membershipName = membership?.membership_type?.name || 'Sin membresia'
    var membershipColor = membershipName === 'Gold' ? '#f59e0b' : membershipName === 'Fit' ? '#8b5cf6' : '#10b981'
    var photoDisplay = preview || (user?.photo_url ? optimizeUrl(user.photo_url, 200, 200) : null)
    var totalAttendances = attendances.length
    var lastPayment = payments[0]

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner spinner-lg"></div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)' }}>
            {/* Top nav */}
            <nav className="glass" style={{
                padding: '0.75rem var(--space-xl)', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 50
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{'💪'}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                        Rafa<span className="gradient-text">Gym</span>
                    </span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <a href="#mis-datos" onClick={function(e) { e.preventDefault(); document.getElementById('mis-datos').scrollIntoView({ behavior: 'smooth' }); startEditing() }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', transition: 'background 0.2s, border-color 0.2s' }}
                        title="Editar mis datos"
                        onMouseEnter={function(e) { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'var(--dark-700)' }}
                        onMouseLeave={function(e) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--dark-800)' }}>
                        {user?.photo_url ? (
                            <img src={optimizeUrl(user.photo_url, 64, 64)} alt={user?.name}
                                style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }} />
                        ) : (
                            <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem', border: '2px solid var(--primary-500)' }}>
                                {(user?.name || 'C').charAt(0)}
                            </div>
                        )}
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</span>
                        <FiEdit2 size={12} color="var(--primary-400)" style={{ marginLeft: '0.25rem' }} />
                    </a>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}><FiLogOut size={14} /> Salir</button>
                </div>
            </nav>

            <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
                {/* Success message */}
                {message && (
                    <div style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                        background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
                        fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-lg)',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}>
                        {'✓'} {message}
                    </div>
                )}

                {/* Hero section with profile photo */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-xl)',
                    marginBottom: 'var(--space-2xl)', flexWrap: 'wrap'
                }}>
                    {/* Photo */}
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                            style={{
                                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                                cursor: uploading ? 'wait' : 'pointer',
                                background: photoDisplay
                                    ? 'url(' + photoDisplay + ') center/cover no-repeat'
                                    : 'linear-gradient(135deg, ' + membershipColor + ', var(--primary-700))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '3px solid ' + membershipColor,
                                boxShadow: '0 4px 20px ' + membershipColor + '40',
                                position: 'relative'
                            }}
                        >
                            {!photoDisplay && !uploading && (
                                <span style={{ fontSize: '2rem', color: 'white', fontWeight: 700 }}>
                                    {(user?.name || 'C').charAt(0).toUpperCase()}
                                </span>
                            )}
                            {uploading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="spinner" style={{ width: 24, height: 24 }}></div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                            style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 32, height: 32, borderRadius: '50%',
                                background: membershipColor, border: '2px solid var(--dark-700)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            <FiCamera size={14} />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={function (e) { handlePhoto(e.target.files[0]) }} />
                    </div>

                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
                            Hola,{' '}<span className="gradient-text">{user?.name}</span>{' '}{'👋'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
                            Aqui esta el resumen de tu cuenta
                        </p>
                        {location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                <FiMapPin size={12} /> {location.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Membership Card */}
                <div className="card" style={{
                    marginBottom: 'var(--space-xl)',
                    background: 'linear-gradient(135deg, ' + membershipColor + '15, ' + membershipColor + '05)',
                    borderColor: membershipColor + '30',
                    borderLeft: '4px solid ' + membershipColor
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FiAward color={membershipColor} size={22} />
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: membershipColor }}>
                                    {'Membresia ' + membershipName}
                                </span>
                            </div>
                            {membership && (
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    {'Desde: ' + membership.start_date + ' • Hasta: ' + membership.end_date}
                                </div>
                            )}
                            {!membership && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No tienes una membresia activa</p>
                            )}
                        </div>
                        {membership && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900,
                                    color: daysLeft <= 7 ? 'var(--danger)' : daysLeft <= 15 ? 'var(--warning)' : 'var(--success)',
                                    lineHeight: 1
                                }}>
                                    {daysLeft}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>dias restantes</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--primary-400)' }}><FiCalendar /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Asistencias</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{totalAttendances}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Ultimo Pago</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                                {'S/ ' + (lastPayment ? Number(lastPayment.amount).toFixed(0) : '0')}
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiActivity /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Rutina</div>
                            <div className="stat-card-value" style={{ fontSize: '1rem' }}>{routine ? routine.objective : 'Sin asignar'}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><FiBookOpen /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Clases</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{classes.length}</div>
                        </div>
                    </div>
                </div>

                {/* Two columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    {/* Attendances */}
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCalendar color="var(--primary-400)" /> Ultimas Asistencias
                        </h3>
                        {attendances.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay asistencias registradas</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {attendances.map(function (a) {
                                    var date = new Date(a.check_in)
                                    return (
                                        <div key={a.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiClock size={12} color="var(--text-muted)" />
                                                <span>{date.toLocaleDateString('es-PE')}</span>
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                                {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                {a.location ? ' • ' + a.location.name : ''}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Routine */}
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiActivity color="var(--primary-400)" /> Mi Rutina
                        </h3>
                        {routine ? (
                            <div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Objetivo:</strong> {routine.objective}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Nivel:</strong>{' '}
                                        <span className={'badge ' + (routine.level === 'Principiante' ? 'badge-success' : routine.level === 'Intermedio' ? 'badge-warning' : 'badge-danger')}>
                                            {routine.level}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Entrenador:</strong> {routine.trainer_name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Dias:</strong>{' '}
                                        {(routine.days || []).map(function (d) {
                                            return <span key={d} className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>{d}</span>
                                        })}
                                    </div>
                                </div>
                                {/* Exercise list */}
                                {routine.routine_exercises && routine.routine_exercises.length > 0 && (
                                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            Ejercicios
                                        </div>
                                        {routine.routine_exercises.slice(0, 6).map(function (re, i) {
                                            return (
                                                <div key={re.id || i} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '0.375rem 0', fontSize: '0.8125rem'
                                                }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{re.exercises?.name || 'Ejercicio'}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{re.sets} x {re.reps}</span>
                                                </div>
                                            )
                                        })}
                                        {routine.routine_exercises.length > 6 && (
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                +{routine.routine_exercises.length - 6} ejercicios mas
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'🏋️'}</div>
                                <p style={{ fontSize: '0.875rem' }}>No tienes rutina asignada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom row: Payments + Classes + Personal data */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    {/* Payments */}
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiDollarSign color="var(--success)" /> Ultimos Pagos
                        </h3>
                        {payments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay pagos registrados</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {payments.map(function (p) {
                                    return (
                                        <div key={p.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-600)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.concept}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date} • {p.method}</div>
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9375rem' }}>
                                                {'S/ ' + Number(p.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Enrolled classes */}
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiBookOpen color="#8b5cf6" /> Mis Clases
                        </h3>
                        {classes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'📚'}</div>
                                <p style={{ fontSize: '0.875rem' }}>No estas inscrito en ninguna clase</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {classes.map(function (en) {
                                    return (
                                        <div key={en.id} style={{
                                            padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                                            background: 'var(--dark-600)', borderLeft: '3px solid #8b5cf6'
                                        }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{en.class?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                                {en.class?.instructor} • {en.class?.schedule}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Personal Info */}
                <div className="card" id="mis-datos">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiUser color="var(--primary-400)" /> Mis Datos
                        </h3>
                        {!editing && (
                            <button className="btn btn-sm btn-secondary" onClick={startEditing}>
                                <FiEdit2 size={14} /> Editar
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label"><FiUser size={12} /> Nombre</label>
                                    <input className="form-input" value={editName}
                                        onChange={function (e) { setEditName(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiMail size={12} /> Email</label>
                                    <input className="form-input" value={user?.email || ''} disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiPhone size={12} /> Telefono</label>
                                    <input className="form-input" value={editPhone}
                                        onChange={function (e) { setEditPhone(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Direccion</label>
                                    <input className="form-input" value={editAddress}
                                        onChange={function (e) { setEditAddress(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contacto de Emergencia</label>
                                    <input className="form-input" value={editEmergency}
                                        onChange={function (e) { setEditEmergency(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Documento</label>
                                    <input className="form-input" value={user?.document || ''} disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                                <button className="btn btn-secondary" onClick={function () { setEditing(false) }}><FiX size={14} /> Cancelar</button>
                                <button className="btn btn-primary" onClick={saveProfile} disabled={saving || !editName}>
                                    {saving ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Guardando...</> : <><FiSave size={14} /> Guardar</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-grid">
                            {[
                                ['Nombre', user?.name],
                                ['Documento', user?.document],
                                ['Email', user?.email],
                                ['Telefono', user?.phone],
                                ['Fecha de Nacimiento', user?.birth_date],
                                ['Direccion', user?.address],
                                ['Contacto de Emergencia', user?.emergency_contact]
                            ].map(function (item) {
                                return (
                                    <div key={item[0]} className="form-group">
                                        <span className="form-label">{item[0]}</span>
                                        <span style={{ fontSize: '0.9375rem' }}>{item[1] || '-'}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
