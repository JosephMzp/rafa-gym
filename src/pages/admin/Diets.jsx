import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getClients } from '../../lib/services'
import { supabase } from '../../lib/supabase'
import {
    FiPlus, FiTrash2, FiSearch, FiActivity, FiUser, FiX,
    FiHeart, FiTarget, FiCoffee, FiCalendar, FiCopy
} from 'react-icons/fi'

// Meal types: display label → DB value
const MEAL_TYPES = [
    { label: 'Desayuno', value: 'Breakfast' },
    { label: 'Almuerzo', value: 'Lunch' },
    { label: 'Cena',     value: 'Dinner' },
]

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function Diets() {
    const { user } = useAuth()
    const [clients, setClients]             = useState([])
    const [selectedClient, setSelectedClient] = useState(null)
    const [search, setSearch]               = useState('')
    const [showDropdown, setShowDropdown]   = useState(false)
    const [loadingData, setLoadingData]     = useState(false)

    const [goals, setGoals]                 = useState(null)
    const [template, setTemplate]           = useState(null)
    const [meals, setMeals]                 = useState([])

    const [showGoalsModal, setShowGoalsModal] = useState(false)
    const [objetivo, setObjetivo]           = useState('Mantener peso')
    const [calculating, setCalculating]     = useState(false)
    const [calcError, setCalcError]         = useState('')

    const [showFoodModal, setShowFoodModal] = useState(false)
    const [selectedMeal, setSelectedMeal]   = useState(MEAL_TYPES[0])
    const [foodQuery, setFoodQuery]         = useState('')
    const [foodResults, setFoodResults]     = useState([])
    const [searchingFood, setSearchingFood] = useState(false)
    const [selectedDay, setSelectedDay]     = useState('Lunes')
    const [copyFromDay, setCopyFromDay]     = useState(null)

    const debounceRef = useRef(null)

    useEffect(() => {
        getClients().then(setClients)
    }, [])

    useEffect(() => {
        if (!selectedClient) {
            setGoals(null); setTemplate(null); setMeals([])
            return
        }
        loadDietData(selectedClient.id)
    }, [selectedClient])

    const loadDietData = async (clientId) => {
        setLoadingData(true)
        try {
            // Nutrition goals
            const { data: goalsData } = await supabase
                .from('nutrition_goals')
                .select('*')
                .eq('client_id', clientId)
                .order('assigned_at', { ascending: false })
                .limit(1)
            setGoals(goalsData?.[0] || null)

            // Active diet template
            const { data: tplData } = await supabase
                .from('diet_templates')
                .select('*')
                .eq('client_id', clientId)
                .eq('active', true)
                .limit(1)

            if (tplData?.[0]) {
                setTemplate(tplData[0])
                const { data: mealsData } = await supabase
                    .from('template_meals')
                    .select('*')
                    .eq('template_id', tplData[0].id)
                setMeals(mealsData || [])
            } else {
                setTemplate(null)
                setMeals([])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingData(false)
        }
    }

    const filtered = useMemo(() =>
        clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8),
        [clients, search])

    // ── Calculate goals via RPC ──
    const handleCalculateGoals = async () => {
        setCalcError('')
        setCalculating(true)
        try {
            const { error } = await supabase.rpc('calcular_metas_nutricionales', {
                p_cliente_id: selectedClient.id,
                p_objetivo: objetivo
            })
            if (error) throw new Error(error.message)
            setShowGoalsModal(false)
            loadDietData(selectedClient.id)
        } catch (err) {
            const raw = err.message || ''
            const match = raw.match(/ERROR:\s*\d+:\s*(.+)/)
            setCalcError(match ? match[1] : raw || 'Verifica que el cliente tenga rutina activa, medidas y género registrados.')
        } finally {
            setCalculating(false)
        }
    }

    // ── Search food_catalog ──
    const handleSearchFood = async (q) => {
        if (!q || q.trim() === '') { setFoodResults([]); return }
        setSearchingFood(true)
        try {
            const { data, error } = await supabase
                .from('food_catalog')
                .select('*')
                .ilike('name', `%${q.trim()}%`)
                .limit(10)
            if (error) throw error
            setFoodResults(data || [])
        } catch (err) {
            console.error(err)
            setFoodResults([])
        } finally {
            setSearchingFood(false)
        }
    }

    const onFoodSearchChange = (e) => {
        const q = e.target.value
        setFoodQuery(q)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => handleSearchFood(q), 350)
    }

    // ── Add food to template meal ──
    const handleAddFood = async (food) => {
        try {
            let currentTemplate = template
            if (!currentTemplate) {
                const { data, error } = await supabase
                    .from('diet_templates')
                    .insert({ client_id: selectedClient.id, name: 'Dieta Principal', active: true })
                    .select()
                if (error) throw error
                currentTemplate = data[0]
                setTemplate(currentTemplate)
            }

            const { error } = await supabase.from('template_meals').insert({
                template_id:  currentTemplate.id,
                meal_type:    selectedMeal.value,
                day_of_week:  selectedDay,
                food_id:      food.id,
                food_name:    food.brand && food.brand !== 'Genérico'
                    ? `${food.name} (${food.brand})`
                    : food.name,
                quantity:     food.serving_size,
                unit:         food.serving_unit,
                calories:     food.calories,
                proteins:     food.proteins,
                carbs:        food.carbs,
                fats:         food.fats,
            })
            if (error) throw error

            setShowFoodModal(false)
            setFoodQuery('')
            setFoodResults([])
            loadDietData(selectedClient.id)
        } catch (err) {
            console.error(err)
            alert('Error al añadir alimento: ' + err.message)
        }
    }

    const handleRemoveFood = async (id) => {
        if (!confirm('¿Eliminar alimento?')) return
        try {
            await supabase.from('template_meals').delete().eq('id', id)
            setMeals(m => m.filter(x => x.id !== id))
        } catch (err) { console.error(err) }
    }

    const openFoodModal = (meal) => {
        setSelectedMeal(meal)
        setShowFoodModal(true)
        setFoodQuery('')
        setFoodResults([])
    }

    // ── Copy day meals ──
    const handleCopyDay = async (fromDay) => {
        if (!template) return
        const sourceMeals = meals.filter(m => m.day_of_week === fromDay)
        if (!sourceMeals.length) { alert('El día origen no tiene comidas.'); return }
        try {
            const inserts = sourceMeals.map(m => ({
                template_id: template.id, meal_type: m.meal_type, day_of_week: selectedDay,
                food_id: m.food_id, food_name: m.food_name, quantity: m.quantity, unit: m.unit,
                calories: m.calories, proteins: m.proteins, carbs: m.carbs, fats: m.fats,
            }))
            const { error } = await supabase.from('template_meals').insert(inserts)
            if (error) throw error
            setCopyFromDay(null)
            loadDietData(selectedClient.id)
        } catch (err) { console.error(err); alert('Error al copiar: ' + err.message) }
    }

    // ── Render meal section ──
    const renderMealSection = (meal) => {
        const mealFoods = meals.filter(m => m.meal_type === meal.value && m.day_of_week === selectedDay)
        const totalCals = mealFoods.reduce((a, m) => a + Number(m.calories), 0)
        const totalP    = mealFoods.reduce((a, m) => a + Number(m.proteins), 0)
        const totalC    = mealFoods.reduce((a, m) => a + Number(m.carbs),    0)
        const totalF    = mealFoods.reduce((a, m) => a + Number(m.fats),     0)

        return (
            <div key={meal.value} className="card" style={{ marginBottom: '1rem', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-400)' }}>{meal.label}</h3>
                    <button className="btn btn-sm btn-ghost" onClick={() => openFoodModal(meal)}>
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
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--danger), #be123c)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 15px rgba(225, 29, 72, 0.3)' }}>
                            <FiHeart style={{ color: 'white' }} size={24} />
                        </div>
                        Gestión de Dietas
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '1rem' }}>Calculadora metabólica y asignación de plantillas</p>
                </div>
            </div>

            {/* Client selector */}
            <div className="card glass" style={{ marginBottom: 'var(--space-xl)', borderTop: '4px solid var(--danger)', overflow: 'visible' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: 12, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Seleccionar Cliente</label>
                <div style={{ position: 'relative', maxWidth: 480 }}>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)', fontSize: '1.2rem' }} />
                        <input
                            className="form-input"
                            style={{ paddingLeft: 44, height: 48, fontSize: '1rem' }}
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                            onFocus={() => setShowDropdown(true)}
                        />
                    </div>
                    {showDropdown && filtered.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginTop: 8, overflow: 'hidden' }}>
                            {filtered.map((c, idx) => (
                                <div key={c.id}
                                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderBottom: idx < filtered.length - 1 ? '1px solid var(--dark-700)' : 'none' }}
                                    onMouseDown={() => { setSelectedClient(c); setSearch(c.name); setShowDropdown(false) }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-700)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selectedClient && (
                    <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--dark-800)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-700)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cliente actual:</span>
                        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{selectedClient.name}</span>
                        <button className="btn btn-ghost btn-icon" onClick={() => { setSelectedClient(null); setSearch('') }}><FiX size={14} /></button>
                    </div>
                )}
            </div>

            {!selectedClient ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)', background: 'var(--dark-800)', borderRadius: 'var(--radius-xl)' }}>
                    <FiUser size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ningún cliente seleccionado</h3>
                </div>
            ) : loadingData ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
                    {/* Left: Goals */}
                    <div>
                        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <FiTarget color="var(--danger)" /> Metas Nutricionales
                                </h2>
                                <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setShowGoalsModal(true)}>
                                    <FiActivity /> Calcular
                                </button>
                            </div>

                            {!goals ? (
                                <p style={{ color: 'var(--text-muted)' }}>El cliente no tiene metas asignadas. Usa la calculadora.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                    {[
                                        { label: 'CALORÍAS',     value: goals.calories,  suffix: 'kcal', color: 'var(--danger)', size: '1.75rem' },
                                        { label: 'PROTEÍNAS',    value: goals.proteins,  suffix: 'g',    color: '#ef4444',       size: '1.5rem'  },
                                        { label: 'CARBOHIDRATOS',value: goals.carbs,     suffix: 'g',    color: '#f59e0b',       size: '1.5rem'  },
                                        { label: 'GRASAS',       value: goals.fats,      suffix: 'g',    color: '#10b981',       size: '1.5rem'  },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: 'var(--dark-800)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{item.label}</div>
                                            <div style={{ fontSize: item.size, fontWeight: 800, color: item.color }}>
                                                {item.value} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.suffix}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Template meals */}
                    <div>
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
                            {/* Day tabs */}
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
                    </div>
                </div>
            )}

            {/* Modal: Calculate Goals */}
            {showGoalsModal && (
                <div className="modal-overlay" onClick={() => !calculating && setShowGoalsModal(false)} style={{ backdropFilter: 'blur(12px)', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal" style={{ maxWidth: 500, width: '95%', padding: 0, background: 'var(--dark-800)', border: '1px solid var(--dark-700)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        {/* Header gradient */}
                        <div style={{ background: 'linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                                <FiActivity size={24} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', margin: 0, color: '#fff' }}>Calculadora Metabólica</h2>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>Fórmula de Mifflin-St Jeor</p>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ background: 'var(--dark-900)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', border: '1px dashed var(--dark-700)' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>Requisitos para el cálculo:</p>
                                <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, paddingLeft: 10, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Rutina activa</strong> asignada</li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Medición corporal</strong> con peso y altura</li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Género y Fecha de Nacimiento</strong> en perfil</li>
                                </ul>
                            </div>

                            {calcError && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px 16px', color: '#f87171', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <FiActivity size={16} style={{ flexShrink: 0 }} /><span>{calcError}</span>
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Objetivo del Cliente</label>
                                <div style={{ position: 'relative' }}>
                                    <select 
                                        className="form-input" 
                                        value={objetivo} 
                                        onChange={e => setObjetivo(e.target.value)}
                                        style={{ background: 'var(--dark-900)', border: '2px solid var(--dark-700)', height: 50, fontSize: '1rem', color: 'var(--text-primary)', padding: '0 16px', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--danger)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--dark-700)'}
                                    >
                                        <option value="Mantener peso">⚖️ Mantener peso actual</option>
                                        <option value="Bajar de peso">🔥 Bajar de peso (Déficit -500 kcal)</option>
                                        <option value="Subir masa muscular">💪 Subir masa muscular (+300 kcal)</option>
                                    </select>
                                    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--dark-700)' }}>
                                <button className="btn btn-ghost" onClick={() => { setShowGoalsModal(false); setCalcError('') }} disabled={calculating} style={{ padding: '0.75rem 1.5rem' }}>Cancelar</button>
                                <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.75rem 1.5rem', minWidth: 160, display: 'flex', justifyContent: 'center', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }} onClick={handleCalculateGoals} disabled={calculating}>
                                    {calculating ? <><div className="spinner spinner-sm" style={{ marginRight: 8, borderColor: '#fff', borderTopColor: 'transparent' }} /> Procesando...</> : <><FiTarget style={{ marginRight: 8 }} /> Generar Metas</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Search food_catalog */}
            {showFoodModal && (
                <div className="modal-overlay" onClick={() => setShowFoodModal(false)} style={{ backdropFilter: 'blur(12px)', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal" style={{ maxWidth: 600, width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, background: 'var(--dark-800)', border: '1px solid var(--dark-700)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        
                        {/* Header Area */}
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
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowFoodModal(false)} style={{ background: 'var(--dark-700)', color: 'var(--text-secondary)' }}><FiX size={18} /></button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-400)', fontSize: '1.2rem' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 48, height: 54, fontSize: '1.05rem', background: 'var(--dark-900)', border: '2px solid var(--dark-700)', borderRadius: 'var(--radius-lg)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', transition: 'border-color 0.2s' }}
                                    placeholder="Ej: Arroz blanco, Pechuga de pollo, Huevo..."
                                    value={foodQuery}
                                    onChange={onFoodSearchChange}
                                    onFocus={e => e.target.style.borderColor = 'var(--primary-500)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--dark-700)'}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Results Area */}
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
                                            <button className="btn btn-primary" style={{ flexShrink: 0, padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 700, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} onClick={() => handleAddFood(food)}>
                                                <FiPlus size={16} style={{ marginRight: 4 }} /> Añadir
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
