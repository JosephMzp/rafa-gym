import { FiMail, FiPhone, FiShield, FiEdit2, FiUserX, FiUserCheck } from 'react-icons/fi'
import { getOptimizedUrl } from '../../lib/cloudinary'

const getRoleColor = (roleName) => {
    switch (roleName) {
        case 'Administrador': return '#f59e0b'
        case 'Recepcionista': return '#3b82f6'
        case 'Entrenador': return '#10b981'
        default: return '#94a3b8'
    }
}

const getRoleIcon = (roleName) => {
    switch (roleName) {
        case 'Administrador': return '👑'
        case 'Recepcionista': return '🖥️'
        case 'Entrenador': return '🏋️'
        default: return '👤'
    }
}

export default function StaffGrid({ staff, onEdit, onToggleStatus }) {
    if (staff.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">No se encontraron empleados</div>
            </div>
        )
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
            {staff.map(member => {
                const roleName = member.roles?.name || 'N/A'
                const roleColor = getRoleColor(roleName)
                const roleIcon = getRoleIcon(roleName)

                return (
                    <div key={member.id} className="card" style={{
                        position: 'relative', opacity: member.active ? 1 : 0.6,
                        borderLeft: `3px solid ${roleColor}`, transition: 'all 0.2s ease'
                    }}>
                        {!member.active && (
                            <div style={{
                                position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)',
                                background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)',
                                padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.6875rem', fontWeight: 600
                            }}>INACTIVO</div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: 'var(--space-md)' }}>
                            {member.photo_url ? (
                                <img src={getOptimizedUrl(member.photo_url, { width: 120, height: 120 })} alt={member.name}
                                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${roleColor}40` }} />
                            ) : (
                                <div className="avatar" style={{
                                    width: 56, height: 56, fontSize: '1.25rem',
                                    background: `${roleColor}20`, color: roleColor, border: `2px solid ${roleColor}40`
                                }}>
                                    {member.name?.charAt(0)}
                                </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.125rem' }}>{member.name}</div>
                                <span className="badge" style={{ background: `${roleColor}18`, color: roleColor, fontWeight: 600, fontSize: '0.75rem' }}>
                                    {roleIcon} {roleName}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <FiMail size={14} color="var(--text-muted)" />
                                <span>{member.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <FiPhone size={14} color="var(--text-muted)" />
                                <span>{member.phone || 'Sin teléfono'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <FiShield size={14} color="var(--text-muted)" />
                                <span>Desde: {new Date(member.created_at).toLocaleDateString('es-PE')}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
                            <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => onEdit(member)}>
                                <FiEdit2 size={14} /> Editar
                            </button>
                            <button
                                className={`btn btn-sm ${member.active ? 'btn-danger' : 'btn-primary'}`}
                                style={{ flex: 1 }}
                                onClick={() => onToggleStatus(member)}
                            >
                                {member.active ? <><FiUserX size={14} /> Desactivar</> : <><FiUserCheck size={14} /> Activar</>}
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}