import { FiX, FiTrash2, FiUserPlus } from 'react-icons/fi'

export default function ClassViewModal({ cls, enrollments, loading, onClose, onUnenroll, onOpenEnroll }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Inscritos - {cls.name}</h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                            {cls.enrolled}/{cls.capacity} inscritos
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner spinner-lg"></div></div>
                    ) : enrollments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                            No hay clientes inscritos en esta clase
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {enrollments.map((enr, idx) => (
                                <div key={enr.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                                    background: 'var(--dark-600)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 20 }}>{idx + 1}</span>
                                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                            {(enr.client?.name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{enr.client?.name}</div>
                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                                {new Date(enr.enrolled_at).toLocaleDateString('es-PE')}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--danger)' }}
                                        onClick={() => onUnenroll(enr.id)} title="Retirar">
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    <button className="btn btn-primary" onClick={onOpenEnroll}>
                        <FiUserPlus size={14} /> Matricular Nuevo
                    </button>
                </div>
            </div>
        </div>
    )
}