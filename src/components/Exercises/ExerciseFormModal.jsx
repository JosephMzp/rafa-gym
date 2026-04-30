import { useState, useRef } from 'react'
import { FiX, FiCamera, FiVideo } from 'react-icons/fi'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cuerpo Completo']

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_auto,q_auto,f_auto/`)
}

async function uploadToCloudinary(file, folder) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', folder)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    return (await res.json()).secure_url
}

async function uploadVideoToCloudinary(file, folder) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', folder)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Video upload failed')
    return (await res.json()).secure_url
}

export default function ExerciseFormModal({ exercise, onSave, onClose }) {
    const [name, setName] = useState(exercise?.name || '')
    const [desc, setDesc] = useState(exercise?.description || '')
    const [group, setGroup] = useState(exercise?.muscle_group || MUSCLE_GROUPS[0])
    const [equip, setEquip] = useState(exercise?.equipment || '')
    const [sets, setSets] = useState(exercise?.sets_recommended || 3)
    const [reps, setReps] = useState(exercise?.reps_recommended || '')

    const [imgUrl, setImgUrl] = useState(exercise?.image_url || '')
    const [videoUrl, setVideoUrl] = useState(exercise?.video_url || '')

    const [uploading, setUploading] = useState(false)
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [preview, setPreview] = useState(null)
    const [imgError, setImgError] = useState(null)
    const [videoError, setVideoError] = useState(null)

    const fileRef = useRef(null)
    const videoRef = useRef(null)

    const displayImg = preview || (imgUrl ? optimizeUrl(imgUrl, 640, 400) : null)

    async function handleFile(file) {
        if (!file) return
        if (!file.type.startsWith('image/')) { setImgError('Solo se permiten imágenes'); return }
        if (file.size > 5 * 1024 * 1024) { setImgError('La imagen no puede superar 5MB'); return }
        setImgError(null)

        const reader = new FileReader()
        reader.onload = ev => setPreview(ev.target.result)
        reader.readAsDataURL(file)

        setUploading(true)
        try {
            const url = await uploadToCloudinary(file, 'rafagym/exercises')
            setImgUrl(url)
        } catch (err) {
            setImgError('Error al subir imagen')
            setPreview(null)
        } finally { setUploading(false) }
    }

    async function handleVideoFile(file) {
        if (!file) return
        const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
        if (!allowed.includes(file.type)) { setVideoError('Formato no soportado. Usa MP4, WebM o MOV'); return }
        if (file.size > 100 * 1024 * 1024) { setVideoError('El video no debe superar 100MB'); return }

        setVideoError(null)
        setUploadingVideo(true)
        try {
            const url = await uploadVideoToCloudinary(file, 'rafagym/exercises/videos')
            setVideoUrl(url)
        } catch (err) { setVideoError('Error al subir el video. Intenta de nuevo.') }
        finally { setUploadingVideo(false) }
    }

    const doSave = () => {
        onSave({
            name, description: desc, muscle_group: group, equipment: equip,
            sets_recommended: sets, reps_recommended: reps,
            image_url: imgUrl || null, video_url: videoUrl || null
        })
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{exercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>

                <div className="modal-body">
                    {/* Sección de Imagen */}
                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <label className="form-label">Imagen del Ejercicio</label>
                        <div onClick={() => !uploading && fileRef.current?.click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
                            style={{ width: '100%', maxWidth: 400, height: 180, borderRadius: 'var(--radius-lg)', margin: '0 auto', cursor: uploading ? 'wait' : 'pointer', background: displayImg ? `url(${displayImg}) center/cover no-repeat` : 'var(--dark-600)', border: '2px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
                            {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ width: 32, height: 32 }}></div></div>}
                            {!displayImg && !uploading && (
                                <div style={{ textAlign: 'center' }}>
                                    <FiCamera size={32} style={{ opacity: 0.3, marginBottom: '0.25rem' }} />
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Clic o arrastra una imagen aquí</span>
                                </div>
                            )}
                        </div>
                        {displayImg && !uploading && (
                            <div style={{ textAlign: 'center', marginTop: '0.375rem' }}>
                                <button onClick={() => { setPreview(null); setImgUrl(''); setImgError(null) }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FiX size={12} /> Quitar imagen</button>
                            </div>
                        )}
                        {imgError && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.375rem' }}>{imgError}</p>}
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                    </div>

                    {/* Sección de Video */}
                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><FiVideo size={14} /> Video Demostrativo <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                        {videoUrl ? (
                            <div>
                                <video src={videoUrl} controls style={{ width: '100%', maxHeight: 200, borderRadius: 'var(--radius-lg)', background: '#000', objectFit: 'contain' }} />
                                <div style={{ textAlign: 'center', marginTop: '0.375rem' }}>
                                    <button onClick={() => { setVideoUrl(''); setVideoError(null); if (videoRef.current) videoRef.current.value = '' }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FiX size={12} /> Quitar video</button>
                                </div>
                            </div>
                        ) : (
                            <div onClick={() => !uploadingVideo && videoRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleVideoFile(e.dataTransfer.files[0]) }} style={{ width: '100%', height: 120, borderRadius: 'var(--radius-lg)', cursor: uploadingVideo ? 'wait' : 'pointer', background: 'var(--dark-600)', border: '2px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
                                {uploadingVideo ? (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}><div className="spinner" style={{ width: 28, height: 28 }}></div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subiendo video...</span></div>
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <FiVideo size={28} style={{ opacity: 0.3, marginBottom: '0.25rem' }} />
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block' }}>Clic o arrastra un video aquí</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7 }}>MP4, WebM o MOV — máx. 100MB</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {videoError && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.375rem' }}>{videoError}</p>}
                        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" style={{ display: 'none' }} onChange={e => handleVideoFile(e.target.files[0])} />
                    </div>

                    {/* Formulario */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nombre del Ejercicio *</label>
                            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Press Banca" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grupo Muscular *</label>
                            <select className="form-input" value={group} onChange={e => setGroup(e.target.value)}>
                                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Equipo Necesario</label>
                            <input className="form-input" value={equip} onChange={e => setEquip(e.target.value)} placeholder="Barra, Mancuernas, Máquina..." />
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Series</label>
                                <input className="form-input" type="number" min="1" max="10" value={sets} onChange={e => setSets(parseInt(e.target.value) || 0)} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Repeticiones</label>
                                <input className="form-input" value={reps} onChange={e => setReps(e.target.value)} placeholder="8-12" />
                            </div>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                        <label className="form-label">Descripción</label>
                        <textarea className="form-input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción del ejercicio, técnica, consejos..." style={{ resize: 'vertical' }} />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={doSave} disabled={!name || uploading || uploadingVideo}>
                        {exercise ? 'Guardar Cambios' : 'Crear Ejercicio'}
                    </button>
                </div>
            </div>
        </div>
    )
}