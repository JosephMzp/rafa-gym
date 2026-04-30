import { FiPieChart, FiActivity } from 'react-icons/fi'

export default function DietProgress({ goals, consumed }) {
    const calcProgress = (current, target) => {
        if (!target || target <= 0) return 0
        return Math.min(100, (current / target) * 100)
    }

    const renderProgressCard = (label, current, target, color, icon) => {
        const isCal = label === 'Calorías'
        const unit = isCal ? 'kcal' : 'g'
        const pct = calcProgress(current, target)
        const isOver = current > target && target > 0

        return (
            <div style={{
                background: 'var(--surface-card)', padding: '1.25rem', borderRadius: '1rem',
                border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: color, filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {icon}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isOver ? 'var(--danger)' : color, background: `rgba(${isOver ? '239, 68, 68' : '255, 255, 255'}, 0.1)`, padding: '2px 8px', borderRadius: '12px' }}>
                        {Math.round(pct)}%
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                        {Math.round(current)}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        / {Math.round(target || 0)} {unit}
                    </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: `${Math.min(100, pct)}%`, height: '100%',
                        background: isOver ? 'var(--danger)' : color,
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: 3,
                        boxShadow: `0 0 10px ${isOver ? 'var(--danger)' : color}`
                    }} />
                </div>
            </div>
        )
    }

    return (
        <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <FiPieChart color="var(--text-primary)" size={20} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    Resumen del Día
                </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {renderProgressCard('Calorías', consumed.calories, goals.calories, 'var(--primary-500)', <FiActivity size={14} color="var(--primary-400)" />)}
                {renderProgressCard('Proteínas', consumed.proteins, goals.proteins, '#ef4444', <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />)}
                {renderProgressCard('Carbs', consumed.carbs, goals.carbs, '#f59e0b', <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />)}
                {renderProgressCard('Grasas', consumed.fats, goals.fats, '#10b981', <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />)}
            </div>
        </div>
    )
}