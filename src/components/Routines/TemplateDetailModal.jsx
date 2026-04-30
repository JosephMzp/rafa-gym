import { FiX, FiClock, FiTarget, FiEdit2, FiCalendar, FiZap } from 'react-icons/fi'

const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }
const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

export default function TemplateDetailModal({ template, exercises, subscribers, onClose, onEdit }) {
    if (!template) return null

    const lColor = levelColor[template.level] || '#94a3b8'
    const byDay = {}
    exercises.forEach(ex => {
        const day = ex.day || 'General'
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(ex)
    })

    return (
        <div className="modal-overlay" onClick={onClose} style={{ padding: '0', background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '95vh', overflow: 'hidden', padding: 0, borderRadius: '24px', background: 'var(--dark-800)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: `0 20px 60px -10px ${template.color}30, 0 0 0 1px rgba(255,255,255,0.05)` }}>

                {/* Hero Header */}
                <div style={{ position: 'relative', height: '180px', background: `linear-gradient(135deg, var(--dark-700) 0%, var(--dark-900) 100%)`, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '140%', height: '200%', background: `radial-gradient(ellipse at center, ${template.color}40 0%, transparent 60%)`, filter: 'blur(40px)', zIndex: 0 }}></div>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 'var(--space-lg)', display: 'flex', justifyContent: 'flex-end', zIndex: 2 }}>
                        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%' }}><FiX size={20} /></button>
                    </div>
                    <div style={{ position: 'absolute', bottom: '-40px', left: 'var(--space-2xl)', width: '100px', height: '100px', borderRadius: '30px', background: 'var(--dark-800)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 3 }}>
                        {template.emoji}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-2xl)', paddingTop: '3rem', overflowY: 'auto', maxHeight: 'calc(95vh - 180px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.5rem', background: `linear-gradient(to right, white, ${template.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {template.name}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="badge" style={{ background: `${lColor}20`, color: lColor, border: `1px solid ${lColor}40`, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>{template.level}</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}><FiClock size={13} style={{ marginRight: '0.25rem' }} /> {template.duration}</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}><FiTarget size={13} style={{ marginRight: '0.25rem' }} /> {template.objective}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => onEdit(template)} style={{ background: template.color, boxShadow: `0 4px 15px ${template.color}40`, border: 'none', borderRadius: '12px' }}>
                            <FiEdit2 /> Editar Plantilla
                        </button>
                    </div>

                    <div style={{ padding: 'var(--space-lg)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 'var(--space-2xl)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>{template.description}</p>
                    </div>

                    <div style={{ marginBottom: 'var(--space-2xl)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCalendar size={16} style={{ color: template.color }} /> Días de Entrenamiento
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {(template.days || []).map(d => (
                                <div key={d} style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${template.color}15`, border: `1px solid ${template.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: template.color, fontWeight: 700, fontSize: '0.875rem' }}>{d}</div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-lg)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiZap size={16} style={{ color: template.color }} /> Programa</h3>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{exercises.length} ejercicios en total</span>
                        </div>

                        {Object.keys(byDay).length === 0 && (
                            <div className="empty-state" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                <div className="empty-state-icon" style={{ fontSize: '2rem', opacity: 0.5 }}><FiTarget size={32} /></div>
                                <div className="empty-state-title" style={{ fontSize: '1rem' }}>Aún no hay ejercicios programados</div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                            {Object.keys(byDay).map(day => (
                                <div key={day}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-md)' }}>
                                        <div style={{ padding: '0.375rem 1rem', background: `${template.color}15`, color: template.color, borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.875rem' }}>Día {day}</div>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{byDay[day].length} ejercicios</div>
                                    </div>
                                    <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                                        {byDay[day].map((ex, i) => {
                                            const exData = ex.exercises || {}
                                            const mc = muscleColor[exData.muscle_group] || '#94a3b8'
                                            return (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: '1rem', borderRadius: '16px', background: 'var(--dark-700)', border: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <div style={{ width: '4px', height: '36px', borderRadius: '4px', background: mc }}></div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{exData.name}</div>
                                                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            <span style={{ color: mc }}>{exData.muscle_group}</span><span>•</span><span>{exData.equipment || 'Sin equipo'}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Series x Reps</div>
                                                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{ex.sets} <span style={{ color: 'var(--text-muted)' }}>×</span> {ex.reps}</div>
                                                        </div>
                                                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
                                                        <div style={{ width: '48px', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Desc</div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ex.rest_seconds}s</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {subscribers.length > 0 && (
                        <div style={{ marginTop: 'var(--space-3xl)' }}>
                            <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: 'var(--space-2xl)' }}></div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                                {subscribers.length} {subscribers.length === 1 ? 'cliente activo' : 'clientes activos'} entrenando con esta rutina
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                                {subscribers.map(s => (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem 0.25rem 0.25rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem', background: 'var(--dark-500)', fontWeight: 700, color: template.color }}>{s.client?.name?.charAt(0)}</div>
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{s.client?.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}