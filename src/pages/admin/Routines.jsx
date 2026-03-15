import { useState, useEffect } from 'react'
import { FiTarget, FiCalendar, FiUser } from 'react-icons/fi'
import { getRoutines } from '../../lib/services'

export default function Routines() {
    const [routines, setRoutines] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRoutines().then(setRoutines).catch(console.error).finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header"><div><h1 className="page-title">Rutinas</h1><p className="page-subtitle">Rutinas personalizadas asignadas por entrenadores</p></div></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
                {routines.map(r => (
                    <div key={r.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                            <div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700 }}>{r.client_name}</h3>
                                <span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ marginTop: '0.375rem' }}>
                                    {r.status === 'active' ? 'Activa' : 'Finalizada'}
                                </span>
                            </div>
                            <div className="avatar" style={{ width: 44, height: 44 }}>{r.client_name?.charAt(0)}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><FiTarget size={14} color="var(--primary-400)" /> <strong>Objetivo:</strong> {r.objective}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><FiUser size={14} color="var(--primary-400)" /> <strong>Entrenador:</strong> {r.trainer || r.trainer_name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><FiCalendar size={14} color="var(--primary-400)" /> <strong>Duración:</strong> {r.duration}</div>
                        </div>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nivel</span>
                            <div><span className={`badge ${r.level === 'Principiante' ? 'badge-success' : r.level === 'Intermedio' ? 'badge-warning' : 'badge-danger'}`}>{r.level}</span></div>
                        </div>
                        <div style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Días de entrenamiento</span>
                            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
                                {r.days?.map(d => <span key={d} className="badge badge-primary">{d}</span>)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
