import { FiCalendar, FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi'

export default function WeeklyPlanSection({
    goals, template, meals, selectedDay, setSelectedDay, WEEKDAYS, MEAL_TYPES,
    copyFromDay, setCopyFromDay, handleCopyDay, onOpenFoodModal, handleRemoveFood
}) {
    const renderMealSection = (meal) => {
        const mealFoods = meals.filter(m => m.meal_type === meal.value && m.day_of_week === selectedDay)
        const totalCals = mealFoods.reduce((a, m) => a + Number(m.calories), 0)
        const totalP = mealFoods.reduce((a, m) => a + Number(m.proteins), 0)
        const totalC = mealFoods.reduce((a, m) => a + Number(m.carbs), 0)
        const totalF = mealFoods.reduce((a, m) => a + Number(m.fats), 0)

        return (
            <div key={meal.value} className="card" style={{ marginBottom: '1rem', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-400)' }}>{meal.label}</h3>
                    <button className="btn btn-sm btn-ghost" onClick={() => onOpenFoodModal(meal)}>
                        <FiPlus /> Añadir alimento
                    </button>
                </div>

                {mealFoods.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay alimentos en esta comida.</p>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {mealFoods.map(f => (
                                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--dark-700)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.food_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <span style={{ color: 'var(--primary-300)', fontWeight: 600 }}>{f.quantity} {f.unit}</span>
                                            {' '}• {f.calories} kcal • {f.proteins}g P • {f.carbs}g C • {f.fats}g G
                                        </div>
                                    </div>
                                    <button className="btn btn-icon btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveFood(f.id)}>
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--dark-600)', display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-primary)' }}>Total {meal.label}:</span>
                            <span style={{ color: 'var(--primary-400)' }}>{totalCals.toFixed(0)} kcal</span>
                            <span style={{ color: '#ef4444' }}>{totalP.toFixed(1)}g P</span>
                            <span style={{ color: '#f59e0b' }}>{totalC.toFixed(1)}g C</span>
                            <span style={{ color: '#10b981' }}>{totalF.toFixed(1)}g G</span>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}>
                    <FiCalendar color="var(--primary-400)" /> Plan Semanal
                </h2>
                {goals && template && (
                    <div style={{ position: 'relative' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => setCopyFromDay(copyFromDay ? null : 'pick')} style={{ fontSize: '0.8rem', display: 'flex', gap: 4, alignItems: 'center' }}>
                            <FiCopy size={14} /> Copiar de otro día
                        </button>
                        {copyFromDay === 'pick' && (
                            <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--dark-700)', border: '1px solid var(--dark-600)', borderRadius: 'var(--radius-md)', zIndex: 50, boxShadow: '0 8px 20px rgba(0,0,0,0.4)', overflow: 'hidden', minWidth: 160 }}>
                                {WEEKDAYS.filter(d => d !== selectedDay).map(d => (
                                    <div key={d} style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--dark-600)' }}
                                        onMouseDown={() => handleCopyDay(d)}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-600)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        {d}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: 4 }}>
                {WEEKDAYS.map(day => {
                    const dayMeals = meals.filter(m => m.day_of_week === day)
                    const isActive = selectedDay === day
                    return (
                        <button key={day} onClick={() => setSelectedDay(day)}
                            style={{
                                padding: '8px 14px', borderRadius: 'var(--radius-md)', border: isActive ? '2px solid var(--primary-500)' : '1px solid var(--dark-600)',
                                background: isActive ? 'rgba(59,130,246,0.15)' : 'var(--dark-800)', color: isActive ? 'var(--primary-400)' : 'var(--text-muted)',
                                fontWeight: isActive ? 700 : 500, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                                position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 60
                            }}>
                            {day.slice(0, 3)}
                            {dayMeals.length > 0 && (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--primary-400)' : 'var(--success)', display: 'block' }} />
                            )}
                        </button>
                    )
                })}
            </div>

            {!goals ? (
                <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', background: 'var(--dark-800)', borderRadius: 'var(--radius-lg)' }}>
                    Primero calcula las metas nutricionales.
                </p>
            ) : (
                MEAL_TYPES.map(meal => renderMealSection(meal))
            )}
        </div>
    )
}