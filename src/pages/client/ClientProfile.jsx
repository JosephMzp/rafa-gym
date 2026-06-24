import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { FiUser, FiEdit2, FiMail, FiPhone, FiHash, FiCalendar, FiMapPin, FiHeart } from 'react-icons/fi'
import ProfileHeader from '../../components/ClientDashboard/ProfileHeader'

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

async function uploadToCloudinary(file) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'rafagym/clients')
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
    )
    if (!res.ok) throw new Error('Upload failed')
    return (await res.json()).secure_url
}



// ── Toast message ─────────────────────────────────────────────────────────────
function Toast({ message }) {
    if (!message) return null
    return (
        <div style={{
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: 'var(--space-lg)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
        }}>
            ✓ {message}
        </div>
    )
}

function DataField({ label, value, icon: Icon }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                <Icon size={13} /> {label}
            </span>
            <span style={{ fontSize: '0.9375rem', color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                {value || 'No especificado'}
            </span>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientProfile() {
    const { user, updateUser } = useAuth()

    // ── Datos ──
    const [loading, setLoading]     = useState(true)
    const [membership, setMembership] = useState(null)
    const [location, setLocation]   = useState(null)

    // ── Formulario ──
    const [editing, setEditing]     = useState(false)
    const [editName, setEditName]   = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [editAddress, setEditAddress]   = useState('')
    const [editEmergency, setEditEmergency] = useState('')
    const [saving, setSaving]       = useState(false)

    // ── Foto ──
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview]     = useState(null)

    // ── Feedback ──
    const [message, setMessage]     = useState(null)

    useEffect(() => {
        if (!user?.id) return
        loadProfileData()
    }, [user?.id])

    async function loadProfileData() {
        try {
            const clientId = user.id

            const { data: mem } = await supabase
                .from('client_memberships')
                .select('*, membership_type:membership_types(*)')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .order('end_date', { ascending: false })
                .limit(1)
            setMembership(mem?.[0] || null)

            if (user.location_id) {
                const { data: loc } = await supabase
                    .from('locations').select('*').eq('id', user.location_id).single()
                setLocation(loc || null)
            }
        } catch (err) {
            console.error('[ClientProfile] loadProfileData:', err)
        } finally {
            setLoading(false)
        }
    }

    // ── Edición de perfil ──
    const startEditing = () => {
        setEditName(user?.name || '')
        setEditPhone(user?.phone || '')
        setEditAddress(user?.address || '')
        setEditEmergency(user?.emergency_contact || '')
        setEditing(true)
    }

    const saveProfile = async () => {
        setSaving(true)
        try {
            const updates = {
                name: editName,
                phone: editPhone,
                address: editAddress,
                emergency_contact: editEmergency,
            }
            await supabase.from('clients').update(updates).eq('id', user.id)
            updateUser(updates)
            setEditing(false)
            setMessage('Datos actualizados correctamente')
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            console.error('[ClientProfile] saveProfile:', err)
        } finally {
            setSaving(false)
        }
    }

    // ── Cambio de foto ──
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
        } catch (err) {
            console.error('[ClientProfile] handlePhoto:', err)
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-xl)' }}>
                👤 Mi Perfil
            </h1>

            <Toast message={message} />

            {loading ? (
                <>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)', alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div className="skeleton" style={{ height: 28, width: '50%', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-sm)' }} />
                            <div className="skeleton" style={{ height: 18, width: '35%', borderRadius: 'var(--radius-md)' }} />
                        </div>
                    </div>
                    <div className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }} />
                    <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)' }} />
                </>
            ) : (
                <>
                    <ProfileHeader
                        user={user}
                        location={location}
                        membership={membership}
                        preview={preview}
                        uploading={uploading}
                        handlePhoto={handlePhoto}
                    />

                    {/* Mis Datos Personales */}
                    <div className="card" id="mis-datos" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                                <FiUser color="var(--primary-400)" size={20} /> Mis Datos
                            </h3>
                            {!editing && (
                                <button className="btn btn-sm btn-secondary" onClick={startEditing}>
                                    <FiEdit2 size={14} /> Editar Perfil
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
                                {/* Section 1: Info Personal */}
                                <div>
                                    <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                                        Información Personal
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)' }}>
                                        <div className="form-group">
                                            <label className="form-label"><FiUser size={12} /> Nombre Completo</label>
                                            <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label"><FiHash size={12} /> Documento</label>
                                            <input className="form-input" value={user?.document || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }} title="El documento de identidad no se puede cambiar" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label"><FiCalendar size={12} /> Fecha de Nacimiento</label>
                                            <input className="form-input" value={user?.birth_date || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }} title="Para cambiar la fecha de nacimiento, comunícate con recepción" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Contacto */}
                                <div>
                                    <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                                        Contacto
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)' }}>
                                        <div className="form-group">
                                            <label className="form-label"><FiMail size={12} /> Correo Electrónico</label>
                                            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }} title="El correo electrónico no se puede cambiar" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label"><FiPhone size={12} /> Teléfono</label>
                                            <input className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label"><FiMapPin size={12} /> Dirección</label>
                                            <input className="form-input" value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label"><FiHeart size={12} /> Contacto de Emergencia</label>
                                            <input className="form-input" value={editEmergency} onChange={e => setEditEmergency(e.target.value)} placeholder="Nombre y teléfono de un familiar/amigo" />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-md)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border-subtle)' }}>
                                    <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancelar</button>
                                    <button className="btn btn-primary" onClick={saveProfile} disabled={saving || !editName} style={{ paddingLeft: 'var(--space-xl)', paddingRight: 'var(--space-xl)' }}>
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
                                {/* Section 1: Info Personal */}
                                <div>
                                    <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                                        Información Personal
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-xl)' }}>
                                        <DataField label="Nombre Completo" value={user?.name} icon={FiUser} />
                                        <DataField label="Documento" value={user?.document} icon={FiHash} />
                                        <DataField label="Fecha Nacimiento" value={user?.birth_date} icon={FiCalendar} />
                                    </div>
                                </div>

                                {/* Section 2: Contacto */}
                                <div>
                                    <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                                        Contacto
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-xl)' }}>
                                        <DataField label="Correo Electrónico" value={user?.email} icon={FiMail} />
                                        <DataField label="Teléfono" value={user?.phone} icon={FiPhone} />
                                        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-xl)' }}>
                                            <DataField label="Dirección" value={user?.address} icon={FiMapPin} />
                                            <DataField label="Contacto de Emergencia" value={user?.emergency_contact} icon={FiHeart} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
