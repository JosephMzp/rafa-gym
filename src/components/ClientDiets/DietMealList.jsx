import { FiTarget, FiCheckCircle, FiCoffee, FiPlus, FiTrash2 } from 'react-icons/fi'

export default function DietMealList({ MEAL_TYPES, todayLogs, templateMeals, todayDayName, onOpenModal, onTrackTemplate, onDeleteLog }) {

    const renderMealBlock = (mealInfo) => {
        const mealLogs = todayLogs.filter(r => r.meal_type === mealInfo.value)
        const suggested = templateMeals.filter(m => m.meal_type === mealInfo.value && m.day_of_week === todayDayName)
        const hasTracked = mealLogs.length > 0
        const IconComponent = mealInfo.icon

        return (
            <div key={mealInfo.value} className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '12px', background: mealInfo.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mealInfo.color, border: `1px solid rgba(255,255,255,0.05)` }}>
                            <IconComponent size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{mealInfo.label}</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hasTracked ? `${mealLogs.length} alimentos registrados` : 'Sin registros aún'}</span>
                        </div>
                    </div>
                    <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => onOpenModal(mealInfo)}>
                        <FiPlus size={14} /> <span style={{ fontWeight: 600 }}>Añadir</span>
                    </button>
                </div>

                {hasTracked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {mealLogs.map(r => (
                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--dark-800)', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>{r.food_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        <span style={{ color: mealInfo.color, fontWeight: 700, background: mealInfo.gradient, padding: '2px 6px', borderRadius: '4px' }}>{r.calories} kcal</span>
                                        <span>{r.proteins}g P</span>
                                        <span>{r.carbs}g C</span>
                                        <span>{r.fats}g G</span>
                                    </div>
                                </div>
                                <button className="btn btn-icon btn-ghost" style={{ color: 'var(--text-muted)' }} onClick={() => onDeleteLog(r.id)}>
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        {suggested.length > 0 ? (
                            <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid rgba(59,130,246,0.15)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <FiTarget size={14} color="#3b82f6" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sugerencia del Entrenador</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                    {suggested.map(f => (
                                        <div key={f.id} style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3b82f6' }} />{f.food_name}
                                            </span>
                                            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{f.calories} kcal</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }} onClick={() => onTrackTemplate(mealInfo.value)}>
                                    <FiCheckCircle size={18} /> Comí esto exactamente
                                </button>
                            </div>
                        ) : (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--dark-800)', borderRadius: '0.75rem', border: '1px dashed var(--border-strong)' }}>
                                <FiCoffee size={28} style={{ marginBottom: 12, opacity: 0.3, color: mealInfo.color }} />
                                <p style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0' }}>No has registrado nada aún</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <FiCoffee color="var(--text-primary)" size={20} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Diario de Comidas</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {MEAL_TYPES.map(meal => renderMealBlock(meal))}
            </div>
        </>
    )
}