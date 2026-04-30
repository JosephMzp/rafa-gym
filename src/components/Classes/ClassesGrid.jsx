import { FiUsers, FiClock, FiMapPin, FiEye, FiUserPlus } from 'react-icons/fi'

export default function ClassesGrid({ classes, onView, onEnroll }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
            {classes.map(cls => {
                const fill = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0
                return (
                    <div key={cls.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                            <div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>{cls.name}</h3>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    Instructor: {cls.instructor}
                                </div>
                            </div>
                            <span className={`badge ${cls.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                                {cls.status === 'active' ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <FiClock size={14} /> {cls.schedule}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <FiMapPin size={14} /> {cls.location_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <FiUsers size={14} /> {cls.enrolled}/{cls.capacity} inscritos
                            </div>
                        </div>
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Ocupación</span>
                                <span style={{ fontWeight: 600, color: fill >= 90 ? 'var(--danger)' : fill >= 70 ? 'var(--warning)' : 'var(--success)' }}>{fill}%</span>
                            </div>
                            <div style={{ height: 6, background: 'var(--dark-500)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${fill}%`,
                                    background: fill >= 90 ? 'var(--danger)' : fill >= 70 ? 'var(--warning)' : 'var(--success)',
                                    borderRadius: 3, transition: 'width var(--transition-base)'
                                }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Precio Estándar: </span>
                                <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>S/ {Number(cls.price_standard).toFixed(0)}</span>
                            </div>
                            <span className="badge badge-info">Fit/Gold: Gratis</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={() => onView(cls)}>
                                <FiEye size={14} /> Ver Inscritos
                            </button>
                            <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => onEnroll(cls)}
                                disabled={cls.enrolled >= cls.capacity}>
                                <FiUserPlus size={14} /> Matricular
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}