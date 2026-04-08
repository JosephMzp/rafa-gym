import { useState, useRef } from 'react'
import { FiSave, FiCamera, FiX, FiUser, FiMail, FiPhone, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

var CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
var UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', '/upload/w_' + w + ',h_' + h + ',c_fill,g_face,q_auto,f_auto/')
}

async function uploadToCloudinary(file, folder) {
    var fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', folder)
    var res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    var data = await res.json()
    return data.secure_url
}

export default function Profile() {
    var auth = useAuth()
    var user = auth.user
    var updateUser = auth.updateUser

    var _name = useState(user?.name || '')
    var _email = useState(user?.email || '')
    var _phone = useState(user?.phone || '')
    var _photoUrl = useState(user?.photo_url || '')
    var _preview = useState(null)
    var _uploading = useState(false)
    var _saving = useState(false)
    var _message = useState(null)
    var _error = useState(null)
    var fileRef = useRef(null)

    var name = _name[0], setName = _name[1]
    var email = _email[0], setEmail = _email[1]
    var phone = _phone[0], setPhone = _phone[1]
    var photoUrl = _photoUrl[0], setPhotoUrl = _photoUrl[1]
    var preview = _preview[0], setPreview = _preview[1]
    var uploading = _uploading[0], setUploading = _uploading[1]
    var saving = _saving[0], setSaving = _saving[1]
    var message = _message[0], setMessage = _message[1]
    var error = _error[0], setError = _error[1]

    var displayImg = preview || (photoUrl ? optimizeUrl(photoUrl, 200, 200) : null)

    async function handlePhoto(file) {
        if (!file || !file.type.startsWith('image/')) return
        if (file.size > 5 * 1024 * 1024) { setError('La imagen no puede superar 5MB'); return }
        setError(null)

        var reader = new FileReader()
        reader.onload = function (ev) { setPreview(ev.target.result) }
        reader.readAsDataURL(file)

        setUploading(true)
        try {
            var url = await uploadToCloudinary(file, 'rafagym/staff')
            setPhotoUrl(url)

            await supabase.from('staff').update({ photo_url: url }).eq('id', user.id)
            updateUser({ photo_url: url })

            setMessage('Foto actualizada')
            setTimeout(function () { setMessage(null) }, 3000)
        } catch (err) {
            console.error(err)
            setError('Error al subir imagen')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    async function removePhoto() {
        setPreview(null)
        setPhotoUrl('')

        try {
            await supabase.from('staff').update({ photo_url: null }).eq('id', user.id)
            updateUser({ photo_url: null })
        } catch (err) { console.error(err) }
    }

    async function handleSave() {
        setMessage(null)
        setError(null)
        setSaving(true)

        try {
            var updates = { name: name, email: email, phone: phone, photo_url: photoUrl || null }
            var result = await supabase.from('staff').update(updates).eq('id', user.id)
            if (result.error) throw result.error

            updateUser(updates)
            setMessage('Perfil actualizado correctamente')
            setTimeout(function () { setMessage(null) }, 3000)
        } catch (err) {
            console.error('Save error:', err)
            setError('Error al guardar: ' + (err.message || 'Intenta de nuevo'))
        } finally {
            setSaving(false)
        }
    }

    var roleName = user?.role === 'admin' ? 'Administrador' : user?.role === 'receptionist' ? 'Recepcionista' : 'Entrenador'

    return (
        <div>
            <div style={{
                margin: '-var(--space-2xl) -var(--space-2xl) var(--space-2xl) -var(--space-2xl)',
                padding: 'var(--space-2xl) var(--space-2xl) 5rem var(--space-2xl)',
                background: 'linear-gradient(to bottom, rgba(139,92,246,0.1), var(--dark-900))',
                borderBottom: '1px solid var(--border-subtle)'
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        Mi Perfil
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Gestiona tu información personal y preferencias
                    </p>
                </div>
            </div>

            <div style={{
                maxWidth: 900, margin: '-4rem auto 0 auto',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-xl)', alignItems: 'start'
            }}>

                <div className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'center', borderColor: 'var(--primary-700)' }}>
                    <div style={{ height: 100, background: 'linear-gradient(135deg, var(--primary-500), #a78bfa)' }}></div>

                    <div style={{ padding: '0 var(--space-xl) var(--space-2xl)', marginTop: -50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
                            <div
                                onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                                style={{
                                    width: 110, height: 110, borderRadius: '50%',
                                    background: displayImg ? 'url(' + displayImg + ') center/cover' : 'var(--dark-600)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '4px solid var(--dark-800)',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                    cursor: uploading ? 'wait' : 'pointer',
                                    position: 'relative', overflow: 'hidden'
                                }}
                            >
                                {!displayImg && !uploading && (
                                    <span style={{ fontSize: '2.5rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        {(user?.name || 'A').charAt(0).toUpperCase()}
                                    </span>
                                )}
                                {uploading && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div className="spinner" style={{ width: 28, height: 28, borderTopColor: 'var(--primary-400)' }}></div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                                style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'var(--primary-500)', border: '2px solid var(--dark-800)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={function (e) { e.currentTarget.style.transform = 'scale(1.1)' }}
                                onMouseLeave={function (e) { e.currentTarget.style.transform = 'scale(1)' }}
                            >
                                <FiCamera size={14} />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={function (e) { handlePhoto(e.target.files[0]) }} />
                        </div>

                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                            {user?.name}
                        </h2>
                        <span className="badge badge-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            {roleName}
                        </span>

                        {displayImg && !uploading && (
                            <button onClick={removePhoto}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--danger)',
                                    cursor: 'pointer', fontSize: '0.8125rem', marginTop: '1rem',
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    fontWeight: 500, padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={function (e) { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)' }}
                                onMouseLeave={function (e) { e.currentTarget.style.background = 'transparent' }}
                            >
                                <FiX size={14} /> Eliminar foto actual
                            </button>
                        )}

                        <div style={{ marginTop: 'var(--space-lg)', width: '100%', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <FiCheckCircle color="var(--success)" /> <span>Cuenta Activa</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

                    {message && (
                        <div className="card" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FiCheckCircle color="#10b981" size={20} />
                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9375rem' }}>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="card" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9375rem' }}>{error}</span>
                            <button onClick={function () { setError(null) }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                <FiX size={16} />
                            </button>
                        </div>
                    )}

                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-xl)', fontSize: '1.125rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                            Datos Personales
                        </h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <FiUser size={14} color="var(--primary-400)" /> Nombre Completo
                                </label>
                                <input className="form-input" value={name}
                                    style={{ background: 'var(--dark-800)', border: '1px solid var(--border-subtle)' }}
                                    onChange={function (e) { setName(e.target.value) }}
                                    placeholder="Tu nombre completo" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <FiMail size={14} color="var(--primary-400)" /> Correo Electrónico
                                </label>
                                <input className="form-input" type="email" value={email}
                                    style={{ background: 'var(--dark-800)', border: '1px solid var(--border-subtle)' }}
                                    onChange={function (e) { setEmail(e.target.value) }}
                                    placeholder="correo@ejemplo.com" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <FiPhone size={14} color="var(--success)" /> Teléfono
                                </label>
                                <input className="form-input" type="tel" value={phone}
                                    style={{ background: 'var(--dark-800)', border: '1px solid var(--border-subtle)' }}
                                    onChange={function (e) { setPhone(e.target.value) }}
                                    placeholder="999-999-999" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <span>🛡️</span> Rol del Sistema
                                </label>
                                <input className="form-input" value={roleName} disabled
                                    style={{ background: 'var(--dark-600)', opacity: 0.7, cursor: 'not-allowed', color: 'var(--text-secondary)' }} />
                            </div>
                        </div>

                        <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading || !name}
                                style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                                {saving ? (
                                    <><div className="spinner" style={{ width: 16, height: 16 }}></div> Guardando...</>
                                ) : (
                                    <><FiSave size={16} /> Guardar Cambios</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
