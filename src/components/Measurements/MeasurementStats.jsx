import { FiActivity, FiTrendingDown, FiTrendingUp, FiSliders, FiCalendar } from 'react-icons/fi'

export default function MeasurementStats({ measurements }) {
    const latest = measurements[measurements.length - 1]
    const prev = measurements[measurements.length - 2]

    const diff = (field) => {
        if (!latest || !prev || !latest[field] || !prev[field]) return null
        return (Number(latest[field]) - Number(prev[field])).toFixed(1)
    }

    if (!latest) return null

    const stats = [
        { label: 'Peso actual', value: latest.weight_kg ? `${latest.weight_kg} kg` : '—', delta: diff('weight_kg'), invert: true, icon: <FiActivity />, color: '#8b5cf6' },
        { label: '% Grasa', value: latest.body_fat_pct ? `${latest.body_fat_pct}%` : '—', delta: diff('body_fat_pct'), invert: true, icon: <FiTrendingDown />, color: '#ef4444' },
        { label: '% Músculo', value: latest.muscle_pct ? `${latest.muscle_pct}%` : '—', delta: diff('muscle_pct'), invert: false, icon: <FiTrendingUp />, color: '#10b981' },
        { label: 'Cintura', value: latest.waist_cm ? `${latest.waist_cm} cm` : '—', delta: diff('waist_cm'), invert: true, icon: <FiSliders />, color: '#f59e0b' },
        { label: 'Total mediciones', value: measurements.length, delta: null, icon: <FiCalendar />, color: '#3b82f6' },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
            {stats.map((s, i) => {
                const dv = s.delta !== null ? parseFloat(s.delta) : null
                const isGood = dv !== null ? (s.invert ? dv < 0 : dv > 0) : null
                return (
                    <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden', padding: '1.25rem' }}>
                        <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1, color: s.color, transform: 'scale(3)' }}>
                            {s.icon}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '8px', background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {s.icon}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: s.delta !== null ? 4 : 0 }}>{s.value}</div>
                        {dv !== null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600, color: isGood ? 'var(--success)' : (dv === 0 ? 'var(--text-muted)' : 'var(--danger)'), marginTop: 8 }}>
                                {dv !== 0 ? (isGood ? <FiTrendingDown size={14} /> : <FiTrendingUp size={14} />) : <span style={{ opacity: 0.5 }}>—</span>}
                                <span style={{ background: isGood ? 'rgba(16,185,129,0.15)' : (dv === 0 ? 'transparent' : 'rgba(239,68,68,0.15)'), padding: '2px 6px', borderRadius: 4 }}>
                                    {dv > 0 ? '+' : ''}{dv} vs anterior
                                </span>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}