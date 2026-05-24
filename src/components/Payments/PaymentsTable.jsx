import { FiPrinter } from 'react-icons/fi'
import { generarVoucherPDF } from '../../lib/pdfHelpers'

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
                        <th style={{ textAlign: 'center' }}>Acciones</th>
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
                            <td style={{ textAlign: 'center' }}>
                                <button
                                    title="Descargar comprobante PDF"
                                    onClick={() => generarVoucherPDF(p)}
                                    style={{
                                        display:         'inline-flex',
                                        alignItems:      'center',
                                        justifyContent:  'center',
                                        width:           '32px',
                                        height:          '32px',
                                        borderRadius:    'var(--radius-md)',
                                        border:          '1px solid var(--border-subtle)',
                                        background:      'var(--dark-800)',
                                        color:           'var(--text-secondary)',
                                        cursor:          'pointer',
                                        transition:      'background 0.18s, color 0.18s, border-color 0.18s, transform 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background   = 'rgba(139, 92, 246, 0.15)'
                                        e.currentTarget.style.color        = '#a78bfa'
                                        e.currentTarget.style.borderColor  = 'rgba(139, 92, 246, 0.5)'
                                        e.currentTarget.style.transform    = 'scale(1.1)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background   = 'var(--dark-800)'
                                        e.currentTarget.style.color        = 'var(--text-secondary)'
                                        e.currentTarget.style.borderColor  = 'var(--border-subtle)'
                                        e.currentTarget.style.transform    = 'scale(1)'
                                    }}
                                >
                                    <FiPrinter size={15} />
                                </button>
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