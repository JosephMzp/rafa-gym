import { FiUser, FiUserCheck, FiUserX } from 'react-icons/fi'

export default function StaffStats({ staff }) {
    const totalActive = staff.filter(s => s.active).length
    const totalInactive = staff.filter(s => !s.active).length

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                    <FiUser />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Total Personal</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{staff.length}</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                    <FiUserCheck />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Activos</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{totalActive}</div>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                    <FiUserX />
                </div>
                <div className="stat-card-content">
                    <div className="stat-card-label">Inactivos</div>
                    <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{totalInactive}</div>
                </div>
            </div>
        </div>
    )
}