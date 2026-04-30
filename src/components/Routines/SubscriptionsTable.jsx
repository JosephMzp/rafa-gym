import { FiUsers, FiX } from 'react-icons/fi'

const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }

export default function SubscriptionsTable({ subscriptions, templates, onUnsubscribe }) {
    if (subscriptions.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon"><FiUsers size={32} /></div>
                <div className="empty-state-title">No hay suscripciones activas</div>
            </div>
        )
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Rutina</th>
                        <th>Nivel</th>
                        <th>Suscrito desde</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {subscriptions.map(sub => {
                        const tmplLevel = templates.find(t => t.id === sub.template_id)?.level
                        const lColor = levelColor[tmplLevel] || '#94a3b8'

                        return (
                            <tr key={sub.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.875rem' }}>
                                            {sub.client?.name?.charAt(0) || '?'}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{sub.client?.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>{sub.template?.emoji}</span>
                                        <span style={{ fontWeight: 600, color: sub.template?.color }}>{sub.template?.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge" style={{ background: `${lColor}20`, color: lColor }}>
                                        {tmplLevel || '-'}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {new Date(sub.subscribed_at).toLocaleDateString('es-PE')}
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => onUnsubscribe(sub)}>
                                        <FiX size={14} /> Quitar
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}