import { FiUsers, FiAward, FiUser, FiClock } from 'react-icons/fi'

export default function ClassesEnrollment({
    membershipName, allClasses, user, enrollMsg, enrolling, handleEnroll
}) {
    if (membershipName !== 'Fit' && membershipName !== 'Gold') return null

    return (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <FiUsers color="#8b5cf6" /> Clases Grupales Disponibles
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)', background: membershipName === 'Gold' ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)', color: membershipName === 'Gold' ? '#f59e0b' : '#8b5cf6', border: '1px solid currentColor' }}>
                    <FiAward size={16} /> {membershipName} — Acceso Gratis
                </span>
            </div>

            {enrollMsg && (
                <div style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', background: enrollMsg.startsWith('⚠') ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)', color: enrollMsg.startsWith('⚠') ? '#f59e0b' : '#10b981', fontSize: '0.875rem', fontWeight: 600, border: '1px solid ' + (enrollMsg.startsWith('⚠') ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)') }}>
                    {enrollMsg}
                </div>
            )}

            {allClasses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No hay clases activas disponibles</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {allClasses.map(cls => {
                        const enrolledCount = (cls.class_enrollments || []).length
                        const alreadyEnrolled = (cls.class_enrollments || []).some(e => e.client_id === user.id)
                        const isFull = enrolledCount >= cls.capacity && !alreadyEnrolled
                        const pct = Math.min(100, Math.round((enrolledCount / cls.capacity) * 100))
                        const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981'

                        return (
                            <div key={cls.id} style={{ borderRadius: 'var(--radius-md)', padding: '1rem', background: alreadyEnrolled ? 'rgba(139,92,246,0.08)' : 'var(--dark-700)', border: '1px solid ' + (alreadyEnrolled ? '#8b5cf6' : 'var(--border-subtle)'), transition: 'border-color 0.2s, background 0.2s', opacity: isFull ? 0.6 : 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{cls.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {cls.instructor && <span><FiUser size={10} style={{ marginRight: 2, verticalAlign: 'middle' }} /> {cls.instructor} · </span>}
                                            {cls.location?.name}
                                        </div>
                                    </div>
                                    {alreadyEnrolled && (
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(139,92,246,0.25)', color: '#8b5cf6', whiteSpace: 'nowrap' }}>
                                            ✓ Inscrito
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
                                    <FiClock size={12} style={{ marginRight: 3, verticalAlign: 'middle' }} /> {cls.schedule}
                                </div>
                                <div style={{ marginBottom: '0.625rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        <span>Ocupación</span><span style={{ color: barColor, fontWeight: 700 }}>{enrolledCount}/{cls.capacity}</span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 2, background: 'var(--dark-500)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                                    </div>
                                </div>
                                <button onClick={() => handleEnroll(cls)} disabled={isFull || enrolling}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.8125rem', cursor: isFull ? 'not-allowed' : 'pointer', border: 'none', transition: 'all 0.2s', background: isFull ? 'var(--dark-500)' : alreadyEnrolled ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.2)', color: isFull ? 'var(--text-muted)' : alreadyEnrolled ? '#ef4444' : '#8b5cf6' }}>
                                    {isFull ? 'Clase Llena' : alreadyEnrolled ? '✕ Cancelar Matrícula' : '+ Matricularme'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}