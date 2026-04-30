export default function PaymentsTable({ payments }) {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Fecha de Pago</th>
                        <th>Próximo Vencimiento</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.id}>
                            <td style={{ fontWeight: 500 }}>{p.client_name}</td>
                            <td style={{ fontSize: '0.875rem' }}>{p.concept}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary-400)' }}>S/ {Number(p.amount).toFixed(2)}</td>
                            <td><span className="badge badge-neutral">{p.method}</span></td>
                            <td style={{ fontSize: '0.875rem' }}>{p.date}</td>
                            <td style={{ fontSize: '0.875rem' }}>{p.next_due || '-'}</td>
                            <td>
                                <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                                    {p.status === 'paid' ? 'Pagado' : 'Vencido'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {payments.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-title" style={{ marginTop: '2rem' }}>No se encontraron pagos</div>
                </div>
            )}
        </div>
    )
}