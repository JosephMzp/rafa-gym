import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { getClients } from '../../lib/services'
import { supabase } from '../../lib/supabase'
import { FiSearch, FiUser, FiX, FiHeart, FiCalendar, FiGrid } from 'react-icons/fi'

import GoalsSection from '../../components/AdminDiets/GoalsSection'
import WeeklyPlanSection from '../../components/AdminDiets/WeeklyPlanSection'
import GoalsModal from '../../components/AdminDiets/GoalsModal'
import AdminFoodSearchModal from '../../components/AdminDiets/AdminFoodSearchModal'
import DailyFoodLogViewer from '../../components/AdminDiets/DailyFoodLogViewer'

const MEAL_TYPES = [
    { label: 'Desayuno', value: 'Breakfast' },
    { label: 'Almuerzo', value: 'Lunch' },
    { label: 'Cena', value: 'Dinner' },
]

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const TABS = [
    { id: 'planning', label: 'Planificación', Icon: FiGrid },
    { id: 'tracking', label: 'Seguimiento Diario', Icon: FiCalendar },
]

function getTodayStr() {
    return new Date().toISOString().split('T')[0]
}

function shiftDate(dateStr, days) {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
}

export default function Diets() {
    const [clients, setClients] = useState([])
    const [selectedClient, setSelectedClient] = useState(null)
    const [search, setSearch] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    // TABS
    const [activeTab, setActiveTab] = useState('planning')

    // DATOS NUTRICIONALES
    const [goals, setGoals] = useState(null)
    const [template, setTemplate] = useState(null)
    const [meals, setMeals] = useState([])

    // ESTADOS CALCULADORA METABÓLICA
    const [showGoalsModal, setShowGoalsModal] = useState(false)
    const [objetivo, setObjetivo] = useState('Mantener peso')
    const [calculating, setCalculating] = useState(false)
    const [calcError, setCalcError] = useState('')

    // ESTADOS PLAN SEMANAL Y BUSCADOR
    const [showFoodModal, setShowFoodModal] = useState(false)
    const [selectedMeal, setSelectedMeal] = useState(MEAL_TYPES[0])
    const [foodQuery, setFoodQuery] = useState('')
    const [foodResults, setFoodResults] = useState([])
    const [searchingFood, setSearchingFood] = useState(false)
    const [selectedDay, setSelectedDay] = useState('Lunes')
    const [copyFromDay, setCopyFromDay] = useState(null)
    const debounceRef = useRef(null)

    // SEGUIMIENTO DIARIO (admin view)
    const [trackingDate, setTrackingDate] = useState(getTodayStr())
    const [dailyLogs, setDailyLogs] = useState([])
    const [loadingLogs, setLoadingLogs] = useState(false)

    useEffect(() => { getClients().then(setClients) }, [])

    useEffect(() => {
        if (!selectedClient) {
            setGoals(null); setTemplate(null); setMeals([]); setDailyLogs([])
            return
        }
        loadDietData(selectedClient.id)
    }, [selectedClient])

    // Reload logs when client or date changes (and tracking tab may be active)
    useEffect(() => {
        if (!selectedClient) return
        loadDailyLogs(selectedClient.id, trackingDate)
    }, [selectedClient, trackingDate])

    const loadDietData = async (clientId) => {
        setLoadingData(true)
        try {
            const { data: goalsData } = await supabase
                .from('nutrition_goals').select('*')
                .eq('client_id', clientId)
                .order('assigned_at', { ascending: false }).limit(1)
            setGoals(goalsData?.[0] || null)

            const { data: tplData } = await supabase
                .from('diet_templates').select('*')
                .eq('client_id', clientId).eq('active', true).limit(1)

            if (tplData?.[0]) {
                setTemplate(tplData[0])
                const { data: mealsData } = await supabase
                    .from('template_meals').select('*')
                    .eq('template_id', tplData[0].id)
                setMeals(mealsData || [])
            } else {
                setTemplate(null); setMeals([])
            }
        } catch (err) { console.error(err) }
        finally { setLoadingData(false) }
    }

    const loadDailyLogs = useCallback(async (clientId, date) => {
        setLoadingLogs(true)
        try {
            const { data, error } = await supabase
                .from('daily_food_logs')
                .select('*')
                .eq('client_id', clientId)
                .eq('log_date', date)
                .order('created_at', { ascending: true })
            if (error) throw error
            setDailyLogs(data || [])
        } catch (err) {
            console.error('Error loading daily logs:', err)
            setDailyLogs([])
        } finally {
            setLoadingLogs(false)
        }
    }, [])

    const handlePrevDay = () => setTrackingDate(d => shiftDate(d, -1))
    const handleNextDay = () => {
        const next = shiftDate(trackingDate, 1)
        if (next <= getTodayStr()) setTrackingDate(next)
    }

    const filtered = useMemo(() =>
        clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8),
        [clients, search])

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

    const handleSearchFood = async (q) => {
        if (!q || q.trim() === '') { setFoodResults([]); return }
        setSearchingFood(true)
        try {
            const { data, error } = await supabase.from('food_catalog').select('*').ilike('name', `%${q.trim()}%`).limit(10)
            if (error) throw error
            setFoodResults(data || [])
        } catch (err) { setFoodResults([]) }
        finally { setSearchingFood(false) }
    }

    const onFoodSearchChange = (e) => {
        const q = e.target.value; setFoodQuery(q)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => handleSearchFood(q), 350)
    }

    const handleAddFood = async (food) => {
        try {
            let currentTemplate = template
            if (!currentTemplate) {
                const { data, error } = await supabase.from('diet_templates')
                    .insert({ client_id: selectedClient.id, name: 'Dieta Principal', active: true }).select()
                if (error) throw error
                currentTemplate = data[0]
                setTemplate(currentTemplate)
            }

            const { error } = await supabase.from('template_meals').insert({
                template_id: currentTemplate.id, meal_type: selectedMeal.value, day_of_week: selectedDay,
                food_id: food.id, food_name: food.brand && food.brand !== 'Genérico' ? `${food.name} (${food.brand})` : food.name,
                quantity: food.serving_size, unit: food.serving_unit,
                calories: food.calories, proteins: food.proteins, carbs: food.carbs, fats: food.fats,
            })
            if (error) throw error

            setShowFoodModal(false); setFoodQuery(''); setFoodResults([])
            loadDietData(selectedClient.id)
        } catch (err) { alert('Error al añadir alimento: ' + err.message) }
    }

    const handleRemoveFood = async (id) => {
        if (!confirm('¿Eliminar alimento?')) return
        try {
            await supabase.from('template_meals').delete().eq('id', id)
            setMeals(m => m.filter(x => x.id !== id))
        } catch (err) { console.error(err) }
    }

    const openFoodModal = (meal) => {
        setSelectedMeal(meal); setShowFoodModal(true); setFoodQuery(''); setFoodResults([])
    }

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
        } catch (err) { alert('Error al copiar: ' + err.message) }
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
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '1rem' }}>Calculadora metabólica, planificación y seguimiento de clientes</p>
                </div>
            </div>

            {/* Selector de Clientes */}
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
                <>
                    {/* ── TABS ── */}
                    <div style={{
                        display: 'flex', gap: 4,
                        marginBottom: 'var(--space-xl)',
                        background: 'var(--dark-800)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 4,
                        width: 'fit-content',
                        border: '1px solid var(--border-subtle)',
                    }}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 20px',
                                        borderRadius: 'var(--radius-md)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem', fontWeight: 700,
                                        fontFamily: 'var(--font-display)',
                                        transition: 'all 0.2s ease',
                                        background: isActive ? 'var(--danger)' : 'transparent',
                                        color: isActive ? 'white' : 'var(--text-secondary)',
                                        boxShadow: isActive ? '0 2px 10px rgba(225, 29, 72, 0.35)' : 'none',
                                    }}
                                >
                                    <tab.Icon size={15} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* ── TAB CONTENT ── */}
                    {activeTab === 'planning' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
                            <GoalsSection
                                goals={goals}
                                onOpenCalcModal={() => setShowGoalsModal(true)}
                            />
                            <WeeklyPlanSection
                                goals={goals}
                                template={template}
                                meals={meals}
                                selectedDay={selectedDay}
                                setSelectedDay={setSelectedDay}
                                WEEKDAYS={WEEKDAYS}
                                MEAL_TYPES={MEAL_TYPES}
                                copyFromDay={copyFromDay}
                                setCopyFromDay={setCopyFromDay}
                                handleCopyDay={handleCopyDay}
                                onOpenFoodModal={openFoodModal}
                                handleRemoveFood={handleRemoveFood}
                            />
                        </div>
                    ) : (
                        <DailyFoodLogViewer
                            logs={dailyLogs}
                            selectedDate={trackingDate}
                            onPrevDay={handlePrevDay}
                            onNextDay={handleNextDay}
                            goals={goals}
                            loading={loadingLogs}
                        />
                    )}
                </>
            )}

            <GoalsModal
                show={showGoalsModal}
                onClose={() => { setShowGoalsModal(false); setCalcError('') }}
                objetivo={objetivo}
                setObjetivo={setObjetivo}
                calculating={calculating}
                calcError={calcError}
                onCalculate={handleCalculateGoals}
            />

            <AdminFoodSearchModal
                show={showFoodModal}
                selectedMeal={selectedMeal}
                foodQuery={foodQuery}
                foodResults={foodResults}
                searchingFood={searchingFood}
                onSearchChange={onFoodSearchChange}
                onAddFood={handleAddFood}
                onClose={() => setShowFoodModal(false)}
            />
        </div>
    )
}