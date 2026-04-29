// src/components/clients/ClientsTable.jsx
import { FiEye, FiEdit2, FiUserX, FiUserCheck } from 'react-icons/fi'
import { getOptimizedUrl } from '../../lib/cloudinary'

export default function ClientsTable({
    clients,
    onViewDetail,
    onEditClient,
    onToggleStatus
}) {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Documento</th>
                        <th>Membresía</th>
                        <th>Sede</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(c => (
                        <tr key={c.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {c.photo_url ? (
                                        <img src={getOptimizedUrl(c.photo_url, { width: 80, height: 80 })} alt={c.name}
                                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="avatar">{c.name?.charAt(0)}</div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{c.document}</td>
                            <td>
                                <span className="badge" style={{
                                    background: `${c.membership_type?.color || '#94a3b8'}20`,
                                    color: c.membership_type?.color || '#94a3b8'
                                }}>
                                    {c.membership_type?.name || 'Sin membresía'}
                                </span>
                            </td>
                            <td style={{ fontSize: '0.8125rem' }}>{c.location_name?.replace('RafaGym - ', '')}</td>
                            <td style={{ fontSize: '0.875rem' }}>{c.membership_end || '-'}</td>
                            <td>
                                <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                    {c.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-ghost btn-icon" onClick={() => onViewDetail(c)} title="Ver detalle">
                                        <FiEye size={16} />
                                    </button>
                                    <button className="btn btn-ghost btn-icon" onClick={() => onEditClient(c)} title="Editar">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button className="btn btn-ghost btn-icon" onClick={() => onToggleStatus(c)} title={c.status === 'active' ? 'Desactivar' : 'Activar'}>
                                        {c.status === 'active' ? <FiUserX size={16} color="var(--danger)" /> : <FiUserCheck size={16} color="var(--success)" />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {clients.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No se encontraron clientes</div>
                </div>
            )}
        </div>
    )
}