import { FiSearch, FiX, FiActivity, FiPlus } from 'react-icons/fi'

export default function AdminFoodSearchModal({
    show, selectedMeal, foodQuery, foodResults, searchingFood,
    onSearchChange, onAddFood, onClose
}) {
    if (!show || !selectedMeal) return null

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(12px)', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal" style={{ maxWidth: 600, width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--dark-800)', border: '1px solid var(--dark-700)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

                <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--dark-700)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
                                <FiSearch size={20} />
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>
                                    Añadir alimento a {selectedMeal.label}
                                </h2>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Busca en nuestro catálogo nutricional local</p>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ background: 'var(--dark-700)', color: 'var(--text-secondary)' }}><FiX size={18} /></button>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-400)', fontSize: '1.2rem' }} />
                        <input
                            className="form-input"
                            style={{ paddingLeft: 48, height: 54, fontSize: '1.05rem', background: 'var(--dark-900)', border: '2px solid var(--dark-700)', borderRadius: 'var(--radius-lg)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', transition: 'border-color 0.2s' }}
                            placeholder="Ej: Arroz blanco, Pechuga de pollo, Huevo..."
                            value={foodQuery}
                            onChange={onSearchChange}
                            onFocus={e => e.target.style.borderColor = 'var(--primary-500)'}
                            onBlur={e => e.target.style.borderColor = 'var(--dark-700)'}
                            autoFocus
                        />
                    </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem', background: 'var(--dark-900)' }}>
                    {searchingFood && (
                        <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--primary-400)' }}>
                            <div className="spinner spinner-md" style={{ marginBottom: 16 }} />
                            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Buscando alimentos...</div>
                        </div>
                    )}

                    {!searchingFood && foodQuery && foodResults.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--dark-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px dashed var(--dark-700)' }}>
                                <FiSearch size={28} style={{ opacity: 0.5 }} />
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Sin resultados</div>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>No se encontró "{foodQuery}" en el catálogo.</p>
                        </div>
                    )}

                    {!searchingFood && !foodQuery && (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--dark-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <FiActivity size={28} style={{ opacity: 0.5, color: 'var(--primary-400)' }} />
                            </div>
                            <p style={{ margin: 0, fontSize: '1rem' }}>Escribe el nombre del alimento que deseas buscar.</p>
                        </div>
                    )}

                    {!searchingFood && foodResults.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {foodResults.map((food, idx) => (
                                <div key={food.id} style={{
                                    padding: '16px', background: 'var(--dark-800)', borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--dark-700)', display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', gap: 16, transition: 'all 0.2s', animation: `fadeIn 0.3s ease-out forwards`, animationDelay: `${idx * 0.05}s`, opacity: 0
                                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--dark-700)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {food.name}
                                            {food.brand && food.brand !== 'Genérico' && (
                                                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{food.brand}</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary-400)', margin: '6px 0 10px', fontWeight: 600 }}>
                                            Porción recomendada: {food.serving_size} {food.serving_unit}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.2)' }}>{food.calories} kcal</span>
                                            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(59, 130, 246, 0.2)' }}>{food.proteins}g Prot</span>
                                            <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.2)' }}>{food.carbs}g Carb</span>
                                            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>{food.fats}g Gras</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary" style={{ flexShrink: 0, padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 700, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} onClick={() => onAddFood(food)}>
                                        <FiPlus size={16} style={{ marginRight: 4 }} /> Añadir
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}