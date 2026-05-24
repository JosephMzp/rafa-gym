import { useState, useRef } from 'react'
import { FiX, FiCalendar, FiActivity, FiSliders, FiSave, FiCamera, FiImage } from 'react-icons/fi'
import { uploadImage } from '../../lib/cloudinary'

const EMPTY_FORM = {
    measurement_date: new Date().toISOString().split('T')[0],
    weight_kg: '', height_cm: '', body_fat_pct: '', muscle_pct: '',
    neck_cm: '', chest_cm: '', waist_cm: '', hip_cm: '',
    right_arm_cm: '', right_leg_cm: '',
    photo_front_url: '', photo_side_url: '', photo_back_url: '',
    notes: ''
}

function NumericField({ label, field, placeholder, unit, required = false, form, onChange }) {
    return (
        <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
                {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    required={required}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={e => onChange(field, e.target.value)}
                    style={{ paddingRight: unit ? 40 : undefined }}
                />
                {unit && (
                    <span style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, pointerEvents: 'none'
                    }}>
                        {unit}
                    </span>
                )}
            </div>
        </div>
    )
}

function PhotoUploadField({ label, url, onUpload, onRemove }) {
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef(null)

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const { url: secureUrl } = await uploadImage(file, 'rafagym/measurements')
            onUpload(secureUrl)
        } catch {
            alert('Error al subir la imagen. Inténtalo de nuevo.')
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    return (
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
            <label className="form-label" style={{ marginBottom: 8 }}>{label}</label>

            {url ? (
                /* Vista previa */
                <div style={{
                    position: 'relative', width: '100%', aspectRatio: '3/4',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    border: '2px solid var(--primary-500)',
                    boxShadow: '0 4px 20px rgba(139,92,246,0.25)'
                }}>
                    <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Eliminar foto"
                        style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none',
                            borderRadius: '50%', width: 26, height: 26,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', backdropFilter: 'blur(4px)'
                        }}
                    >
                        <FiX size={13} />
                    </button>
                    {/* Label superpuesto */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        padding: '1rem 0.5rem 0.5rem',
                        fontSize: '0.72rem', color: '#fff', fontWeight: 700, textAlign: 'center'
                    }}>
                        {label}
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    style={{
                        width: '100%', aspectRatio: '3/4',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px dashed var(--border-subtle)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: uploading ? 'wait' : 'pointer',
                        background: 'var(--dark-800)',
                        color: 'var(--text-secondary)',
                        transition: 'border-color 0.2s, background 0.2s'
                    }}
                    onMouseEnter={e => {
                        if (!uploading) {
                            e.currentTarget.style.borderColor = 'var(--primary-500)'
                            e.currentTarget.style.background = 'rgba(139,92,246,0.05)'
                        }
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)'
                        e.currentTarget.style.background = 'var(--dark-800)'
                    }}
                >
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <div className="spinner spinner-md" style={{ color: 'var(--primary-400)' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-400)' }}>
                                Subiendo...
                            </span>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                width: 42, height: 42, borderRadius: '50%',
                                background: 'rgba(139,92,246,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 10
                            }}>
                                <FiCamera size={20} color="var(--primary-400)" />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {label}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                Clic para subir
                            </span>
                        </>
                    )}
                </div>
            )}

            <input
                type="file"
                ref={fileRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
            />
        </div>
    )
}

export default function ClientMeasurementFormModal({ onClose, onSave }) {
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            await onSave(form)
        } catch (err) {
            if (err.message?.includes('unique') || err.code === '23505')
                setError('Ya existe una medición para este día. Cambia la fecha.')
            else
                setError(err.message || 'Error al guardar. Inténtalo de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}
        >
            <div
                className="modal glass"
                style={{ maxWidth: 700, width: '95%', maxHeight: '92vh', overflowY: 'auto', padding: 0 }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header sticky ── */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'var(--surface-glass)', backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-subtle)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>
                            📏 Registrar Nueva Medida
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                            Los datos se guardan en tu historial privado
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-icon" style={{ background: 'var(--dark-700)' }} onClick={onClose}>
                        <FiX size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {/* Error */}
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                            borderRadius: 'var(--radius-md)', padding: '12px 16px',
                            color: '#f87171', marginBottom: '1.5rem', fontSize: '0.875rem',
                            display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500
                        }}>
                            <FiX size={16} /> {error}
                        </div>
                    )}

                    {/* ── Fecha ── */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiCalendar size={14} /> Fecha de medición <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            required
                            value={form.measurement_date}
                            onChange={e => handleChange('measurement_date', e.target.value)}
                            style={{ maxWidth: 220 }}
                        />
                    </div>

                    {/* ── Métricas principales ── */}
                    <div style={{
                        marginBottom: '1.5rem', background: 'var(--dark-800)',
                        padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase',
                            letterSpacing: '0.05em', color: 'var(--primary-400)',
                            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <FiActivity size={15} /> Métricas principales
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                            <NumericField label="Peso" field="weight_kg" placeholder="70.50" unit="kg" required form={form} onChange={handleChange} />
                            <NumericField label="Altura" field="height_cm" placeholder="170.0" unit="cm" form={form} onChange={handleChange} />
                            <NumericField label="% Grasa" field="body_fat_pct" placeholder="18.5" unit="%" form={form} onChange={handleChange} />
                            <NumericField label="% Músculo" field="muscle_pct" placeholder="42.0" unit="%" form={form} onChange={handleChange} />
                        </div>
                    </div>

                    {/* ── Perímetros corporales ── */}
                    <div style={{
                        marginBottom: '1.5rem', background: 'var(--dark-800)',
                        padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase',
                            letterSpacing: '0.05em', color: 'var(--primary-400)',
                            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <FiSliders size={15} /> Perímetros corporales
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                                (opcional)
                            </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                            <NumericField label="Cuello" field="neck_cm" placeholder="—" unit="cm" form={form} onChange={handleChange} />
                            <NumericField label="Pecho" field="chest_cm" placeholder="—" unit="cm" form={form} onChange={handleChange} />
                            <NumericField label="Cintura" field="waist_cm" placeholder="—" unit="cm" form={form} onChange={handleChange} />
                            <NumericField label="Cadera" field="hip_cm" placeholder="—" unit="cm" form={form} onChange={handleChange} />
                            <NumericField label="Brazo (Der)" field="right_arm_cm" placeholder="—" unit="cm" form={form} onChange={handleChange} />
                            <NumericField label="Pierna (Der)" field="right_leg_cm" placeholder="—" unit="cm" form={form} onChange={handleChange} />
                        </div>
                    </div>

                    {/* ── Fotos de progreso ── */}
                    <div style={{
                        marginBottom: '1.5rem', background: 'var(--dark-800)',
                        padding: '1.25rem', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{
                            fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase',
                            letterSpacing: '0.05em', color: 'var(--primary-400)',
                            marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <FiImage size={15} /> Fotos de progreso
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                                (opcional)
                            </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16, marginTop: 4 }}>
                            Las fotos se suben directamente a la nube y solo tú puedes verlas.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <PhotoUploadField
                                label="Foto Frontal"
                                url={form.photo_front_url}
                                onUpload={url => handleChange('photo_front_url', url)}
                                onRemove={() => handleChange('photo_front_url', '')}
                            />
                            <PhotoUploadField
                                label="Foto Perfil"
                                url={form.photo_side_url}
                                onUpload={url => handleChange('photo_side_url', url)}
                                onRemove={() => handleChange('photo_side_url', '')}
                            />
                            <PhotoUploadField
                                label="Foto Espalda"
                                url={form.photo_back_url}
                                onUpload={url => handleChange('photo_back_url', url)}
                                onRemove={() => handleChange('photo_back_url', '')}
                            />
                        </div>
                    </div>

                    {/* ── Notas ── */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Notas adicionales</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            placeholder='Ej: "Medición en ayunas, después del entrenamiento..."'
                            value={form.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    {/* ── Acciones ── */}
                    <div style={{
                        display: 'flex', gap: '1rem', justifyContent: 'flex-end',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '1.25rem', marginTop: '0.5rem'
                    }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                            style={{ minWidth: 160, justifyContent: 'center', boxShadow: '0 4px 15px rgba(139,92,246,0.4)' }}
                        >
                            {saving
                                ? <><div className="spinner spinner-sm" style={{ marginRight: 8 }} /> Guardando...</>
                                : <><FiSave style={{ marginRight: 8 }} /> Guardar medida</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
