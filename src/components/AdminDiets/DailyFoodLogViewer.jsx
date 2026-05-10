import { useMemo } from 'react'
import { FiChevronLeft, FiChevronRight, FiCalendar, FiCoffee, FiSun, FiMoon, FiActivity, FiPieChart } from 'react-icons/fi'

const MEAL_CONFIG = [
    { value: 'Breakfast', label: 'Desayuno', Icon: FiCoffee, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
    { value: 'Lunch', label: 'Almuerzo', Icon: FiSun, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
    { value: 'Dinner', label: 'Cena', Icon: FiMoon, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' },
]

function formatDate(dateStr) {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

function MacroBar({ label, current, target, color }) {
    const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
    const isOver = current > target && target > 0

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </span>
                <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: isOver ? 'var(--danger)' : color,
                    background: isOver ? 'rgba(239,68,68,0.1)' : `rgba(255,255,255,0.07)`,
                    padding: '1px 6px', borderRadius: 8,
                }}>
                    {Math.round(pct)}%
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 6 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {Math.round(current)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    / {Math.round(target || 0)}
                </span>
            </div>
            <div style={{ width: '100%', height: 5, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                    width: `${Math.min(100, pct)}%`, height: '100%',
                    background: isOver ? 'var(--danger)' : color,
                    borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 0 8px ${isOver ? 'var(--danger)' : color}`,
                }} />
            </div>
        </div>
    )
}

function MacroSummary({ logs, goals }) {
    const consumed = useMemo(() => logs.reduce(
        (acc, r) => ({
            calories: acc.calories + (r.calories || 0),
            proteins: acc.proteins + (r.proteins || 0),
            carbs: acc.carbs + (r.carbs || 0),
            fats: acc.fats + (r.fats || 0),
        }),
        { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    ), [logs])

    const hasGoals = goals && goals.calories

    return (
        <div className="card" style={{
            marginBottom: 'var(--space-lg)',
            padding: '1.25rem 1.5rem',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FiPieChart size={18} color="var(--danger)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    Resumen Nutricional del Día
                </h3>
                {!hasGoals && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        Sin metas definidas
                    </span>
                )}
            </div>

            {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <FiActivity size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p style={{ margin: 0 }}>El cliente no registró comidas este día.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <MacroBar
                        label="Calorías (kcal)"
                        current={consumed.calories}
                        target={hasGoals ? goals.calories : consumed.calories}
                        color="var(--primary-500)"
                    />
                    <MacroBar
                        label="Proteínas (g)"
                        current={consumed.proteins}
                        target={hasGoals ? goals.proteins : consumed.proteins}
                        color="#ef4444"
                    />
                    <MacroBar
                        label="Carbohidratos (g)"
                        current={consumed.carbs}
                        target={hasGoals ? goals.carbs : consumed.carbs}
                        color="#f59e0b"
                    />
                    <MacroBar
                        label="Grasas (g)"
                        current={consumed.fats}
                        target={hasGoals ? goals.fats : consumed.fats}
                        color="#10b981"
                    />
                </div>
            )}
        </div>
    )
}

function MealBlock({ config, logs }) {
    const { Icon, label, color, bg } = config
    const mealLogs = logs.filter(r => r.meal_type === config.value)

    return (
        <div className="card" style={{
            marginBottom: '1rem',
            background: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '1rem 1.25rem',
                borderBottom: mealLogs.length > 0 ? '1px solid var(--border-subtle)' : 'none',
                background: bg,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `rgba(255,255,255,0.05)`, border: `1px solid ${color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                }}>
                    <Icon size={18} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {label}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {mealLogs.length > 0
                            ? `${mealLogs.length} alimento${mealLogs.length > 1 ? 's' : ''} · ${Math.round(mealLogs.reduce((s, r) => s + (r.calories || 0), 0))} kcal`
                            : 'Sin registros'}
                    </span>
                </div>
            </div>

            {mealLogs.length > 0 ? (
                <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {mealLogs.map(r => (
                        <div key={r.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.75rem 1rem', background: 'var(--dark-800)',
                            borderRadius: '0.6rem', border: '1px solid var(--border-subtle)',
                        }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 3 }}>
                                    {r.food_name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ color, fontWeight: 700, background: `${color}18`, padding: '1px 6px', borderRadius: 4 }}>
                                        {Math.round(r.calories)} kcal
                                    </span>
                                    <span>{r.proteins}g Prot</span>
                                    <span>{r.carbs}g Carbs</span>
                                    <span>{r.fats}g Grasas</span>
                                    {r.quantity && r.unit && (
                                        <span style={{ color: 'var(--text-muted)' }}>{r.quantity}{r.unit}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                }}>
                    El cliente no registró {label.toLowerCase()} este día.
                </div>
            )}
        </div>
    )
}

export default function DailyFoodLogViewer({ logs, selectedDate, onPrevDay, onNextDay, goals, loading }) {
    const isToday = selectedDate === new Date().toISOString().split('T')[0]

    return (
        <div>
            {/* Date Navigator */}
            <div className="card glass" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                marginBottom: 'var(--space-lg)',
                borderTop: '4px solid var(--danger)',
            }}>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onPrevDay}
                    title="Día anterior"
                    style={{ color: 'var(--text-primary)' }}
                >
                    <FiChevronLeft size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiCalendar size={18} color="var(--danger)" />
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {formatDate(selectedDate)}
                    </span>
                    {isToday && (
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)',
                            background: 'rgba(225, 29, 72, 0.12)', padding: '2px 8px',
                            borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            Hoy
                        </span>
                    )}
                </div>

                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onNextDay}
                    disabled={isToday}
                    title="Día siguiente"
                    style={{ color: isToday ? 'var(--text-muted)' : 'var(--text-primary)', opacity: isToday ? 0.4 : 1 }}
                >
                    <FiChevronRight size={20} />
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner spinner-lg" />
                </div>
            ) : (
                <>
                    <MacroSummary logs={logs} goals={goals} />
                    <div>
                        {MEAL_CONFIG.map(config => (
                            <MealBlock key={config.value} config={config} logs={logs} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
