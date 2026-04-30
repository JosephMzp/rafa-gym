import { FiActivity, FiClock, FiTarget, FiZap } from 'react-icons/fi'

const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }
const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

export default function RoutineDetail({
    template, byDay, exercisesCount, isSubscribed, acting,
    loadingExs, onToggle, onSelectExercise
}) {
    if (!template) {
        return (
            <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <FiActivity size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Explora Programas</h3>
                    <p>Selecciona una rutina de la lista para ver sus detalles e inscribirte.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {/* Cabecera de la plantilla */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${template.color}40, ${template.color}10)`, fontSize: '2.5rem', border: `1px solid ${template.color}40` }}>
                    {template.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 250 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                        {template.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span className="badge" style={{ background: `${levelColor[template.level] || '#94a3b8'}20`, color: levelColor[template.level] || '#94a3b8', fontWeight: 700, padding: '4px 10px' }}>
                            {template.level}
                        </span>
                        <span className="badge badge-neutral" style={{ padding: '4px 10px' }}>
                            <FiClock size={12} style={{ marginRight: 4 }} />{template.duration}
                        </span>
                        <span className="badge badge-neutral" style={{ padding: '4px 10px' }}>
                            <FiTarget size={12} style={{ marginRight: 4 }} />{template.objective}
                        </span>
                    </div>
                </div>
                <button
                    className={`btn btn-lg ${isSubscribed ? 'btn-danger' : 'btn-primary'}`}
                    disabled={acting}
                    onClick={() => onToggle(template)}
                    style={{ whiteSpace: 'nowrap' }}>
                    {acting ? 'Procesando...' : isSubscribed ? '✕ Cancelar Suscripción' : '+ Iniciar Programa'}
                </button>
            </div>

            <div style={{ background: 'var(--dark-800)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Acerca del programa</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                    {template.description}
                </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Programa de Entrenamiento</h4>
            </div>

            {loadingExs ? (
                <div className="spinner spinner-lg" style={{ margin: '3rem auto' }}></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {Object.keys(byDay).map(day => (
                        <div key={day} style={{ background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                            <h5 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8, color: template.color }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: template.color }} />
                                {day}
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {byDay[day].map((ex, i) => {
                                    const exData = ex.exercises || {}
                                    const mc = muscleColor[exData.muscle_group] || '#94a3b8'
                                    return (
                                        <div key={i}
                                            onClick={() => onSelectExercise(exData)}
                                            style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                                background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = template.color || 'var(--primary-400)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{exData.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{exData.muscle_group}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {ex.sets} <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 500 }}>SERIES</span>
                                                </span>
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {ex.reps} <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 500 }}>REPS</span>
                                                </span>
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                    {ex.rest_time}s <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 500 }}>DESCANSO</span>
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}