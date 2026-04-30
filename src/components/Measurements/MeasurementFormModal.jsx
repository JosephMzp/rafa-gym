import { useState, useRef } from 'react'
import { FiX, FiUser, FiCalendar, FiActivity, FiSliders, FiImage, FiSave, FiCamera } from 'react-icons/fi'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const EMPTY_FORM = {
    measurement_date: new Date().toISOString().split('T')[0],
    weight_kg: '', height_cm: '', body_fat_pct: '', muscle_pct: '',
    neck_cm: '', chest_cm: '', waist_cm: '', hip_cm: '',
    right_arm_cm: '', right_leg_cm: '',
    photo_front_url: '', photo_side_url: '', photo_back_url: '',
    notes: ''
}

async function uploadToCloudinary(file) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'rafagym/measurements')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    return (await res.json()).secure_url
}

const ImageUploadField = ({ label, url, onUpload, onRemove }) => {
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef(null)

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const secureUrl = await uploadToCloudinary(file)
            onUpload(secureUrl)
        } catch (err) { alert("Error al subir la imagen") }
        finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    return (
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">{label}</label>
            {url ? (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--primary-500)' }}>
                    <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={onRemove} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <FiX size={14} />
                    </button>
                </div>
            ) : (
                <div onClick={() => !uploading && fileRef.current?.click()} style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'wait' : 'pointer', background: 'var(--dark-800)', color: 'var(--text-secondary)' }}>
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <div className="spinner spinner-md" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-400)' }}>Subiendo...</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <FiCamera size={20} color="var(--primary-400)" />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Añadir foto</span>
                        </>
                    )}
                </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
    )
}

export default function MeasurementFormModal({ selectedClient, onClose, onSave }) {
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            await onSave(form)
        } catch (err) {
            if (err.message?.includes('unique') || err.code === '23505')
                setError('Ya existe una medición para este cliente en esa fecha.')
            else setError(err.message || 'Error al guardar.')
        } finally { setSaving(false) }
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}>
            <div className="modal glass" style={{ maxWidth: 740, width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>
                <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Nueva Medición</h2>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiUser size={12} /> Cliente: <span style={{ color: 'var(--primary-400)', fontWeight: 700 }}>{selectedClient?.name}</span>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-icon" style={{ background: 'var(--dark-700)' }} onClick={onClose}><FiX size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                            <FiX size={16} /> {error}
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiCalendar size={14} /> Fecha de medición *</label>
                        <input type="date" className="form-input" required value={form.measurement_date} onChange={e => setForm(f => ({ ...f, measurement_date: e.target.value }))} style={{ maxWidth: 220 }} />
                    </div>

                    <div style={{ marginBottom: '2rem', background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiActivity size={16} /> Métricas principales
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Peso (kg) *</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="number" step="0.01" className="form-input" required placeholder="70.50" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} style={{ paddingRight: 40 }} />
                                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>kg</span>
                                </div>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">Altura (cm)</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="number" step="0.01" className="form-input" placeholder="170.0" value={form.height_cm} onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))} style={{ paddingRight: 40 }} />
                                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>cm</span>
                                </div>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">% Grasa</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="number" step="0.01" className="form-input" placeholder="18.5" value={form.body_fat_pct} onChange={e => setForm(f => ({ ...f, body_fat_pct: e.target.value }))} style={{ paddingRight: 35 }} />
                                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>%</span>
                                </div>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">% Músculo</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="number" step="0.01" className="form-input" placeholder="42.0" value={form.muscle_pct} onChange={e => setForm(f => ({ ...f, muscle_pct: e.target.value }))} style={{ paddingRight: 35 }} />
                                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem', background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiSliders size={16} /> Perímetros corporales (cm)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                            {[
                                { field: 'neck_cm', label: 'Cuello' }, { field: 'chest_cm', label: 'Pecho' },
                                { field: 'waist_cm', label: 'Cintura' }, { field: 'hip_cm', label: 'Cadera' },
                                { field: 'right_arm_cm', label: 'Brazo (Der)' }, { field: 'right_leg_cm', label: 'Pierna (Der)' }
                            ].map(({ field, label }) => (
                                <div key={field} className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">{label}</label>
                                    <input type="number" step="0.01" className="form-input" placeholder="—" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem', background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiImage size={16} /> Fotos de progreso
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                            <ImageUploadField label="Foto Frontal" url={form.photo_front_url} onUpload={url => setForm(f => ({ ...f, photo_front_url: url }))} onRemove={() => setForm(f => ({ ...f, photo_front_url: '' }))} />
                            <ImageUploadField label="Foto Perfil" url={form.photo_side_url} onUpload={url => setForm(f => ({ ...f, photo_side_url: url }))} onRemove={() => setForm(f => ({ ...f, photo_side_url: '' }))} />
                            <ImageUploadField label="Foto Espalda" url={form.photo_back_url} onUpload={url => setForm(f => ({ ...f, photo_back_url: url }))} onRemove={() => setForm(f => ({ ...f, photo_back_url: '' }))} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Notas Adicionales</label>
                        <textarea className="form-input" rows={3} placeholder='Ej: "Se tomó la medida en ayunas..."' value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem 1.5rem', fontWeight: 700, minWidth: 160, display: 'flex', justifyContent: 'center', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}>
                            {saving ? <><div className="spinner spinner-sm" style={{ marginRight: 8 }} /> Guardando...</> : <><FiSave style={{ marginRight: 8 }} /> Guardar medición</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}