import { FiMapPin, FiClock, FiList } from 'react-icons/fi'

export default function AttendanceTable({ attendances }) {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Membresía</th>
                        <th>Sede</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                    </tr>
                </thead>
                <tbody>
                    {attendances.map(a => (
                        <tr key={a.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                        {a.client_name?.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{a.client_name}</span>
                                </div>
                            </td>
                            <td>
                                <span className="badge badge-primary">{a.membership_type || '-'}</span>
                            </td>
                            <td style={{ fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <FiMapPin size={13} color="var(--text-muted)" />
                                    {a.location_name?.replace('RafaGym - ', '')}
                                </div>
                            </td>
                            <td style={{ fontSize: '0.875rem' }}>{a.date}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
                                    <FiClock size={14} /> {a.time}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {attendances.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon"><FiList size={32} /></div>
                    <div className="empty-state-title">No hay registros de asistencia</div>
                </div>
            )}
        </div>
    )
}