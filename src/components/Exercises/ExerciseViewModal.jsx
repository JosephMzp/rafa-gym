import { FiX, FiActivity, FiTool, FiTarget, FiFileText, FiEdit2 } from 'react-icons/fi'

const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_auto,q_auto,f_auto/`)
}

export default function ExerciseViewModal({ exercise, onClose, onEdit }) {
    if (!exercise) return null

    const color = muscleColor[exercise.muscle_group] || '#94a3b8'

    return (
        <div className="modal-overlay" style={{ zIndex: 1100, padding: 'var(--space-md)' }} onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                    <button onClick={onClose} style={{
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.transform = 'scale(1.05)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'scale(1)' }}>
                        <FiX size={18} />
                    </button>
                </div>

                <div style={{ width: '100%', background: exercise.video_url || exercise.image_url ? '#000' : `linear-gradient(135deg, ${color}40, ${color}10)`, position: 'relative' }}>
                    {exercise.video_url ? (
                        <video src={exercise.video_url} controls autoPlay muted loop style={{ width: '100%', maxHeight: 320, minHeight: 200, objectFit: 'contain', display: 'block', borderBottom: `2px solid ${color}40` }} />
                    ) : exercise.image_url ? (
                        <img src={optimizeUrl(exercise.image_url, 800, 600)} alt={exercise.name} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block', borderBottom: `2px solid ${color}40` }} />
                    ) : (
                        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `2px solid ${color}40` }}>
                            <FiActivity size={64} style={{ opacity: 0.3, color }} />
                        </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, var(--surface-card) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
                </div>

                <div style={{ padding: '0 var(--space-xl) var(--space-xl)', background: 'var(--surface-card)', marginTop: '-1rem', position: 'relative', zIndex: 5 }}>
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--dark-700)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                #{exercise.id ? exercise.id.substring(0, 8).toUpperCase() : 'N/A'}
                            </span>
                            {exercise.created_at && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Registrado: {new Date(exercise.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.2 }}>{exercise.name}</h2>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></div>
                                    {exercise.muscle_group}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        <div style={{ background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ background: 'var(--dark-500)', width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}><FiTool size={20} /></div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Equipo</div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exercise.equipment || 'Ninguno'}</div>
                            </div>
                        </div>
                        <div style={{ background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ background: 'var(--dark-500)', width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}><FiTarget size={20} /></div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Carga Base</div>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exercise.sets_recommended} series × {exercise.reps_recommended}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface-base)', borderLeft: `3px solid ${color}`, padding: 'var(--space-md) var(--space-lg)', borderRadius: '0 var(--radius-md) var(--radius-md) 0', marginBottom: 'var(--space-xs)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <FiFileText size={14} /> Instrucciones
                        </div>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                            {exercise.description || 'No hay instrucciones detalladas para este ejercicio.'}
                        </p>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-md) var(--space-xl)', background: 'var(--surface-base)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    {onEdit && (
                        <button className="btn" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, color: 'white', border: 'none', boxShadow: `0 4px 14px 0 ${color}40` }} onClick={() => onEdit(exercise)}>
                            <FiEdit2 /> Editar Ejercicio
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}