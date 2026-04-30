import { FiCheckCircle, FiUser, FiClock } from 'react-icons/fi'

export default function AttendanceTabs({ attendances }) {
    // Cálculos de estadísticas
    const today = new Date().toISOString().split('T')[0]
    const todayCount = attendances.filter(a => a.date === today).length
    const uniqueToday = new Set(attendances.filter(a => a.date === today).map(a => a.client_id)).size

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                    <FiCheckCircle />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Ingresos Hoy</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{todayCount}</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                    <FiUser />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Clientes Únicos Hoy</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{uniqueToday}</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary-400)' }}>
                    <FiClock />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Total Registros</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{attendances.length}</div>
                </div>
            </div>
        </div>
    )
}