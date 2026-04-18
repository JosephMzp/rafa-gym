import { useState, useEffect } from 'react'
import {
    FiSearch, FiPlus, FiX, FiEdit2, FiTrash2, FiEye, FiTarget,
    FiClock, FiUsers, FiChevronDown, FiChevronUp, FiFilter, FiBookOpen
} from 'react-icons/fi'
import {
    getRoutineTemplates, createRoutineTemplate, updateRoutineTemplate, deleteRoutineTemplate,
    getTemplateExercises, saveTemplateExercises,
    getAllSubscriptions, subscribeToTemplate, unsubscribeFromTemplate,
    getExercises, getClients
} from '../../lib/services'

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado']
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom']
const EMOJIS = ['💪', '🔥', '🏃', '⚡', '🍑', '🏋️', '🌿', '🎯', '🏅', '💥', '🎽', '🧘']
const COLORS = ['#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#f97316']
const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }
const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

export default function Routines() {
    const [tab, setTab] = useState('templates')
    const [templates, setTemplates] = useState([])
    const [subscriptions, setSubscriptions] = useState([])
    const [search, setSearch] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [viewing, setViewing] = useState(null)
    const [viewExercises, setViewExercises] = useState([])
    const [viewSubs, setViewSubs] = useState([])
    const [showSubModal, setShowSubModal] = useState(false)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [t, s] = await Promise.all([getRoutineTemplates(), getAllSubscriptions()])
            setTemplates(t)
            setSubscriptions(s)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filteredTemplates = templates.filter(t => {
        const ms = !search ||
            t.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.objective?.toLowerCase().includes(search.toLowerCase())
        const fl = filterLevel === 'all' || t.level === filterLevel
        return ms && fl
    })

    const filteredSubs = subscriptions.filter(s => {
        return !search ||
            s.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.template?.name?.toLowerCase().includes(search.toLowerCase())
    })

    async function handleViewTemplate(tmpl) {
        setViewing(tmpl)
        try {
            const [exs, subs] = await Promise.all([
                getTemplateExercises(tmpl.id),
                import('../../lib/services').then(m => m.getTemplateSubscribers(tmpl.id))
            ])
            setViewExercises(exs)
            setViewSubs(subs)
        } catch (err) { console.error(err); setViewExercises([]); setViewSubs([]) }
    }

    async function handleDelete(tmpl) {
        if (!window.confirm(`¿Eliminar la plantilla "${tmpl.name}"?`)) return
        try { await deleteRoutineTemplate(tmpl.id); await loadData() }
        catch (err) { console.error(err) }
    }

    async function handleSaveTemplate(data, exerciseList) {
        try {
            let templateId
            if (editing) {
                await updateRoutineTemplate(editing.id, data)
                templateId = editing.id
            } else {
                const created = await createRoutineTemplate(data)
                templateId = created.id
            }
            if (exerciseList && exerciseList.length > 0) {
                await saveTemplateExercises(templateId, exerciseList)
            }
            await loadData()
            setShowForm(false)
            setEditing(null)
        } catch (err) { console.error(err) }
    }

    async function handleUnsubscribe(sub) {
        if (!window.confirm(`¿Quitar a ${sub.client?.name} de "${sub.template?.name}"?`)) return
        try {
            await unsubscribeFromTemplate(sub.client_id, sub.template_id)
            await loadData()
        } catch (err) { console.error(err) }
    }

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner spinner-lg"></div>
        </div>
    )

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Rutinas Predefinidas</h1>
                    <p className="page-subtitle">Biblioteca de programas de entrenamiento y suscripciones de clientes</p>
                </div>
                {tab === 'templates' && (
                    <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
                        <FiPlus /> Nueva Plantilla
                    </button>
                )}
                {tab === 'subscriptions' && (
                    <button className="btn btn-primary" onClick={() => setShowSubModal(true)}>
                        <FiPlus /> Suscribir Cliente
                    </button>
                )}
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><FiBookOpen /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Plantillas activas</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{templates.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><FiUsers /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Suscripciones activas</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{subscriptions.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}><FiTarget /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Principiantes</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{templates.filter(t => t.level === 'Principiante').length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><FiTarget /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Avanzadas</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{templates.filter(t => t.level === 'Avanzado').length}</div></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-xl)' }}>
                <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
                    📋 Biblioteca de Rutinas
                </button>
                <button className={`tab ${tab === 'subscriptions' ? 'active' : ''}`} onClick={() => setTab('subscriptions')}>
                    👥 Suscripciones <span className="badge badge-primary" style={{ marginLeft: '0.375rem' }}>{subscriptions.length}</span>
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input
                        placeholder={tab === 'templates' ? 'Buscar por nombre u objetivo...' : 'Buscar por cliente o rutina...'}
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {tab === 'templates' && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <FiFilter size={14} color="var(--text-muted)" />
                        {['all', ...LEVELS].map(l => (
                            <button key={l}
                                className={`btn btn-sm ${filterLevel === l ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilterLevel(l)}>
                                {l === 'all' ? 'Todos' : l}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* TEMPLATES TAB */}
            {tab === 'templates' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
                    {filteredTemplates.map(tmpl => {
                        const lColor = levelColor[tmpl.level] || '#94a3b8'
                        const subCount = subscriptions.filter(s => s.template_id === tmpl.id).length
                        const exerciseCount = tmpl.routine_template_exercises?.[0]?.count || 0

                        return (
                            <div key={tmpl.id} className="card" style={{
                                borderTop: `3px solid ${tmpl.color}`,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'default'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${tmpl.color}25` }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>

                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 52, height: 52, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: `${tmpl.color}20`, fontSize: '1.75rem', flexShrink: 0
                                        }}>{tmpl.emoji}</div>
                                        <div>
                                            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{tmpl.name}</h3>
                                            <span className="badge" style={{ background: `${lColor}20`, color: lColor, fontWeight: 600, fontSize: '0.6875rem' }}>
                                                {tmpl.level}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 'var(--space-md)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {tmpl.description}
                                </p>

                                {/* Meta row */}
                                <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        <FiTarget size={13} color={tmpl.color} />
                                        <span>{tmpl.objective}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        <FiClock size={13} /> {tmpl.duration}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        <FiUsers size={13} /> {subCount} suscriptor{subCount !== 1 ? 'es' : ''}
                                    </div>
                                </div>

                                {/* Days */}
                                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                                    {(tmpl.days || []).map(d => (
                                        <span key={d} className="badge" style={{ background: `${tmpl.color}20`, color: tmpl.color, fontWeight: 700, fontSize: '0.6875rem' }}>{d}</span>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
                                    <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={() => handleViewTemplate(tmpl)}>
                                        <FiEye size={13} /> Ver
                                    </button>
                                    <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => { setEditing(tmpl); setShowForm(true) }}>
                                        <FiEdit2 size={13} /> Editar
                                    </button>
                                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(tmpl)}>
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    {filteredTemplates.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <div className="empty-state-icon">📋</div>
                            <div className="empty-state-title">No se encontraron rutinas</div>
                        </div>
                    )}
                </div>
            )}

            {/* SUBSCRIPTIONS TAB */}
            {tab === 'subscriptions' && (
                <div>
                    {filteredSubs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">👥</div>
                            <div className="empty-state-title">No hay suscripciones activas</div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Rutina</th>
                                        <th>Nivel</th>
                                        <th>Suscrito desde</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubs.map(sub => (
                                        <tr key={sub.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                    <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.875rem' }}>
                                                        {sub.client?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span style={{ fontWeight: 600 }}>{sub.client?.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1.25rem' }}>{sub.template?.emoji}</span>
                                                    <span style={{ fontWeight: 600, color: sub.template?.color }}>{sub.template?.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: `${levelColor[templates.find(t => t.id === sub.template_id)?.level] || '#94a3b8'}20`,
                                                    color: levelColor[templates.find(t => t.id === sub.template_id)?.level] || '#94a3b8'
                                                }}>
                                                    {templates.find(t => t.id === sub.template_id)?.level || '-'}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {new Date(sub.subscribed_at).toLocaleDateString('es-PE')}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    style={{ color: 'var(--danger)' }}
                                                    onClick={() => handleUnsubscribe(sub)}>
                                                    <FiX size={14} /> Quitar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* MODALS */}
            {viewing && (
                <DetailModal
                    template={viewing}
                    exercises={viewExercises}
                    subscribers={viewSubs}
                    onClose={() => { setViewing(null); setViewExercises([]); setViewSubs([]) }}
                    onEdit={() => { const t = viewing; setViewing(null); setViewExercises([]); setViewSubs([]); setEditing(t); setShowForm(true) }}
                />
            )}

            {showForm && (
                <TemplateFormModal
                    template={editing}
                    onSave={handleSaveTemplate}
                    onClose={() => { setShowForm(false); setEditing(null) }}
                />
            )}

            {showSubModal && (
                <AddSubscriptionModal
                    templates={templates}
                    onSave={async (clientId, templateId) => {
                        await subscribeToTemplate(clientId, templateId)
                        await loadData()
                        setShowSubModal(false)
                    }}
                    onClose={() => setShowSubModal(false)}
                />
            )}
        </div>
    )
}

// ─── Detail Modal ────────────────────────────────────────────
function DetailModal({ template, exercises, subscribers, onClose, onEdit }) {
    const lColor = levelColor[template.level] || '#94a3b8'

    const byDay = {}
    exercises.forEach(ex => {
        const day = ex.day || 'General'
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(ex)
    })

    return (
        <div className="modal-overlay" onClick={onClose} style={{ padding: '0', background: 'rgba(5, 5, 10, 0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '95vh', overflow: 'hidden', padding: 0, borderRadius: '24px', background: 'var(--dark-800)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: `0 20px 60px -10px ${template.color}30, 0 0 0 1px rgba(255,255,255,0.05)` }}>
                {/* Hero Header with color gradient */}
                <div style={{ position: 'relative', height: '180px', background: `linear-gradient(135deg, var(--dark-700) 0%, var(--dark-900) 100%)`, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '140%', height: '200%', background: `radial-gradient(ellipse at center, ${template.color}40 0%, transparent 60%)`, filter: 'blur(40px)', zIndex: 0 }}></div>
                    
                    {/* Top controls */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 'var(--space-lg)', display: 'flex', justifyContent: 'flex-end', zIndex: 2 }}>
                        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%' }}><FiX size={20} /></button>
                    </div>

                    {/* Emoji display */}
                    <div style={{ position: 'absolute', bottom: '-40px', left: 'var(--space-2xl)', width: '100px', height: '100px', borderRadius: '30px', background: 'var(--dark-800)', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 3 }}>
                        {template.emoji}
                    </div>
                </div>

                <div style={{ padding: 'var(--space-2xl)', paddingTop: '3rem', overflowY: 'auto', maxHeight: 'calc(95vh - 180px)' }}>
                    
                    {/* Title & Badges Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.5rem', background: `linear-gradient(to right, white, ${template.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {template.name}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="badge" style={{ background: `${lColor}20`, color: lColor, border: `1px solid ${lColor}40`, padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                                    {template.level}
                                </span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                                    <FiClock size={13} style={{ marginRight: '0.25rem' }} /> {template.duration}
                                </span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                                    <FiTarget size={13} style={{ marginRight: '0.25rem' }} /> {template.objective}
                                </span>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={onEdit} style={{ background: template.color, boxShadow: `0 4px 15px ${template.color}40`, border: 'none', borderRadius: '12px' }}>
                            <FiEdit2 /> Editar Plantilla
                        </button>
                    </div>

                    {/* Description */}
                    <div style={{ padding: 'var(--space-lg)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 'var(--space-2xl)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
                            {template.description}
                        </p>
                    </div>

                    {/* Days Configuration */}
                    <div style={{ marginBottom: 'var(--space-2xl)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: template.color }}>📅</span> Días de Entrenamiento
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {(template.days || []).map(d => (
                                <div key={d} style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${template.color}15`, border: `1px solid ${template.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: template.color, fontWeight: 700, fontSize: '0.875rem' }}>
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Exercises Section */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-lg)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: template.color }}>⚡</span> Programa
                            </h3>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{exercises.length} ejercicios en total</span>
                        </div>

                        {Object.keys(byDay).length === 0 && (
                            <div className="empty-state" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                <div className="empty-state-icon" style={{ fontSize: '2rem', opacity: 0.5 }}>🤷‍♂️</div>
                                <div className="empty-state-title" style={{ fontSize: '1rem' }}>Aún no hay ejercicios programados</div>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                            {Object.keys(byDay).map(day => (
                                <div key={day}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-md)' }}>
                                        <div style={{ padding: '0.375rem 1rem', background: `${template.color}15`, color: template.color, borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.875rem' }}>
                                            Día {day}
                                        </div>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{byDay[day].length} ejercicios</div>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                                        {byDay[day].map((ex, i) => {
                                            const exData = ex.exercises || {}
                                            const mc = muscleColor[exData.muscle_group] || '#94a3b8'
                                            return (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                                                    padding: '1rem', borderRadius: '16px',
                                                    background: 'var(--dark-700)', border: '1px solid rgba(255,255,255,0.02)',
                                                    transition: 'transform 0.2s, background 0.2s'
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-overlay)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark-700)'; e.currentTarget.style.transform = '' }}>
                                                    
                                                    <div style={{ width: '4px', height: '36px', borderRadius: '4px', background: mc }}></div>
                                                    
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{exData.name}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            <span style={{ color: mc }}>{exData.muscle_group}</span>
                                                            <span>•</span>
                                                            <span>{exData.equipment || 'Sin equipo'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Series x Reps</div>
                                                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{ex.sets} <span style={{ color: 'var(--text-muted)' }}>×</span> {ex.reps}</div>
                                                        </div>
                                                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
                                                        <div style={{ width: '48px', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Desc</div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ex.rest_seconds}s</div>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subscribers Section */}
                    {subscribers.length > 0 && (
                        <div style={{ marginTop: 'var(--space-3xl)' }}>
                            <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: 'var(--space-2xl)' }}></div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                                {subscribers.length} {subscribers.length === 1 ? 'cliente activo' : 'clientes activos'} entrenando con esta rutina
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                                {subscribers.map(s => (
                                    <div key={s.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.25rem 0.75rem 0.25rem 0.25rem', borderRadius: 'var(--radius-full)',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem', background: 'var(--dark-500)', fontWeight: 700, color: template.color }}>{s.client?.name?.charAt(0)}</div>
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{s.client?.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Template Form Modal ──────────────────────────────────────
function TemplateFormModal({ template, onSave, onClose }) {
    const [name, setName] = useState(template?.name || '')
    const [description, setDescription] = useState(template?.description || '')
    const [objective, setObjective] = useState(template?.objective || '')
    const [level, setLevel] = useState(template?.level || LEVELS[0])
    const [duration, setDuration] = useState(template?.duration || '')
    const [days, setDays] = useState(template?.days || [])
    const [emoji, setEmoji] = useState(template?.emoji || '💪')
    const [color, setColor] = useState(template?.color || '#8b5cf6')
    const [exList, setExList] = useState([])
    const [allExercises, setAllExercises] = useState([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const exs = await getExercises()
                setAllExercises(exs)
                if (template) {
                    const existing = await getTemplateExercises(template.id)
                    setExList(existing.map(ex => ({
                        exercise_id: ex.exercise_id,
                        day: ex.day || '',
                        sets: ex.sets || 3,
                        reps: ex.reps || '',
                        rest_seconds: ex.rest_seconds || 60,
                        order_index: ex.order_index || 1,
                        _name: ex.exercises?.name || '',
                        _muscle: ex.exercises?.muscle_group || ''
                    })))
                }
            } catch (err) { console.error(err) }
            finally { setLoadingData(false) }
        }
        load()
    }, [])

    function toggleDay(d) {
        setDays(days.includes(d) ? days.filter(x => x !== d) : [...days, d])
    }

    function addExercise() {
        if (!allExercises.length) return
        const first = allExercises[0]
        setExList([...exList, {
            exercise_id: first.id, day: days[0] || 'Lun',
            sets: 3, reps: '10-12', rest_seconds: 60,
            order_index: exList.length + 1,
            _name: first.name, _muscle: first.muscle_group
        }])
    }

    function updateEx(i, field, val) {
        setExList(exList.map((item, idx) => {
            if (idx !== i) return item
            const copy = { ...item, [field]: val }
            if (field === 'exercise_id') {
                const found = allExercises.find(e => e.id === val)
                if (found) { copy._name = found.name; copy._muscle = found.muscle_group }
            }
            return copy
        }))
    }

    function doSave() {
        onSave({ name, description, objective, level, duration, days, emoji, color }, exList)
    }

    if (loadingData) return (
        <div className="modal-overlay">
            <div className="modal" style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner spinner-lg"></div>
            </div>
        </div>
    )

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '92vh', overflow: 'auto' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{template ? '✏️ Editar Plantilla' : '✨ Nueva Plantilla de Rutina'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    {/* Emoji & Color */}
                    <div style={{ display: 'flex', gap: 'var(--space-xl)', marginBottom: 'var(--space-lg)', alignItems: 'flex-start' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Ícono</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', maxWidth: 200 }}>
                                {EMOJIS.map(e => (
                                    <button key={e} type="button"
                                        onClick={() => setEmoji(e)}
                                        style={{
                                            width: 36, height: 36, fontSize: '1.25rem', borderRadius: '8px', border: '2px solid',
                                            borderColor: emoji === e ? color : 'var(--border-subtle)',
                                            background: emoji === e ? `${color}20` : 'var(--dark-600)', cursor: 'pointer'
                                        }}>{e}</button>
                                ))}
                            </div>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Color</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', maxWidth: 160 }}>
                                {COLORS.map(c => (
                                    <button key={c} type="button"
                                        onClick={() => setColor(c)}
                                        style={{
                                            width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                                            border: color === c ? `3px solid white` : '3px solid transparent',
                                            outline: color === c ? `2px solid ${c}` : 'none'
                                        }} />
                                ))}
                            </div>
                        </div>
                        <div style={{
                            width: 72, height: 72, borderRadius: 16, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', background: `${color}20`, fontSize: '2.5rem', flexShrink: 0,
                            border: `2px solid ${color}40`
                        }}>{emoji}</div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nombre *</label>
                            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Quema Grasa Total" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Objetivo</label>
                            <input className="form-input" value={objective} onChange={e => setObjective(e.target.value)} placeholder="Pérdida de peso, ganar músculo..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nivel</label>
                            <select className="form-input" value={level} onChange={e => setLevel(e.target.value)}>
                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duración</label>
                            <input className="form-input" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ej: 8 semanas" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descripción</label>
                        <textarea className="form-input" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe brevemente esta rutina..." style={{ resize: 'vertical' }} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Días de entrenamiento</label>
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                            {DAYS.map(d => (
                                <button key={d} type="button"
                                    className={`btn btn-sm ${days.includes(d) ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => toggleDay(d)}>{d}</button>
                            ))}
                        </div>
                    </div>

                    {/* Exercises */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Ejercicios ({exList.length})</h3>
                            <button className="btn btn-sm btn-primary" type="button" onClick={addExercise}><FiPlus size={13} /> Agregar</button>
                        </div>
                        {exList.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>
                                Agrega ejercicios a esta rutina
                            </p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {exList.map((item, i) => {
                                const mc = muscleColor[item._muscle] || '#94a3b8'
                                return (
                                    <div key={i} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', borderLeft: `3px solid ${mc}`, background: 'var(--dark-600)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: mc }}>#{i + 1} {item._muscle || ''}</span>
                                            <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--danger)' }}
                                                type="button" onClick={() => setExList(exList.filter((_, idx) => idx !== i))}>
                                                <FiX size={13} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                            <select className="form-input" value={item.exercise_id} onChange={e => updateEx(i, 'exercise_id', e.target.value)} style={{ fontSize: '0.875rem' }}>
                                                {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle_group})</option>)}
                                            </select>
                                            <select className="form-input" value={item.day} onChange={e => updateEx(i, 'day', e.target.value)} style={{ fontSize: '0.875rem', width: 90 }}>
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                                            <div>
                                                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Series</label>
                                                <input className="form-input" type="number" min="1" max="10" value={item.sets}
                                                    onChange={e => updateEx(i, 'sets', parseInt(e.target.value) || 0)} style={{ fontSize: '0.875rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Repeticiones</label>
                                                <input className="form-input" value={item.reps} onChange={e => updateEx(i, 'reps', e.target.value)} placeholder="8-12" style={{ fontSize: '0.875rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Descanso (s)</label>
                                                <input className="form-input" type="number" min="0" value={item.rest_seconds}
                                                    onChange={e => updateEx(i, 'rest_seconds', parseInt(e.target.value) || 0)} style={{ fontSize: '0.875rem' }} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={doSave} disabled={!name}>
                        {template ? 'Guardar Cambios' : '✨ Crear Plantilla'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Add Subscription Modal ───────────────────────────────────
function AddSubscriptionModal({ templates, onSave, onClose }) {
    const [clients, setClients] = useState([])
    const [clientId, setClientId] = useState('')
    const [templateId, setTemplateId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        getClients().then(c => { setClients(c); setLoading(false) }).catch(console.error)
    }, [])

    const filteredClients = clients.filter(c =>
        !search || c.name?.toLowerCase().includes(search.toLowerCase())
    )

    async function doSave() {
        if (!clientId || !templateId) return
        setSaving(true)
        try { await onSave(clientId, templateId) }
        catch (err) { console.error(err); setSaving(false) }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div className="modal-header">
                    <h2 className="modal-title">Suscribir Cliente a Rutina</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner spinner-lg"></div></div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Buscar cliente</label>
                                <div className="search-bar">
                                    <span className="search-bar-icon"><FiSearch /></span>
                                    <input placeholder="Nombre del cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <select className="form-input" style={{ marginTop: '0.5rem' }} value={clientId} onChange={e => setClientId(e.target.value)}>
                                    <option value="">Seleccionar cliente...</option>
                                    {filteredClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rutina</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {templates.map(t => (
                                        <div key={t.id}
                                            onClick={() => setTemplateId(t.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                                                background: templateId === t.id ? `${t.color}15` : 'var(--dark-600)',
                                                border: `2px solid ${templateId === t.id ? t.color : 'var(--border-subtle)'}`,
                                                transition: 'all 0.15s'
                                            }}>
                                            <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{t.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.level} • {t.duration}</div>
                                            </div>
                                            {templateId === t.id && <span style={{ marginLeft: 'auto', color: t.color, fontWeight: 700 }}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" disabled={!clientId || !templateId || saving} onClick={doSave}>
                        {saving ? 'Guardando...' : '✅ Suscribir'}
                    </button>
                </div>
            </div>
        </div>
    )
}
