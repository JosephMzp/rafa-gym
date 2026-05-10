import { FiMapPin, FiCalendar } from 'react-icons/fi'
export default function ReportsFilters({ dateFrom, dateTo, locationId, locations, onDateFrom, onDateTo, onLocation }) {
    const inputStyle = {
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        background: 'var(--dark-700)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        outline: 'none',
    }

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-md)',
            alignItems: 'center',
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--dark-800)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-xl)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiCalendar size={14} style={{ color: 'var(--text-muted)' }} />
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Desde</label>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={e => onDateFrom(e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Hasta</label>
                <input
                    type="date"
                    value={dateTo}
                    onChange={e => onDateTo(e.target.value)}
                    style={inputStyle}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiMapPin size={14} style={{ color: 'var(--text-muted)' }} />
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Sede</label>
                <select
                    value={locationId}
                    onChange={e => onLocation(e.target.value)}
                    style={{ ...inputStyle, minWidth: 160 }}
                >
                    <option value="all">Todas las sedes</option>
                    {locations.map(l => (
                        <option key={l.id} value={l.id}>{l.name.replace('RafaGym - ', '')}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}
