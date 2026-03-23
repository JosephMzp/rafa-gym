import { useState, useRef } from 'react'
import { FiSave, FiCamera, FiX, FiUser, FiMail, FiPhone } from 'react-icons/fi'
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
        } catch (err) {
            console.error(err)
            setError('Error al subir imagen')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    function removePhoto() {
        setPreview(null)
        setPhotoUrl('')
    }

    async function handleSave() {
        setMessage(null)
        setError(null)
        setSaving(true)

        try {
            // Update staff table
            var updates = {
                name: name,
                email: email,
                phone: phone,
                photo_url: photoUrl || null
            }

            var result = await supabase
                .from('staff')
                .update(updates)
                .eq('id', user.id)

            if (result.error) throw result.error

            // Update auth context so UI reflects changes immediately
            updateUser({
                name: name,
                email: email,
                phone: phone,
                photo_url: photoUrl || null
            })

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
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mi Perfil</h1>
                    <p className="page-subtitle">Edita tu informacion personal</p>
                </div>
            </div>

            <div style={{ maxWidth: 640, margin: '0 auto' }}>
                {/* Success message */}
                {message && (
                    <div style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                        background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
                        fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-lg)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                        {'✓'} {message}
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                        background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
                        fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-lg)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <span>{error}</span>
                        <button onClick={function () { setError(null) }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <FiX size={16} />
                        </button>
                    </div>
                )}

                <div className="card">
                    {/* Profile photo section */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-xl)', paddingBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
                            <div
                                onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                                style={{
                                    width: 120, height: 120, borderRadius: '50%',
                                    overflow: 'hidden', cursor: uploading ? 'wait' : 'pointer',
                                    background: displayImg
                                        ? 'url(' + displayImg + ') center/cover no-repeat'
                                        : 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '3px solid var(--primary-500)',
                                    boxShadow: '0 4px 20px rgba(var(--primary-rgb), 0.3)',
                                    position: 'relative'
                                }}
                            >
                                {!displayImg && !uploading && (
                                    <span style={{ fontSize: '2.5rem', color: 'white', fontWeight: 700 }}>
                                        {(user?.name || 'A').charAt(0).toUpperCase()}
                                    </span>
                                )}
                                {uploading && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <div className="spinner" style={{ width: 28, height: 28 }}></div>
                                    </div>
                                )}
                            </div>
                            {/* Camera icon overlay */}
                            <button
                                onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                                style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'var(--primary-500)', border: '2px solid var(--dark-700)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                }}
                            >
                                <FiCamera size={16} />
                            </button>
                        </div>

                        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.125rem' }}>{user?.name}</h2>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{roleName}</span>

                        {displayImg && !uploading && (
                            <button onClick={removePhoto}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--danger)',
                                    cursor: 'pointer', fontSize: '0.75rem', marginTop: '0.5rem',
                                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                                }}>
                                <FiX size={12} /> Quitar foto
                            </button>
                        )}

                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={function (e) { handlePhoto(e.target.files[0]) }} />
                    </div>

                    {/* Form fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <FiUser size={14} /> Nombre Completo
                            </label>
                            <input className="form-input" value={name}
                                onChange={function (e) { setName(e.target.value) }}
                                placeholder="Tu nombre completo" />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <FiMail size={14} /> Correo Electronico
                            </label>
                            <input className="form-input" type="email" value={email}
                                onChange={function (e) { setEmail(e.target.value) }}
                                placeholder="correo@ejemplo.com" />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <FiPhone size={14} /> Telefono
                            </label>
                            <input className="form-input" type="tel" value={phone}
                                onChange={function (e) { setPhone(e.target.value) }}
                                placeholder="999-999-999" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Rol</label>
                            <input className="form-input" value={roleName} disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                El rol no se puede cambiar desde aqui
                            </p>
                        </div>
                    </div>

                    {/* Save button */}
                    <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleSave}
                            disabled={saving || uploading || !name}>
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
    )
}
