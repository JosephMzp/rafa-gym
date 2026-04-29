import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import {
    FiChevronLeft, FiActivity, FiSearch, FiX, FiClock, FiTarget, FiZap, FiCheckCircle, FiTool
} from 'react-icons/fi'
import {
    getClientSubscriptions, subscribeToTemplate, unsubscribeFromTemplate,
    getRoutineTemplates, getTemplateExercises
} from '../../lib/services'

const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }

const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', '/upload/w_' + w + ',h_' + h + ',c_fill,g_auto,q_auto,f_auto/')
}

export default function ClientRoutines() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const clientId = user?.id

    const [loading, setLoading] = useState(true)
    const [assignedRoutine, setAssignedRoutine] = useState(null)
    const [subscriptions, setSubscriptions] = useState([])
    const [allTemplates, setAllTemplates] = useState([])
    
    // Browse state
    const [filterLevel, setFilterLevel] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [templateExercises, setTemplateExercises] = useState([])
    const [loadingExs, setLoadingExs] = useState(false)
    const [acting, setActing] = useState(false)
    const [viewingExercise, setViewingExercise] = useState(null)

    useEffect(() => {
        if (clientId) loadData()
    }, [clientId])

    const loadData = async () => {
        setLoading(true)
        try {
            // Admin assigned routine
            const { data: routData } = await supabase
                .from('routines')
                .select('*, routine_exercises(*, exercises(*))')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .maybeSingle()
            if (routData) setAssignedRoutine(routData)
            else setAssignedRoutine(null)

            const subs = await getClientSubscriptions(clientId)
            setSubscriptions(subs || [])

            const templates = await getRoutineTemplates()
            setAllTemplates(templates || [])
            
            // If they have subscriptions, select the first one to show details by default
            if (subs && subs.length > 0 && templates && templates.length > 0) {
                const activeId = subs[0].template_id
                const activeTmpl = templates.find(t => t.id === activeId)
                if (activeTmpl) handleSelect(activeTmpl)
            } else if (!routData && templates && templates.length > 0) {
                 handleSelect(templates[0])
            }

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = async (tmpl) => {
        setSelectedTemplate(tmpl)
        setLoadingExs(true)
        try {
            const exs = await getTemplateExercises(tmpl.id)
            setTemplateExercises(exs || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingExs(false)
        }
    }

    const handleToggle = async (tmpl) => {
        if (acting) return
        setActing(true)
        try {
            const isSubbed = subscriptions.map(s => s.template_id).includes(tmpl.id)
            if (isSubbed) {
                await unsubscribeFromTemplate(clientId, tmpl.id)
            } else {
                await subscribeToTemplate(clientId, tmpl.id)
            }
            await loadData()
            // Keep the selected template
            handleSelect(tmpl)
        } catch (err) {
            console.error(err)
        } finally {
            setActing(false)
        }
    }

    const subscribedIds = subscriptions.map(s => s.template_id)
    const filtered = allTemplates.filter(t => {
        const ms = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.objective?.toLowerCase().includes(search.toLowerCase())
        const fl = filterLevel === 'all' || t.level === filterLevel
        return ms && fl
    })

    const byDay = {}
    templateExercises.forEach(ex => {
        const day = ex.day || 'General'
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(ex)
    })

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--dark-900)' }}>
                <div className="spinner spinner-lg" style={{ color: 'var(--primary-500)' }} />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ 
                position: 'sticky', top: 0, zIndex: 100, 
                background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', 
                borderBottom: '1px solid var(--border-default)',
                padding: '0.75rem 0'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/portal/dashboard" className="btn btn-ghost btn-icon" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <FiChevronLeft size={22} />
                        </Link>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', padding: '6px', borderRadius: '8px', display: 'flex', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)' }}>
                                <FiActivity color="white" size={16} />
                            </div>
                            Mis Rutinas
                        </h1>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Admin Assigned Routine Section */}
                {assignedRoutine && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.05))', borderColor: 'var(--primary-500)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
                                <FiZap size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                                    Rutina Asignada por Entrenador
                                </h2>
                                <span style={{ color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600 }}>Plan Personalizado</span>
                            </div>
                        </div>

                        {assignedRoutine.notes && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', background: 'var(--dark-800)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                "{assignedRoutine.notes}"
                            </p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {(assignedRoutine.routine_exercises || []).map((rx) => {
                                const ex = rx.exercises || {}
                                return (
                                    <div key={rx.id} style={{
                                        background: 'var(--surface-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)',
                                        cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                                    }}
                                    onClick={() => setViewingExercise(ex)}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h4 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>{ex.name}</h4>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, color: 'var(--text-muted)' }}>
                                                {ex.muscle_group}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <span><strong>{rx.sets}</strong> series</span>
                                            <span><strong>{rx.reps}</strong> reps</span>
                                            {rx.rest_time && <span><strong>{rx.rest_time}s</strong> rest</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Templates Section */}
                <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 600, alignItems: 'stretch' }}>
                    {/* Left: template list */}
                    <div className="card" style={{ width: 340, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--dark-800)' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FiSearch color="var(--primary-400)" /> Explorar Programas
                            </h3>
                            <div className="search-bar" style={{ marginBottom: '0.75rem' }}>
                                <span className="search-bar-icon"><FiSearch /></span>
                                <input placeholder="Buscar rutina..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                {['all', 'Principiante', 'Intermedio', 'Avanzado'].map(l => (
                                    <button key={l}
                                        className={'btn btn-sm ' + (filterLevel === l ? 'btn-primary' : 'btn-secondary')}
                                        onClick={() => setFilterLevel(l)}
                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                                        {l === 'all' ? 'Todos' : l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
                            {filtered.map((tmpl) => {
                                const isSubscribed = subscribedIds.includes(tmpl.id)
                                const isSelected = selectedTemplate?.id === tmpl.id
                                const lc = levelColor[tmpl.level] || '#94a3b8'
                                return (
                                    <div key={tmpl.id}
                                        onClick={() => handleSelect(tmpl)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.875rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-md)',
                                            background: isSelected ? (tmpl.color + '15') : 'transparent',
                                            borderLeft: isSelected ? ('4px solid ' + tmpl.color) : '4px solid transparent',
                                            transition: 'all 0.15s',
                                            marginBottom: '0.25rem'
                                        }}
                                        onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'var(--dark-700)' }}
                                        onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                                    >
                                        <span style={{ fontSize: '1.5rem', filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' : 'none' }}>{tmpl.emoji}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                                {tmpl.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: lc, fontWeight: 600 }}>{tmpl.level}</div>
                                        </div>
                                        {isSubscribed && (
                                            <FiCheckCircle size={18} color="#10b981" />
                                        )}
                                    </div>
                                )
                            })}
                            {filtered.length === 0 && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No se encontraron rutinas
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: detail */}
                    <div className="card" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                        {!selectedTemplate ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <FiActivity size={48} style={{opacity:0.2, marginBottom:'1rem'}} />
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Explora Programas</h3>
                                <p>Selecciona una rutina de la lista para ver sus detalles e inscribirte.</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${selectedTemplate.color}40, ${selectedTemplate.color}10)`, fontSize: '2.5rem', border: `1px solid ${selectedTemplate.color}40` }}>
                                        {selectedTemplate.emoji}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 250 }}>
                                        <h3 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                                            {selectedTemplate.name}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                            <span className="badge" style={{ background: (levelColor[selectedTemplate.level] || '#94a3b8') + '20', color: levelColor[selectedTemplate.level] || '#94a3b8', fontWeight: 700, padding: '4px 10px' }}>
                                                {selectedTemplate.level}
                                            </span>
                                            <span className="badge badge-neutral" style={{ padding: '4px 10px' }}>
                                                <FiClock size={12} style={{ marginRight: 4 }} />{selectedTemplate.duration}
                                            </span>
                                            <span className="badge badge-neutral" style={{ padding: '4px 10px' }}>
                                                <FiTarget size={12} style={{ marginRight: 4 }} />{selectedTemplate.objective}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className={'btn btn-lg ' + (subscribedIds.includes(selectedTemplate.id) ? 'btn-danger' : 'btn-primary')}
                                        disabled={acting}
                                        onClick={() => handleToggle(selectedTemplate)}
                                        style={{ whiteSpace: 'nowrap' }}>
                                        {acting ? 'Procesando...' : subscribedIds.includes(selectedTemplate.id) ? '✕ Cancelar Suscripción' : '+ Iniciar Programa'}
                                    </button>
                                </div>

                                <div style={{ background: 'var(--dark-800)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--border-subtle)' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Acerca del programa</h4>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                                        {selectedTemplate.description}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Programa de Entrenamiento</h4>
                                </div>

                                {loadingExs ? (
                                    <div className="spinner spinner-lg" style={{ margin: '3rem auto' }}></div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {Object.keys(byDay).map(day => (
                                            <div key={day} style={{ background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                                                <h5 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8, color: selectedTemplate.color }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedTemplate.color }} />
                                                    {day}
                                                </h5>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {byDay[day].map((ex, i) => {
                                                        const exData = ex.exercises || {}
                                                        return (
                                                            <div key={i} 
                                                                onClick={() => setViewingExercise(exData)}
                                                                style={{
                                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                                                    background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                                }}
                                                                onMouseEnter={e => { e.currentTarget.style.borderColor = selectedTemplate.color || 'var(--primary-400)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
                                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                                        {i + 1}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{exData.name}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{exData.muscle_group}</div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                                        {ex.sets} <span style={{opacity:0.6, fontSize:'0.75rem', fontWeight:500}}>SERIES</span>
                                                                    </span>
                                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                                        {ex.reps} <span style={{opacity:0.6, fontSize:'0.75rem', fontWeight:500}}>REPS</span>
                                                                    </span>
                                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                                        {ex.rest_time}s <span style={{opacity:0.6, fontSize:'0.75rem', fontWeight:500}}>DESCANSO</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {viewingExercise && (
                <div className="modal-overlay" style={{ zIndex: 1100, padding: 'var(--space-md)' }} onClick={() => setViewingExercise(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Close button layered on top */}
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                            <button
                                onClick={() => setViewingExercise(null)}
                                style={{
                                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                                    width: 36, height: 36, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'scale(1)' }}
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Media Section */}
                        <div style={{
                            width: '100%',
                            background: viewingExercise.video_url || viewingExercise.image_url ? '#000' : `linear-gradient(135deg, ${(muscleColor[viewingExercise.muscle_group] || '#94a3b8')}40, ${(muscleColor[viewingExercise.muscle_group] || '#94a3b8')}10)`,
                            position: 'relative'
                        }}>
                            {viewingExercise.video_url ? (
                                <video
                                    src={viewingExercise.video_url}
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    style={{
                                        width: '100%', maxHeight: 320, minHeight: 200,
                                        objectFit: 'contain', display: 'block',
                                        borderBottom: `2px solid ${(muscleColor[viewingExercise.muscle_group] || '#94a3b8')}40`
                                    }}
                                />
                            ) : viewingExercise.image_url ? (
                                <img
                                    src={optimizeUrl(viewingExercise.image_url, 800, 600)}
                                    alt={viewingExercise.name}
                                    style={{
                                        width: '100%', height: 280, objectFit: 'cover', display: 'block',
                                        borderBottom: `2px solid ${(muscleColor[viewingExercise.muscle_group] || '#94a3b8')}40`
                                    }}
                                />
                            ) : (
                                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `2px solid ${(muscleColor[viewingExercise.muscle_group] || '#94a3b8')}40` }}>
                                    <FiActivity size={64} style={{ opacity: 0.3, color: muscleColor[viewingExercise.muscle_group] || '#94a3b8' }} />
                                </div>
                            )}
                            
                            {/* Gradient Overlay for seamless transition */}
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
                                background: 'linear-gradient(to top, var(--surface-card) 0%, transparent 100%)',
                                pointerEvents: 'none'
                            }}></div>
                        </div>

                        {/* Content Section */}
                        <div style={{ padding: '0 var(--space-xl) var(--space-xl)', background: 'var(--surface-card)', marginTop: '-1rem', position: 'relative', zIndex: 5 }}>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', paddingTop: '1rem' }}>
                                    <div>
                                        <h2 style={{
                                            fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800,
                                            color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.2
                                        }}>
                                            {viewingExercise.name}
                                        </h2>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: muscleColor[viewingExercise.muscle_group] || '#94a3b8', boxShadow: `0 0 8px ${muscleColor[viewingExercise.muscle_group] || '#94a3b8'}` }}></div>
                                            {viewingExercise.muscle_group}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)',
                                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                                marginBottom: 'var(--space-xl)', cursor: 'default'
                            }}>
                                <div style={{ background: 'var(--dark-500)', width: 44, height: 44, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                                    <FiTool size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Equipo Necesario</div>
                                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{viewingExercise.equipment || 'Ninguno / Peso Corporal'}</div>
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--surface-base)',
                                borderLeft: `3px solid ${muscleColor[viewingExercise.muscle_group] || 'var(--primary-500)'}`,
                                padding: 'var(--space-md) var(--space-lg)',
                                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                                marginBottom: 'var(--space-xs)'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <FiCheckCircle size={14} /> Instrucciones
                                </div>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {viewingExercise.description || 'Sigue las instrucciones de tu entrenador para este ejercicio.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
