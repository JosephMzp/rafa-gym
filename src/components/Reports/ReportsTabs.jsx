import { FiDollarSign, FiCalendar, FiUserX } from 'react-icons/fi'

const TABS = [
    { id: 'finance', label: 'Finanzas', Icon: FiDollarSign },
    { id: 'operations', label: 'Operaciones (Asistencias)', Icon: FiCalendar },
    { id: 'retention', label: 'Retención (Churn)', Icon: FiUserX },
]

export default function ReportsTabs({ active, onChange }) {
    return (
        <div className="tabs" style={{ marginBottom: 'var(--space-xl)' }}>
            {TABS.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    className={`tab ${active === id ? 'active' : ''}`}
                    onClick={() => onChange(id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    <Icon size={14} />
                    {label}
                </button>
            ))}
        </div>
    )
}
