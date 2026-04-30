import { FiZap } from 'react-icons/fi'

export default function AssignedRoutineCard({ routine, onSelectExercise }) {
    if (!routine) return null

    return (
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.05))', borderColor: 'var(--primary-500)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
                    <FiZap size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        Rutina Asignada por Entrenador
                    </h2>
                    <span style={{ color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600 }}>Plan Personalizado</span>
                </div>
            </div>

            {routine.notes && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', background: 'var(--dark-800)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    "{routine.notes}"
                </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {(routine.routine_exercises || []).map((rx) => {
                    const ex = rx.exercises || {}
                    return (
                        <div key={rx.id} style={{
                            background: 'var(--surface-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
                            cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                        }}
                            onClick={() => onSelectExercise(ex)}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>{ex.name}</h4>
                                <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, color: 'var(--text-muted)' }}>
                                    {ex.muscle_group}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <span><strong>{rx.sets}</strong> series</span>
                                <span><strong>{rx.reps}</strong> reps</span>
                                {rx.rest_time && <span><strong>{rx.rest_time}s</strong> rest</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}