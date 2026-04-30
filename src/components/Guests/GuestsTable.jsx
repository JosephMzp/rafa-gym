import { FiList } from 'react-icons/fi'

export default function GuestsTable({ guests }) {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Invitado</th>
                        <th>Documento</th>
                        <th>Anfitrión</th>
                        <th>Fecha</th>
                        <th>Sede</th>
                    </tr>
                </thead>
                <tbody>
                    {guests.map(g => (
                        <tr key={g.id}>
                            <td style={{ fontWeight: 500 }}>{g.name}</td>
                            <td>{g.document}</td>
                            <td><span className="badge badge-primary">{g.host_name}</span></td>
                            <td>{g.date || g.visit_date}</td>
                            <td>{g.location_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {guests.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon"><FiList size={32} /></div>
                    <div className="empty-state-title">No hay invitados registrados</div>
                </div>
            )}
        </div>
    )
}