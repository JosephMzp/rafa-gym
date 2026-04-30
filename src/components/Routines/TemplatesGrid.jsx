import { FiClock, FiTarget, FiUsers, FiEye, FiEdit2, FiTrash2, FiBookOpen } from 'react-icons/fi'

const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }

export default function TemplatesGrid({ templates, subscriptions, onView, onEdit, onDelete }) {
    if (templates.length === 0) {
        return (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon"><FiBookOpen size={32} /></div>
                <div className="empty-state-title">No se encontraron rutinas</div>
            </div>
        )
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
            {templates.map(tmpl => {
                const lColor = levelColor[tmpl.level] || '#94a3b8'
                const subCount = subscriptions.filter(s => s.template_id === tmpl.id).length

                return (
                    <div key={tmpl.id} className="card" style={{ borderTop: `3px solid ${tmpl.color}`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${tmpl.color}25` }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 52, height: 52, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${tmpl.color}20`, fontSize: '1.75rem', flexShrink: 0 }}>
                                    {tmpl.emoji}
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{tmpl.name}</h3>
                                    <span className="badge" style={{ background: `${lColor}20`, color: lColor, fontWeight: 600, fontSize: '0.6875rem' }}>{tmpl.level}</span>
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 'var(--space-md)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {tmpl.description}
                        </p>

                        <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                <FiTarget size={13} color={tmpl.color} /> <span>{tmpl.objective}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                <FiClock size={13} /> {tmpl.duration}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                <FiUsers size={13} /> {subCount} suscriptor{subCount !== 1 ? 'es' : ''}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                            {(tmpl.days || []).map(d => (
                                <span key={d} className="badge" style={{ background: `${tmpl.color}20`, color: tmpl.color, fontWeight: 700, fontSize: '0.6875rem' }}>{d}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
                            <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={() => onView(tmpl)}>
                                <FiEye size={13} /> Ver
                            </button>
                            <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => onEdit(tmpl)}>
                                <FiEdit2 size={13} /> Editar
                            </button>
                            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => onDelete(tmpl)}>
                                <FiTrash2 size={13} />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}