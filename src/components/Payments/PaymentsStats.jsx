import { FiDollarSign, FiAlertTriangle } from 'react-icons/fi'

export default function PaymentsStats({ payments }) {
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
    const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0)

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                    <FiDollarSign />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Total Cobrado</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>S/ {totalPaid.toFixed(0)}</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                    <FiAlertTriangle />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Total Vencido</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>S/ {totalOverdue.toFixed(0)}</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                    <FiDollarSign />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Total Pagos</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{payments.length}</div>
                </div>
            </div>
        </div>
    )
}