import { FiBarChart2, FiCalendar } from 'react-icons/fi'

export default function DietHistoryChart({
    goals,
    calorieHistory,
    selectedHistoryDate,
    historyLogs,
    loadingHistory,
    MEAL_TYPES,
    onSelectDate,
    onClearDate
}) {
    const todayStr = new Date().toISOString().split('T')[0]
    const maxCal = Math.max(...calorieHistory.map(h => h.calories), goals?.calories || 1, 1)
    const goalCals = goals?.calories || 0
    const goalPct = goalCals > 0 ? (goalCals / maxCal) * 100 : 0

    return (
        <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <FiBarChart2 color="var(--primary-400)" size={20} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    Historial Semanal
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
                    Toca una barra para ver detalle
                </span>
            </div>

            {/* Tarjeta del gráfico */}
            <div style={{ background: 'var(--surface-card)', borderRadius: '1.25rem', padding: '1.5rem 1.25rem 1rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                {/* Leyenda */}
                <div style={{ display: 'flex', gap: 16, marginBottom: '1rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--primary-500)', display: 'inline-block' }} /> Bajo la meta
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10b981', display: 'inline-block' }} /> Llegó a la meta
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: '#ef4444', display: 'inline-block' }} /> Superó la meta
                    </span>
                </div>

                {/* Barras */}
                <div style={{ position: 'relative' }}>
                    {/* Línea de meta */}
                    {goalCals > 0 && (
                        <div style={{
                            position: 'absolute', bottom: `calc(28px + ${goalPct}% * 0.7)`, left: 0, right: 0,
                            borderTop: '1.5px dashed rgba(251,191,36,0.7)', zIndex: 2, pointerEvents: 'none'
                        }}>
                            <span style={{ position: 'absolute', right: 0, top: -10, fontSize: '0.6rem', color: '#fbbf24', fontWeight: 700, background: 'var(--surface-card)', padding: '0 4px' }}>
                                META {goalCals} kcal
                            </span>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160 }}>
                        {calorieHistory.map((h) => {
                            const pct = (h.calories / maxCal) * 100
                            const reached = goalCals > 0 && h.calories >= goalCals * 0.9 && h.calories <= goalCals * 1.1
                            const isOver = goalCals > 0 && h.calories > goalCals * 1.1
                            const isEmpty = h.calories === 0
                            const isSelected = selectedHistoryDate === h.date
                            const isToday = h.date === todayStr

                            const barColor = isEmpty ? 'rgba(255,255,255,0.05)'
                                : isOver ? 'linear-gradient(180deg,#ef4444,#b91c1c)'
                                    : reached ? 'linear-gradient(180deg,#10b981,#059669)'
                                        : 'linear-gradient(180deg,var(--primary-400),var(--primary-600))'

                            const glowColor = isEmpty ? 'none'
                                : isOver ? '0 0 12px rgba(239,68,68,0.4)'
                                    : reached ? '0 0 12px rgba(16,185,129,0.4)'
                                        : '0 0 12px rgba(59,130,246,0.3)'

                            return (
                                <div
                                    key={h.date}
                                    onClick={() => !isEmpty && onSelectDate(h.date)}
                                    style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, cursor: isEmpty ? 'default' : 'pointer' }}
                                >
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isEmpty ? 'var(--text-muted)' : isOver ? '#f87171' : reached ? '#6ee7b7' : 'var(--primary-300)', minHeight: 14, textAlign: 'center' }}>
                                        {isEmpty ? '' : h.calories}
                                    </span>
                                    <div style={{
                                        width: '100%', maxWidth: '48px', borderRadius: '8px 8px 4px 4px',
                                        height: `${Math.max(isEmpty ? 6 : 12, pct * 0.65)}%`,
                                        background: barColor,
                                        boxShadow: isSelected ? `${glowColor}, 0 0 0 2px white` : glowColor,
                                        transition: 'height 0.6s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s',
                                        transform: isSelected ? 'scaleX(1.08)' : 'scaleX(1)',
                                        opacity: isEmpty ? 0.3 : 1, position: 'relative'
                                    }} />
                                    <span style={{ fontSize: '0.65rem', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--primary-400)' : isSelected ? 'white' : 'var(--text-muted)', textTransform: 'capitalize', textAlign: 'center', lineHeight: 1.2 }}>
                                        {new Date(h.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        {new Date(h.date + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                                    </span>
                                    {isToday && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--primary-400)', display: 'block' }} />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {selectedHistoryDate && (
                <div style={{
                    marginTop: '1rem', background: 'var(--surface-card)', borderRadius: '1.25rem',
                    border: '1px solid var(--border-subtle)', overflow: 'hidden',
                    animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1)'
                }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiCalendar size={15} color="var(--primary-400)" />
                            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {new Date(selectedHistoryDate + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        <button
                            onClick={onClearDate}
                            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}
                        >✕</button>
                    </div>

                    <div style={{ padding: '1rem 1.25rem' }}>
                        {loadingHistory ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
                                <div className="spinner spinner-md" style={{ color: 'var(--primary-500)' }} />
                            </div>
                        ) : historyLogs.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', padding: '1rem 0' }}>Sin registros para este día.</p>
                        ) : (
                            <>
                                {/* Resumen de macros del día */}
                                {(() => {
                                    const tot = historyLogs.reduce((a, r) => ({
                                        cal: a.cal + Number(r.calories || 0), p: a.p + Number(r.proteins || 0),
                                        c: a.c + Number(r.carbs || 0), f: a.f + Number(r.fats || 0)
                                    }), { cal: 0, p: 0, c: 0, f: 0 })
                                    const reached = goals && tot.cal >= goals.calories * 0.9 && tot.cal <= goals.calories * 1.1
                                    const isOver = goals && tot.cal > goals.calories * 1.1
                                    return (
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
                                            <span style={{ background: isOver ? 'rgba(239,68,68,0.15)' : reached ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)', color: isOver ? '#f87171' : reached ? '#6ee7b7' : 'var(--primary-300)', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>
                                                {Math.round(tot.cal)} kcal {reached ? ' • Meta' : isOver ? ' • Superó' : ''}
                                            </span>
                                            <span style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(tot.p)}g Prot</span>
                                            <span style={{ background: 'rgba(245,158,11,0.08)', color: '#fcd34d', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(tot.c)}g Carbs</span>
                                            <span style={{ background: 'rgba(16,185,129,0.08)', color: '#6ee7b7', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(tot.f)}g Grasas</span>
                                        </div>
                                    )
                                })()}

                                {/* Comidas por bloque */}
                                {MEAL_TYPES.map(mt => {
                                    const items = historyLogs.filter(r => r.meal_type === mt.value)
                                    if (!items.length) return null
                                    return (
                                        <div key={mt.value} style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.4rem' }}>
                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: mt.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{mt.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                {items.map(r => (
                                                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.875rem', background: 'var(--dark-800)', borderRadius: '0.6rem', border: '1px solid var(--border-subtle)' }}>
                                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{r.food_name}</span>
                                                        <span style={{ fontSize: '0.78rem', color: mt.color, fontWeight: 700, background: mt.gradient, padding: '2px 7px', borderRadius: 5 }}>{r.calories} kcal</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}