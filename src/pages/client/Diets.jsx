import { useState, useEffect, useRef, Component } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiAlertCircle, FiTrendingUp, FiTarget, FiSunrise, FiSun, FiMoon } from 'react-icons/fi'

import DietProgress from '../../components/ClientDiets/DietProgress'
import DietMealList from '../../components/ClientDiets/DietMealList'
import DietSearchModal from '../../components/ClientDiets/DietSearchModal'
import DietHistoryChart from '../../components/ClientDiets/DietHistoryChart'

const MEAL_TYPES = [
    { label: 'Desayuno', value: 'Breakfast', icon: FiSunrise, color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))' },
    { label: 'Almuerzo', value: 'Lunch', icon: FiSun, color: 'var(--primary-400)', gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))' },
    { label: 'Cena', value: 'Dinner', icon: FiMoon, color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))' },
]
const WEEKDAYS_MAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null } }
    static getDerivedStateFromError(error) { return { hasError: true, error } }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', background: 'var(--dark-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: '2rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
                        <FiAlertCircle size={48} color="var(--danger)" />
                    </div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Algo salió mal</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
                        {this.state.error?.message || 'Error inesperado al cargar la página de dieta. Por favor, intenta recargar.'}
                    </p>
                    <Link to="/portal/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Volver al Dashboard</Link>
                </div>
            )
        }
        return this.props.children
    }
}

function ClientDiets() {
    const { user } = useAuth()
    const clientId = user?.id ?? null
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [goals, setGoals] = useState(null)
    const [dietTemplate, setDietTemplate] = useState(null)
    const [templateMeals, setTemplateMeals] = useState([])
    const [todayLogs, setTodayLogs] = useState([])
    const [calorieHistory, setCalorieHistory] = useState([])

    const [showModal, setShowModal] = useState(false)
    const [selectedMeal, setSelectedMeal] = useState(MEAL_TYPES[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const debounceRef = useRef(null)

    // Estados de Gráfico de Historial
    const [selectedHistoryDate, setSelectedHistoryDate] = useState(null)
    const [historyLogs, setHistoryLogs] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Fechas Actuales
    const todayStr = new Date().toISOString().split('T')[0]
    const todayDayName = WEEKDAYS_MAP[new Date().getDay()]

    useEffect(() => {
        if (!clientId) {
            setError('No se pudo identificar al cliente. Por favor, vuelve a iniciar sesión.')
            setLoading(false)
            return
        }
        loadData()
    }, [clientId])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            // Metas nutricionales
            const { data: goalsData } = await supabase
                .from('nutrition_goals').select('*').eq('client_id', clientId).order('assigned_at', { ascending: false }).limit(1)
            setGoals(goalsData?.[0] || null)

            // Plantilla de dieta activa
            const { data: tplData } = await supabase
                .from('diet_templates').select('id, name').eq('client_id', clientId).eq('active', true).limit(1)

            if (tplData?.[0]) {
                setDietTemplate(tplData[0])
                const { data: mealsData } = await supabase
                    .from('template_meals').select('*').eq('template_id', tplData[0].id).order('meal_type', { ascending: true })
                setTemplateMeals(mealsData || [])
            } else {
                setDietTemplate(null)
                setTemplateMeals([])
            }

            const { data: logsData } = await supabase
                .from('daily_food_logs').select('*').eq('client_id', clientId).eq('log_date', todayStr)
            setTodayLogs(logsData || [])

            // Historial de calorías (últimos 7 días)
            const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
            const { data: histData } = await supabase
                .from('daily_food_logs').select('log_date, calories').eq('client_id', clientId).gte('log_date', sevenDaysAgo).lte('log_date', todayStr).order('log_date', { ascending: true })

            const grouped = {}
                ; (histData || []).forEach(r => {
                    if (!grouped[r.log_date]) grouped[r.log_date] = 0
                    grouped[r.log_date] += Number(r.calories || 0)
                })

            const days7 = []
            for (let i = 6; i >= 0; i--) {
                const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
                days7.push({ date: d, calories: Math.round(grouped[d] || 0) })
            }
            setCalorieHistory(days7)
        } catch (err) {
            console.error('ClientDiets loadData error:', err)
            setError('Error al cargar los datos de dieta. Intenta recargar la página.')
        } finally {
            setLoading(false)
        }
    }

    const fetchHistoryLogs = async (date) => {
        if (selectedHistoryDate === date) {
            setSelectedHistoryDate(null)
            setHistoryLogs([])
            return
        }
        setSelectedHistoryDate(date)
        setLoadingHistory(true)
        try {
            const { data } = await supabase
                .from('daily_food_logs').select('*').eq('client_id', clientId).eq('log_date', date).order('meal_type', { ascending: true })
            setHistoryLogs(data || [])
        } catch (err) {
            console.error(err)
            setHistoryLogs([])
        } finally {
            setLoadingHistory(false)
        }
    }

    const consumed = todayLogs.reduce((acc, r) => ({
        calories: acc.calories + Number(r.calories || 0),
        proteins: acc.proteins + Number(r.proteins || 0),
        carbs: acc.carbs + Number(r.carbs || 0),
        fats: acc.fats + Number(r.fats || 0),
    }), { calories: 0, proteins: 0, carbs: 0, fats: 0 })

    const handleTrackTemplate = async (mealValue) => {
        const items = templateMeals.filter(m => m.meal_type === mealValue && m.day_of_week === todayDayName)
        if (!items.length) return
        try {
            const inserts = items.map(item => ({
                client_id: clientId, log_date: todayStr, meal_type: mealValue,
                food_id: item.food_id, food_name: item.food_name, quantity: item.quantity, unit: item.unit,
                calories: item.calories, proteins: item.proteins, carbs: item.carbs, fats: item.fats,
                macros: { calories: Number(item.calories || 0), proteins: Number(item.proteins || 0), carbs: Number(item.carbs || 0), fats: Number(item.fats || 0) },
            }))
            await supabase.from('daily_food_logs').insert(inserts)
            loadData()
        } catch (err) { alert('Error al registrar comidas: ' + err.message) }
    }

    const handleDelete = async (id) => {
        try {
            await supabase.from('daily_food_logs').delete().eq('id', id)
            setTodayLogs(prev => prev.filter(r => r.id !== id))
        } catch (err) { console.error(err) }
    }

    // ── Acciones de Búsqueda (Modal) ──
    const handleSearch = async (q) => {
        if (!q || q.trim() === '') { setSearchResults([]); return }
        setSearching(true)
        try {
            const { data } = await supabase.from('food_catalog').select('*').ilike('name', `%${q.trim()}%`).limit(10)
            setSearchResults(data || [])
        } catch (err) { setSearchResults([]) }
        finally { setSearching(false) }
    }

    const onSearchChange = (e) => {
        const q = e.target.value
        setSearchQuery(q)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => handleSearch(q), 350)
    }

    const handleAddFood = async (food) => {
        try {
            await supabase.from('daily_food_logs').insert({
                client_id: clientId, log_date: todayStr, meal_type: selectedMeal.value,
                food_id: food.id, food_name: food.brand && food.brand !== 'Genérico' ? `${food.name} (${food.brand})` : food.name,
                quantity: food.serving_size, unit: food.serving_unit,
                calories: food.calories, proteins: food.proteins, carbs: food.carbs, fats: food.fats,
                macros: { calories: Number(food.calories || 0), proteins: Number(food.proteins || 0), carbs: Number(food.carbs || 0), fats: Number(food.fats || 0) },
            })
            setShowModal(false)
            setSearchQuery('')
            loadData()
        } catch (err) { alert('Error al registrar alimento: ' + err.message) }
    }

    const openModal = (meal) => {
        setSelectedMeal(meal)
        setShowModal(true)
        setSearchQuery('')
        setSearchResults([])
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--dark-900)' }}><div className="spinner spinner-lg" style={{ color: 'var(--primary-500)' }} /></div>
    if (error) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>{error}</div>

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)', paddingBottom: '5rem', color: 'var(--text-primary)' }}>

            {/* Cabecera */}
            <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-default)', padding: '0.75rem 0' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/portal/dashboard" className="btn btn-ghost btn-icon" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <FiChevronLeft size={22} />
                        </Link>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', padding: '6px', borderRadius: '8px', display: 'flex', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                                <FiTrendingUp color="white" size={16} />
                            </div>
                            Mi Nutrición
                        </h1>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>

                {/* Pantalla vacía si no hay dieta */}
                {!goals && templateMeals.length === 0 ? (
                    <div className="card glass" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <FiTarget size={36} color="var(--primary-400)" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Sin plan asignado</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Pide a tu entrenador que configure tus requerimientos calóricos diarios.</p>
                    </div>
                ) : (
                    <>
                        {/* 1. Componente de Progreso */}
                        {goals && <DietProgress goals={goals} consumed={consumed} />}

                        {/* 2. Componente del Gráfico Histórico */}
                        {goals && calorieHistory.length > 0 && (
                            <DietHistoryChart
                                goals={goals}
                                calorieHistory={calorieHistory}
                                selectedHistoryDate={selectedHistoryDate}
                                historyLogs={historyLogs}
                                loadingHistory={loadingHistory}
                                MEAL_TYPES={MEAL_TYPES}
                                onSelectDate={fetchHistoryLogs}
                                onClearDate={() => { setSelectedHistoryDate(null); setHistoryLogs([]) }}
                            />
                        )}

                        {/* 3. Componente de Lista de Comidas */}
                        <DietMealList
                            MEAL_TYPES={MEAL_TYPES}
                            todayLogs={todayLogs}
                            templateMeals={templateMeals}
                            todayDayName={todayDayName}
                            onOpenModal={openModal}
                            onTrackTemplate={handleTrackTemplate}
                            onDeleteLog={handleDelete}
                        />
                    </>
                )}
            </main>

            {/* 4. Componente Modal de Búsqueda */}
            <DietSearchModal
                showModal={showModal}
                selectedMeal={selectedMeal}
                searchQuery={searchQuery}
                searchResults={searchResults}
                searching={searching}
                onSearchChange={onSearchChange}
                onAddFood={handleAddFood}
                onClose={() => setShowModal(false)}
            />
        </div>
    )
}

export default function ClientDietsWrapper() {
    return (
        <ErrorBoundary>
            <ClientDiets />
        </ErrorBoundary>
    )
}