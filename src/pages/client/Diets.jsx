import { useState, useEffect, useRef, Component } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import {
    FiChevronLeft, FiSearch, FiCheckCircle, FiPlus,
    FiTrash2, FiCoffee, FiAlertCircle, FiTarget,
    FiSunrise, FiSun, FiMoon, FiPieChart, FiTrendingUp, FiActivity,
    FiCalendar, FiBookOpen, FiBarChart2, FiAward
} from 'react-icons/fi'

// ─── Error Boundary ─────────────────────────────────
class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }
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

// ─── Wrapper ─────────────────────────────────────────
export default function ClientDietsWrapper() {
    return (
        <ErrorBoundary>
            <ClientDiets />
        </ErrorBoundary>
    )
}

// ─── Meal types (display labels → DB values) ─────────
const MEAL_TYPES = [
    { label: 'Desayuno', value: 'Breakfast', icon: FiSunrise, color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))' },
    { label: 'Almuerzo', value: 'Lunch',     icon: FiSun,     color: 'var(--primary-400)', gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))' },
    { label: 'Cena',     value: 'Dinner',    icon: FiMoon,    color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))' },
]

const WEEKDAYS_MAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const WEEKDAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function ClientDiets() {
    const { user } = useAuth()
    const [loading, setLoading]               = useState(true)
    const [error, setError]                   = useState(null)
    const [goals, setGoals]                   = useState(null)
    const [dietTemplate, setDietTemplate]     = useState(null)
    const [templateMeals, setTemplateMeals]   = useState([])
    const [todayLogs, setTodayLogs]           = useState([])
    const [calorieHistory, setCalorieHistory]       = useState([])
    const [weekPlanDay, setWeekPlanDay]             = useState(null)
    const [selectedHistoryDate, setSelectedHistoryDate] = useState(null)
    const [historyLogs, setHistoryLogs]             = useState([])
    const [loadingHistory, setLoadingHistory]       = useState(false)

    const todayStr = new Date().toISOString().split('T')[0]
    const todayDayName = WEEKDAYS_MAP[new Date().getDay()]
    const clientId = user?.id ?? null

    // ── Search modal state ──
    const [showModal, setShowModal]           = useState(false)
    const [selectedMeal, setSelectedMeal]     = useState(MEAL_TYPES[0])
    const [searchQuery, setSearchQuery]       = useState('')
    const [searchResults, setSearchResults]   = useState([])
    const [searching, setSearching]           = useState(false)
    const debounceRef                          = useRef(null)

    useEffect(() => {
        if (!clientId) {
            setError('No se pudo identificar al cliente. Por favor, vuelve a iniciar sesión.')
            setLoading(false)
            return
        }
        loadData()
    }, [clientId])

    // ── Load nutrition goals + template + today's logs ──
    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Nutrition goals
            const { data: goalsData } = await supabase
                .from('nutrition_goals')
                .select('*')
                .eq('client_id', clientId)
                .order('assigned_at', { ascending: false })
                .limit(1)
            setGoals(goalsData?.[0] || null)

            // 2. Active diet template + its meals
            const { data: tplData } = await supabase
                .from('diet_templates')
                .select('id, name')
                .eq('client_id', clientId)
                .eq('active', true)
                .limit(1)

            if (tplData?.[0]) {
                setDietTemplate(tplData[0])
                const { data: mealsData } = await supabase
                    .from('template_meals')
                    .select('*')
                    .eq('template_id', tplData[0].id)
                    .order('meal_type', { ascending: true })
                setTemplateMeals(mealsData || [])
                // default to today's day in the weekly plan
                setWeekPlanDay(prev => prev || WEEKDAYS_MAP[new Date().getDay()])
            } else {
                setDietTemplate(null)
                setTemplateMeals([])
            }

            // 3. Today's food log
            const { data: logsData } = await supabase
                .from('daily_food_logs')
                .select('*')
                .eq('client_id', clientId)
                .eq('log_date', todayStr)
            setTodayLogs(logsData || [])

            // 4. Calorie history (last 7 days, including today)
            const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
            const { data: histData } = await supabase
                .from('daily_food_logs')
                .select('log_date, calories')
                .eq('client_id', clientId)
                .gte('log_date', sevenDaysAgo)
                .lte('log_date', todayStr)
                .order('log_date', { ascending: true })
            // group by date
            const grouped = {}
            ;(histData || []).forEach(r => {
                if (!grouped[r.log_date]) grouped[r.log_date] = 0
                grouped[r.log_date] += Number(r.calories || 0)
            })
            // Fill all 7 days (0 if no data)
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

    // ── Load logs for a specific history date ──
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
                .from('daily_food_logs')
                .select('*')
                .eq('client_id', clientId)
                .eq('log_date', date)
                .order('meal_type', { ascending: true })
            setHistoryLogs(data || [])
        } catch (err) {
            console.error(err)
            setHistoryLogs([])
        } finally {
            setLoadingHistory(false)
        }
    }

    // ── Macro totals ──
    const consumed = todayLogs.reduce((acc, r) => ({
        calories: acc.calories + Number(r.calories || 0),
        proteins: acc.proteins + Number(r.proteins || 0),
        carbs:    acc.carbs    + Number(r.carbs    || 0),
        fats:     acc.fats     + Number(r.fats     || 0),
    }), { calories: 0, proteins: 0, carbs: 0, fats: 0 })

    const calcProgress = (current, target) => {
        if (!target || target <= 0) return 0
        return Math.min(100, (current / target) * 100)
    }

    // ── Track template meal ──
    const handleTrackTemplate = async (mealValue) => {
        const items = templateMeals.filter(m => m.meal_type === mealValue)
        if (!items.length) return
        try {
            const inserts = items.map(item => ({
                client_id: clientId,
                log_date:  todayStr,
                meal_type: mealValue,
                food_id:   item.food_id,
                food_name: item.food_name,
                quantity:  item.quantity,
                unit:      item.unit,
                calories:  item.calories,
                proteins:  item.proteins,
                carbs:     item.carbs,
                fats:      item.fats,
                macros:    { calories: Number(item.calories || 0), proteins: Number(item.proteins || 0), carbs: Number(item.carbs || 0), fats: Number(item.fats || 0) },
            }))
            const { error } = await supabase.from('daily_food_logs').insert(inserts)
            if (error) throw error
            loadData()
        } catch (err) {
            console.error(err)
            alert('Error al registrar comidas: ' + err.message)
        }
    }

    // ── Delete log entry ──
    const handleDelete = async (id) => {
        try {
            const { error } = await supabase.from('daily_food_logs').delete().eq('id', id)
            if (error) throw error
            setTodayLogs(prev => prev.filter(r => r.id !== id))
        } catch (err) {
            console.error(err)
        }
    }

    // ── Search food_catalog ──
    const handleSearch = async (q) => {
        if (!q || q.trim() === '') { setSearchResults([]); return }
        setSearching(true)
        try {
            const { data, error } = await supabase
                .from('food_catalog')
                .select('*')
                .ilike('name', `%${q.trim()}%`)
                .limit(10)
            if (error) throw error
            setSearchResults(data || [])
        } catch (err) {
            console.error('food_catalog search error:', err)
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    const onSearchChange = (e) => {
        const q = e.target.value
        setSearchQuery(q)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => handleSearch(q), 350)
    }

    // ── Add food from catalog ──
    const handleAddFood = async (food) => {
        try {
            const { error } = await supabase.from('daily_food_logs').insert({
                client_id: clientId,
                log_date:  todayStr,
                meal_type: selectedMeal.value,
                food_id:   food.id,
                food_name: food.brand && food.brand !== 'Genérico'
                    ? `${food.name} (${food.brand})`
                    : food.name,
                quantity:  food.serving_size,
                unit:      food.serving_unit,
                calories:  food.calories,
                proteins:  food.proteins,
                carbs:     food.carbs,
                fats:      food.fats,
                macros:    { calories: Number(food.calories || 0), proteins: Number(food.proteins || 0), carbs: Number(food.carbs || 0), fats: Number(food.fats || 0) },
            })
            if (error) throw error
            closeModal()
            loadData()
        } catch (err) {
            console.error(err)
            alert('Error al registrar alimento: ' + err.message)
        }
    }

    const openModal = (meal) => {
        setSelectedMeal(meal)
        setShowModal(true)
        setSearchQuery('')
        setSearchResults([])
    }

    const closeModal = () => {
        setShowModal(false)
        setSearchQuery('')
        setSearchResults([])
    }

    // ── Sub-renders ──
    const renderProgressCard = (label, current, target, color, icon) => {
        const isCal = label === 'Calorías'
        const unit  = isCal ? 'kcal' : 'g'
        const pct   = calcProgress(current, target)
        const isOver = current > target && target > 0

        return (
            <div style={{ 
                background: 'var(--surface-card)', 
                padding: '1.25rem', 
                borderRadius: '1rem', 
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    position: 'absolute', top: -20, right: -20, width: 80, height: 80, 
                    background: color, filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%' 
                }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {icon}
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                    </div>
                    <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: isOver ? 'var(--danger)' : color,
                        background: `rgba(${isOver ? '239, 68, 68' : '255, 255, 255'}, 0.1)`,
                        padding: '2px 8px',
                        borderRadius: '12px'
                    }}>
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
                        width: `${Math.min(100, pct)}%`, 
                        height: '100%', 
                        background: isOver ? 'var(--danger)' : color, 
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', 
                        borderRadius: 3,
                        boxShadow: `0 0 10px ${isOver ? 'var(--danger)' : color}`
                    }} />
                </div>
            </div>
        )
    }

    const renderMealBlock = (mealInfo) => {
        const mealLogs      = todayLogs.filter(r => r.meal_type === mealInfo.value)
        const suggested     = templateMeals.filter(m => m.meal_type === mealInfo.value && m.day_of_week === todayDayName)
        const hasTracked    = mealLogs.length > 0
        const IconComponent = mealInfo.icon

        return (
            <div key={mealInfo.value} className="card" style={{ 
                marginBottom: '1.5rem', 
                overflow: 'hidden', 
                padding: '1.5rem',
                background: 'var(--surface-card)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--border-subtle)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                            width: 40, height: 40, borderRadius: '12px', 
                            background: mealInfo.gradient, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: mealInfo.color,
                            border: `1px solid rgba(255,255,255,0.05)`
                        }}>
                            <IconComponent size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                {mealInfo.label}
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {hasTracked ? `${mealLogs.length} alimentos registrados` : 'Sin registros aún'}
                            </span>
                        </div>
                    </div>
                    <button 
                        className="btn btn-sm" 
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            color: 'var(--text-primary)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            padding: '0.4rem 1rem',
                            display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s ease'
                        }} 
                        onClick={() => openModal(mealInfo)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    >
                        <FiPlus size={14} /> <span style={{ fontWeight: 600 }}>Añadir</span>
                    </button>
                </div>

                {hasTracked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {mealLogs.map(r => (
                            <div key={r.id} style={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                padding: '1rem', background: 'var(--dark-800)', 
                                borderRadius: '0.75rem', border: '1px solid var(--border-subtle)',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-700)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--dark-800)'}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>{r.food_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        <span style={{ color: mealInfo.color, fontWeight: 700, background: mealInfo.gradient, padding: '2px 6px', borderRadius: '4px' }}>{r.calories} kcal</span>
                                        <span>•</span>
                                        <span>{r.proteins}g <span style={{opacity: 0.7}}>P</span></span>
                                        <span>•</span>
                                        <span>{r.carbs}g <span style={{opacity: 0.7}}>C</span></span>
                                        <span>•</span>
                                        <span>{r.fats}g <span style={{opacity: 0.7}}>G</span></span>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-icon btn-ghost" 
                                    style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} 
                                    onClick={() => handleDelete(r.id)}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        {suggested.length > 0 ? (
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))', 
                                borderRadius: '0.75rem', padding: '1.25rem', 
                                border: '1px solid rgba(59,130,246,0.15)' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <FiTarget size={14} color="#3b82f6" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Sugerencia del Entrenador
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                    {suggested.map(f => (
                                        <div key={f.id} style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#3b82f6' }} />
                                                {f.food_name}
                                            </span>
                                            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{f.calories} kcal</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ 
                                        width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.95rem', 
                                        display: 'flex', justifyContent: 'center', gap: 8,
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        border: 'none',
                                        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                                    }}
                                    onClick={() => handleTrackTemplate(mealInfo.value)}
                                >
                                    <FiCheckCircle size={18} /> Comí esto exactamente
                                </button>
                            </div>
                        ) : (
                            <div style={{ 
                                padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)',
                                background: 'var(--dark-800)', borderRadius: '0.75rem', border: '1px dashed var(--border-strong)'
                            }}>
                                <FiCoffee size={28} style={{ marginBottom: 12, opacity: 0.3, color: mealInfo.color }} />
                                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>No has registrado nada aún</p>
                                <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.7 }}>Añade alimentos para llevar el control de tu {mealInfo.label.toLowerCase()}.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // ── Loading / Error ──
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--dark-900)' }}>
                <div className="spinner spinner-lg" style={{ color: 'var(--primary-500)' }} />
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--dark-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: '2rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
                    <FiAlertCircle size={48} color="var(--danger)" />
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>Error de Conexión</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>{error}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: '1rem' }}>
                    <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
                    <Link to="/portal/dashboard" className="btn btn-secondary">← Volver al inicio</Link>
                </div>
            </div>
        )
    }

    // ── Main render ──
    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)', paddingBottom: '5rem', color: 'var(--text-primary)' }}>
            
            {/* Background elements for aesthetic */}
            <div style={{ position: 'fixed', top: -100, left: -100, width: 400, height: 400, background: 'var(--primary-600)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: -100, right: -100, width: 300, height: 300, background: '#8b5cf6', filter: 'blur(150px)', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }} />

            {/* Header */}
            <header style={{ 
                position: 'sticky', top: 0, zIndex: 100, 
                background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', 
                borderBottom: '1px solid var(--border-default)',
                padding: '0.75rem 0'
            }}>
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
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Hoy</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
                {/* Show empty state only when there are NO goals AND NO template meals */}
                {!goals && templateMeals.length === 0 ? (
                    <div className="card glass" style={{ 
                        textAlign: 'center', padding: '4rem 2rem', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <div style={{ 
                            width: 80, height: 80, borderRadius: '50%', 
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.1)'
                        }}>
                            <FiTarget size={36} color="var(--primary-400)" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Sin plan asignado</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                            Pide a tu entrenador que configure tus requerimientos calóricos diarios desde la recepción para comenzar a registrar.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Macro progress panel — only shown when goals exist */}
                        {goals && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                                    <FiPieChart color="var(--text-primary)" size={20} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                        Resumen del Día
                                    </h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                    {renderProgressCard('Calorías',  consumed.calories, goals.calories, 'var(--primary-500)', <FiActivity size={14} color="var(--primary-400)" />)}
                                    {renderProgressCard('Proteínas', consumed.proteins, goals.proteins, '#ef4444',            <div style={{width:8, height:8, borderRadius:'50%', background:'#ef4444'}}/>)}
                                    {renderProgressCard('Carbs',     consumed.carbs,    goals.carbs,    '#f59e0b',            <div style={{width:8, height:8, borderRadius:'50%', background:'#f59e0b'}}/>)}
                                    {renderProgressCard('Grasas',    consumed.fats,     goals.fats,     '#10b981',            <div style={{width:8, height:8, borderRadius:'50%', background:'#10b981'}}/>)}
                                </div>
                            </div>
                        )}

                        {/* ── Calorie history bar chart (interactive) ── */}
                        {goals && calorieHistory.length > 0 && (
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

                                {/* Bar chart card */}
                                <div style={{ background: 'var(--surface-card)', borderRadius: '1.25rem', padding: '1.5rem 1.25rem 1rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                                    {/* Legend */}
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

                                    {/* Bars */}
                                    {(() => {
                                        const maxCal = Math.max(...calorieHistory.map(h => h.calories), goals?.calories || 1, 1)
                                        const goalCals = goals?.calories || 0
                                        const goalPct = goalCals > 0 ? (goalCals / maxCal) * 100 : 0
                                        return (
                                            <div style={{ position: 'relative' }}>
                                                {/* Goal line */}
                                                {goalCals > 0 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: `calc(28px + ${goalPct}% * 0.7)`,
                                                        left: 0, right: 0,
                                                        borderTop: '1.5px dashed rgba(251,191,36,0.7)',
                                                        zIndex: 2,
                                                        pointerEvents: 'none'
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
                                                        const dayLabel = new Date(h.date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short' })
                                                        const dateLabel = new Date(h.date + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
                                                        return (
                                                            <div
                                                                key={h.date}
                                                                onClick={() => !isEmpty && fetchHistoryLogs(h.date)}
                                                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: isEmpty ? 'default' : 'pointer' }}
                                                                title={isEmpty ? 'Sin registros' : `${h.calories} kcal — clic para ver detalle`}
                                                            >
                                                                {/* Calorie label */}
                                                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isEmpty ? 'var(--text-muted)' : isOver ? '#f87171' : reached ? '#6ee7b7' : 'var(--primary-300)', minHeight: 14, textAlign: 'center' }}>
                                                                    {isEmpty ? '' : h.calories}
                                                                </span>
                                                                {/* Bar */}
                                                                <div style={{
                                                                    width: '100%', borderRadius: '6px 6px 3px 3px',
                                                                    height: `${Math.max(isEmpty ? 6 : 12, pct * 0.7)}%`,
                                                                    background: barColor,
                                                                    boxShadow: isSelected ? `${glowColor}, 0 0 0 2px white` : glowColor,
                                                                    transition: 'height 0.6s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s',
                                                                    transform: isSelected ? 'scaleX(1.08)' : 'scaleX(1)',
                                                                    opacity: isEmpty ? 0.3 : 1,
                                                                    position: 'relative'
                                                                }} />
                                                                {/* Day name */}
                                                                <span style={{ fontSize: '0.65rem', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--primary-400)' : isSelected ? 'white' : 'var(--text-muted)', textTransform: 'capitalize', textAlign: 'center', lineHeight: 1.2 }}>
                                                                    {dayLabel}
                                                                </span>
                                                                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center' }}>{dateLabel}</span>
                                                                {isToday && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--primary-400)', display: 'block' }} />}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </div>

                                {/* Detail panel: meals of selected history date */}
                                {selectedHistoryDate && (
                                    <div style={{
                                        marginTop: '1rem',
                                        background: 'var(--surface-card)',
                                        borderRadius: '1.25rem',
                                        border: '1px solid var(--border-subtle)',
                                        overflow: 'hidden',
                                        animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1)'
                                    }}>
                                        {/* Panel header */}
                                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <FiCalendar size={15} color="var(--primary-400)" />
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                                    {new Date(selectedHistoryDate + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => { setSelectedHistoryDate(null); setHistoryLogs([]) }}
                                                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1 }}
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
                                                    {/* Summary totals */}
                                                    {(() => {
                                                        const tot = historyLogs.reduce((a, r) => ({
                                                            cal: a.cal + Number(r.calories || 0),
                                                            p: a.p + Number(r.proteins || 0),
                                                            c: a.c + Number(r.carbs || 0),
                                                            f: a.f + Number(r.fats || 0)
                                                        }), { cal: 0, p: 0, c: 0, f: 0 })
                                                        const reached = goals && tot.cal >= goals.calories * 0.9 && tot.cal <= goals.calories * 1.1
                                                        const isOver = goals && tot.cal > goals.calories * 1.1
                                                        return (
                                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
                                                                <span style={{ background: isOver ? 'rgba(239,68,68,0.15)' : reached ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)', color: isOver ? '#f87171' : reached ? '#6ee7b7' : 'var(--primary-300)', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>
                                                                    {Math.round(tot.cal)} kcal {reached ? '✓ Meta' : isOver ? '↑ Superó' : ''}
                                                                </span>
                                                                <span style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(tot.p)}g Prot</span>
                                                                <span style={{ background: 'rgba(245,158,11,0.08)', color: '#fcd34d', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(tot.c)}g Carbs</span>
                                                                <span style={{ background: 'rgba(16,185,129,0.08)', color: '#6ee7b7', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>{Math.round(tot.f)}g Grasas</span>
                                                            </div>
                                                        )
                                                    })()}

                                                    {/* Meals grouped by type */}
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
                        )}

                        {/* Banner when client has diet but no caloric goals yet */}
                        {!goals && templateMeals.length > 0 && (
                            <div style={{
                                marginBottom: '1.5rem', padding: '1rem 1.25rem',
                                borderRadius: '0.875rem', border: '1px solid rgba(245,158,11,0.3)',
                                background: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', gap: 12
                            }}>
                                <FiTarget size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    Tienes una dieta asignada por tu entrenador. Pide que configuren tus
                                    <strong style={{ color: '#f59e0b' }}> metas calóricas</strong> para ver el seguimiento completo.
                                </p>
                            </div>
                        )}

                        {/* Meal blocks — always shown when there's any diet data */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                            <FiCoffee color="var(--text-primary)" size={20} />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                Diario de Comidas
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {MEAL_TYPES.map(meal => renderMealBlock(meal))}
                        </div>
                    </>
                )}
            </main>

            {/* Search modal */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={closeModal}
                    style={{ 
                        backdropFilter: 'blur(12px)', 
                        background: 'rgba(0,0,0,0.6)', 
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div
                        className="modal glass"
                        style={{ 
                            maxWidth: 540, width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                            padding: '1.5rem', borderRadius: '1.5rem',
                            border: '1px solid var(--border-default)',
                            boxShadow: 'var(--shadow-xl)',
                            background: 'var(--surface-card)',
                            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ 
                                    width: 36, height: 36, borderRadius: '10px', 
                                    background: selectedMeal.gradient, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedMeal.color
                                }}>
                                    {(() => {
                                        const SelectedIcon = selectedMeal.icon;
                                        return <SelectedIcon size={18} />
                                    })()}
                                </div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
                                    {selectedMeal.label}
                                </h2>
                            </div>
                            <button 
                                className="btn btn-ghost btn-icon" 
                                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}
                                onClick={closeModal}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search input */}
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-400)', fontSize: '1.1rem' }} />
                            <input
                                className="form-input"
                                style={{ 
                                    paddingLeft: 48, height: 52, fontSize: '1rem',
                                    background: 'var(--dark-800)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                                placeholder="Ej. Pechuga de pollo, Arroz..."
                                value={searchQuery}
                                onChange={onSearchChange}
                                autoFocus
                            />
                        </div>

                        {/* Results */}
                        <div style={{ 
                            overflowY: 'auto', flex: 1, 
                            marginRight: '-0.5rem', paddingRight: '0.5rem',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            {searching && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', flex: 1 }}>
                                    <div className="spinner spinner-md" style={{ color: 'var(--primary-500)', marginBottom: '1rem' }} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Buscando en el catálogo...</span>
                                </div>
                            )}

                            {!searching && searchQuery && searchResults.length === 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', flex: 1, textAlign: 'center' }}>
                                    <FiSearch size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.25rem 0' }}>Sin resultados</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No encontramos "{searchQuery}". Intenta con otros términos.</p>
                                </div>
                            )}

                            {!searching && !searchQuery && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', flex: 1, textAlign: 'center' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <FiActivity size={24} style={{ color: 'var(--primary-400)', opacity: 0.8 }} />
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Encuentra cientos de alimentos verificados</p>
                                </div>
                            )}

                            {!searching && searchResults.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem' }}>
                                    {searchResults.map((food, i) => (
                                        <div key={food.id} style={{ 
                                            padding: '1rem', background: 'var(--dark-800)', 
                                            borderRadius: '12px', border: '1px solid var(--border-subtle)', 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                                            animation: `fadeIn 0.3s ease-out ${i * 0.05}s both`,
                                            transition: 'background 0.2s ease, transform 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--dark-700)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark-800)'; e.currentTarget.style.transform = 'none' }}
                                        onClick={() => handleAddFood(food)}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                                                    {food.name}
                                                    {food.brand && food.brand !== 'Genérico' && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{food.brand}</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{food.serving_size} {food.serving_unit}</span>
                                                    <span>•</span>
                                                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{food.calories} <span style={{fontWeight: 400, opacity: 0.8}}>kcal</span></span>
                                                    <span>•</span>
                                                    <span>{food.proteins}g P</span>
                                                </div>
                                            </div>
                                            <div style={{ 
                                                width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-500)', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                color: 'white', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                                            }}>
                                                <FiPlus size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* We use global styles for the animations */}
                        <style dangerouslySetInnerHTML={{__html: `
                            @keyframes slideUp {
                                from { opacity: 0; transform: translateY(20px) scale(0.98); }
                                to { opacity: 1; transform: translateY(0) scale(1); }
                            }
                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateX(-10px); }
                                to { opacity: 1; transform: translateX(0); }
                            }
                            @keyframes slideDown {
                                from { opacity: 0; transform: translateY(-10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}} />
                    </div>
                </div>
            )}
        </div>
    )
}
