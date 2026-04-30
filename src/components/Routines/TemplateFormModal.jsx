import { useState, useEffect } from 'react'
import { FiX, FiEdit2, FiPlus } from 'react-icons/fi'
import { getExercises, getTemplateExercises } from '../../lib/services'

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado']
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom']
const EMOJIS = ['💪', '🔥', '🏃', '⚡', '🍑', '🏋️', '🌿', '🎯', '🏅', '💥', '🎽', '🧘']
const COLORS = ['#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#f97316']

export default function TemplateFormModal({ template, onSave, onClose }) {
    const [name, setName] = useState(template?.name || '')
    const [description, setDescription] = useState(template?.description || '')
    const [objective, setObjective] = useState(template?.objective || '')
    const [level, setLevel] = useState(template?.level || LEVELS[0])
    const [duration, setDuration] = useState(template?.duration || '')
    const [days, setDays] = useState(template?.days || [])
    const [emoji, setEmoji] = useState(template?.emoji || '💪')
    const [color, setColor] = useState(template?.color || '#8b5cf6')
    const [exList, setExList] = useState([])
    const [allExercises, setAllExercises] = useState([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const exs = await getExercises()
                setAllExercises(exs)
                if (template) {
                    const existing = await getTemplateExercises(template.id)
                    setExList(existing.map(ex => ({
                        exercise_id: ex.exercise_id, day: ex.day || '', sets: ex.sets || 3,
                        reps: ex.reps || '', rest_seconds: ex.rest_seconds || 60, order_index: ex.order_index || 1,
                        _name: ex.exercises?.name || '', _muscle: ex.exercises?.muscle_group || ''
                    })))
                }
            } catch (err) { console.error(err) }
            finally { setLoadingData(false) }
        }
        load()
    }, [template])

    function toggleDay(d) { setDays(days.includes(d) ? days.filter(x => x !== d) : [...days, d]) }

    function addExercise() {
        if (!allExercises.length) return
        const first = allExercises[0]
        setExList([...exList, {
            exercise_id: first.id, day: days[0] || 'Lun', sets: 3, reps: '10-12', rest_seconds: 60,
            order_index: exList.length + 1, _name: first.name, _muscle: first.muscle_group
        }])
    }

    function updateEx(i, field, val) {
        setExList(exList.map((item, idx) => {
            if (idx !== i) return item
            const copy = { ...item, [field]: val }
            if (field === 'exercise_id') {
                const found = allExercises.find(e => e.id === val)
                if (found) { copy._name = found.name; copy._muscle = found.muscle_group }
            }
            return copy
        }))
    }

    if (loadingData) return <div className="modal-overlay"><div className="modal" style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner spinner-lg"></div></div></div>

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '92vh', overflow: 'auto' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{template ? <><FiEdit2 size={18} style={{ marginRight: '0.375rem' }} />Editar Plantilla</> : <><FiPlus size={18} style={{ marginRight: '0.375rem' }} />Nueva Plantilla de Rutina</>}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'flex', gap: 'var(--space-xl)', marginBottom: 'var(--space-lg)', alignItems: 'flex-start' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Ícono</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', maxWidth: 200 }}>
                                {EMOJIS.map(e => (
                                    <button key={e} type="button" onClick={() => setEmoji(e)} style={{ width: 36, height: 36, fontSize: '1.25rem', borderRadius: '8px', border: '2px solid', borderColor: emoji === e ? color : 'var(--border-subtle)', background: emoji === e ? `${color}20` : 'var(--dark-600)', cursor: 'pointer' }}>{e}</button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Color</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', maxWidth: 160 }}>
                                {COLORS.map(c => (
                                    <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? `3px solid white` : '3px solid transparent', outline: color === c ? `2px solid ${c}` : 'none' }} />
                                ))}
                            </div>
                        </div>
                        <div style={{ width: 72, height: 72, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}20`, fontSize: '2.5rem', flexShrink: 0, border: `2px solid ${color}40` }}>{emoji}</div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Quema Grasa Total" /></div>
                        <div className="form-group"><label className="form-label">Objetivo</label><input className="form-input" value={objective} onChange={e => setObjective(e.target.value)} placeholder="Pérdida de peso, ganar músculo..." /></div>
                        <div className="form-group"><label className="form-label">Nivel</label><select className="form-input" value={level} onChange={e => setLevel(e.target.value)}>{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                        <div className="form-group"><label className="form-label">Duración</label><input className="form-input" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ej: 8 semanas" /></div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}><label className="form-label">Descripción</label><textarea className="form-input" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe brevemente esta rutina..." style={{ resize: 'vertical' }} /></div>
                    <div className="form-group"><label className="form-label">Días de entrenamiento</label><div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>{DAYS.map(d => (<button key={d} type="button" className={`btn btn-sm ${days.includes(d) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleDay(d)}>{d}</button>))}</div></div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Ejercicios ({exList.length})</h3>
                            <button className="btn btn-sm btn-primary" type="button" onClick={addExercise}><FiPlus size={13} /> Agregar</button>
                        </div>
                        {exList.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>Agrega ejercicios a esta rutina</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {exList.map((item, i) => (
                                <div key={i} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', background: 'var(--dark-600)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>#{i + 1} {item._muscle || ''}</span>
                                        <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--danger)' }} type="button" onClick={() => setExList(exList.filter((_, idx) => idx !== i))}><FiX size={13} /></button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                        <select className="form-input" value={item.exercise_id} onChange={e => updateEx(i, 'exercise_id', e.target.value)} style={{ fontSize: '0.875rem' }}>{allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle_group})</option>)}</select>
                                        <select className="form-input" value={item.day} onChange={e => updateEx(i, 'day', e.target.value)} style={{ fontSize: '0.875rem', width: 90 }}>{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                                        <div><label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Series</label><input className="form-input" type="number" min="1" max="10" value={item.sets} onChange={e => updateEx(i, 'sets', parseInt(e.target.value) || 0)} style={{ fontSize: '0.875rem' }} /></div>
                                        <div><label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Repeticiones</label><input className="form-input" value={item.reps} onChange={e => updateEx(i, 'reps', e.target.value)} placeholder="8-12" style={{ fontSize: '0.875rem' }} /></div>
                                        <div><label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Descanso (s)</label><input className="form-input" type="number" min="0" value={item.rest_seconds} onChange={e => updateEx(i, 'rest_seconds', parseInt(e.target.value) || 0)} style={{ fontSize: '0.875rem' }} /></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => onSave({ name, description, objective, level, duration, days, emoji, color }, exList)} disabled={!name}>
                        {template ? 'Guardar Cambios' : <><FiPlus size={14} style={{ marginRight: '0.25rem' }} /> Crear Plantilla</>}
                    </button>
                </div>
            </div>
        </div>
    )
}