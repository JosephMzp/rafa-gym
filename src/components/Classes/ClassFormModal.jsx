import { useState, useEffect } from 'react'
import { FiX, FiSave, FiClock } from 'react-icons/fi'
import { DAY_ORDER, DAY_LABELS } from '../../lib/classHelpers'

const DAYS = DAY_ORDER.map(d => ({ key: d, label: DAY_LABELS[d] }))

const EMPTY = {
    name: '',
    instructor: '',
    location_id: '',
    capacity: '',
    price_standard: '',
    days_of_week: [],
    start_time: '',
    end_time: '',
    status: 'active',
}

export default function ClassFormModal({ cls, locations, onSave, onClose, saving }) {
    const [form, setForm] = useState(EMPTY)

    useEffect(() => {
        if (cls) {
            setForm({
                name:           cls.name           || '',
                instructor:     cls.instructor      || '',
                location_id:    cls.location_id     || '',
                capacity:       cls.capacity        || '',
                price_standard: cls.price_standard  || '',
                days_of_week:   cls.days_of_week    || [],
                start_time:     cls.start_time      ? cls.start_time.slice(0, 5) : '',
                end_time:       cls.end_time        ? cls.end_time.slice(0, 5) : '',
                status:         cls.status          || 'active',
            })
        }
    }, [cls])

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const toggleDay = (day) => {
        setForm(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day]
        }))
    }

    const isEditing = Boolean(cls?.id)
    const canSave = form.name.trim() && form.instructor.trim() && form.location_id &&
                    form.capacity && form.days_of_week.length > 0 && form.start_time && form.end_time

    const handleSubmit = () => {
        if (!canSave) return
        onSave({ ...form, id: cls?.id })
    }

    /* ── Styles ── */
    const labelStyle = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', display: 'block' }
    const inputStyle = { width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--dark-700)', color: 'var(--text-primary)', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }
    const rowStyle   = { display: 'grid', gap: 'var(--space-md)' }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEditing ? '✏️ Editar Clase' : '➕ Nueva Clase'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                    {/* Nombre e Instructor */}
                    <div style={{ ...rowStyle, gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group">
                            <label style={labelStyle}>Nombre *</label>
                            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Pilates Avanzado" />
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Instructor *</label>
                            <input style={inputStyle} value={form.instructor} onChange={e => set('instructor', e.target.value)} placeholder="Ej: Ana García" />
                        </div>
                    </div>

                    {/* Sede y Capacidad */}
                    <div style={{ ...rowStyle, gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group">
                            <label style={labelStyle}>Sede *</label>
                            <select style={inputStyle} value={form.location_id} onChange={e => set('location_id', e.target.value)}>
                                <option value="">Seleccionar sede…</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Capacidad *</label>
                            <input style={inputStyle} type="number" min={1} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="Ej: 20" />
                        </div>
                    </div>

                    {/* Días de la semana */}
                    <div className="form-group">
                        <label style={labelStyle}>Días de la semana *</label>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {DAYS.map(({ key, label }) => {
                                const active = form.days_of_week.includes(key)
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleDay(key)}
                                        style={{
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: 'var(--radius-full)',
                                            border: `1.5px solid ${active ? 'var(--primary-500)' : 'var(--border-default)'}`,
                                            background: active ? 'rgba(249,115,22,0.15)' : 'var(--dark-700)',
                                            color: active ? 'var(--primary-400)' : 'var(--text-secondary)',
                                            fontWeight: active ? 700 : 500,
                                            fontSize: '0.8125rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                        {form.days_of_week.length === 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.25rem', display: 'block' }}>
                                Selecciona al menos un día
                            </span>
                        )}
                    </div>

                    {/* Horario */}
                    <div style={{ ...rowStyle, gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group">
                            <label style={labelStyle}><FiClock size={12} style={{ marginRight: 4 }} />Hora inicio *</label>
                            <input style={inputStyle} type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}><FiClock size={12} style={{ marginRight: 4 }} />Hora fin *</label>
                            <input style={inputStyle} type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} />
                        </div>
                    </div>

                    {/* Precio y Estado */}
                    <div style={{ ...rowStyle, gridTemplateColumns: '1fr 1fr' }}>
                        <div className="form-group">
                            <label style={labelStyle}>Precio estándar (S/)</label>
                            <input style={inputStyle} type="number" min={0} step="0.01" value={form.price_standard} onChange={e => set('price_standard', e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Estado</label>
                            <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                                <option value="active">Activa</option>
                                <option value="inactive">Inactiva</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!canSave || saving}
                    >
                        {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Guardando…</> : <><FiSave size={14} /> {isEditing ? 'Guardar cambios' : 'Crear clase'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}
