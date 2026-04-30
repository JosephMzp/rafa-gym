import { FiX, FiSearch, FiTrash2, FiAward, FiUserPlus } from 'react-icons/fi'

export default function ClassEnrollModal({
    cls, enrollments, availableClients, loading, enrolling,
    enrollSearch, onSearchChange, onClose, onEnroll, onUnenroll
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, maxHeight: '85vh', overflow: 'auto' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Matricular en {cls.name}</h2>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                            Solo clientes con membresía Fit o Gold (gratis)
                        </p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner spinner-lg"></div></div>
                    ) : (
                        <>
                            {/* Lista de inscritos actuales */}
                            {enrollments.length > 0 && (
                                <div style={{ marginBottom: 'var(--space-xl)' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
                                        Inscritos Actualmente ({enrollments.length})
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {enrollments.map(enr => (
                                            <div key={enr.id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-600)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.6875rem' }}>
                                                        {(enr.client?.name || '?').charAt(0)}
                                                    </div>
                                                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{enr.client?.name}</span>
                                                </div>
                                                <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--danger)' }}
                                                    onClick={() => onUnenroll(enr.id)} title="Retirar">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Búsqueda y lista de disponibles */}
                            <div>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
                                    Agregar Cliente Fit/Gold
                                </h3>
                                <div className="search-bar" style={{ marginBottom: 'var(--space-md)' }}>
                                    <span className="search-bar-icon"><FiSearch /></span>
                                    <input placeholder="Buscar cliente Fit o Gold..." value={enrollSearch}
                                        onChange={e => onSearchChange(e.target.value)} />
                                </div>
                                {availableClients.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>
                                        No hay clientes disponibles para matricular
                                    </p>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {availableClients.map(client => {
                                        const mtColor = client.membership_type === 'Gold' ? '#f59e0b' : '#8b5cf6'
                                        return (
                                            <div key={client.id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                                                background: 'var(--dark-600)', border: '1px solid var(--border-subtle)',
                                                transition: 'border-color 0.2s'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{client.name}</div>
                                                        <span className="badge" style={{
                                                            background: mtColor + '20', color: mtColor,
                                                            fontWeight: 600, fontSize: '0.625rem'
                                                        }}>
                                                            <FiAward size={10} /> {client.membership_type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button className="btn btn-sm btn-primary" onClick={() => onEnroll(client.id)}
                                                    disabled={enrolling}>
                                                    <FiUserPlus size={14} /> Matricular
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}