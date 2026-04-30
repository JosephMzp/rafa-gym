import { FiBookOpen, FiUsers, FiTarget } from 'react-icons/fi'

export default function RoutinesStats({ templates, subscriptions }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><FiBookOpen /></div>
                <div className="stat-card-content"><div className="stat-card-label">Plantillas activas</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{templates.length}</div></div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiUsers /></div>
                <div className="stat-card-content"><div className="stat-card-label">Suscripciones activas</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{subscriptions.length}</div></div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}><FiTarget /></div>
                <div className="stat-card-content"><div className="stat-card-label">Principiantes</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{templates.filter(t => t.level === 'Principiante').length}</div></div>
            </div>
            <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FiTarget /></div>
                <div className="stat-card-content"><div className="stat-card-label">Avanzadas</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{templates.filter(t => t.level === 'Avanzado').length}</div></div>
            </div>
        </div>
    )
}