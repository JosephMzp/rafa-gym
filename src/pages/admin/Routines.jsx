import { useState, useEffect } from 'react'
import { FiSearch, FiPlus, FiFilter, FiList, FiUsers } from 'react-icons/fi'
import { getRoutineTemplates, createRoutineTemplate, updateRoutineTemplate, deleteRoutineTemplate, saveTemplateExercises, getAllSubscriptions, subscribeToTemplate, unsubscribeFromTemplate, getTemplateExercises } from '../../lib/services'

import RoutinesStats from '../../components/Routines/RoutinesStats'
import TemplatesGrid from '../../components/Routines/TemplatesGrid'
import SubscriptionsTable from '../../components/Routines/SubscriptionsTable'
import TemplateDetailModal from '../../components/Routines/TemplateDetailModal'
import TemplateFormModal from '../../components/Routines/TemplateFormModal'
import AddSubscriptionModal from '../../components/Routines/AddSubscriptionModal'

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado']

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
            setTemplates(t); setSubscriptions(s)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filteredTemplates = templates.filter(t => {
        const ms = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.objective?.toLowerCase().includes(search.toLowerCase())
        const fl = filterLevel === 'all' || t.level === filterLevel
        return ms && fl
    })

    const filteredSubs = subscriptions.filter(s => {
        return !search || s.client?.name?.toLowerCase().includes(search.toLowerCase()) || s.template?.name?.toLowerCase().includes(search.toLowerCase())
    })

    async function handleViewTemplate(tmpl) {
        setViewing(tmpl)
        try {
            const [exs, subs] = await Promise.all([
                getTemplateExercises(tmpl.id),
                import('../../lib/services').then(m => m.getTemplateSubscribers(tmpl.id))
            ])
            setViewExercises(exs); setViewSubs(subs)
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

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            {/* Header */}
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

            <RoutinesStats templates={templates} subscriptions={subscriptions} />

            <div className="tabs" style={{ marginBottom: 'var(--space-xl)' }}>
                <button className={`tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
                    <FiList size={14} style={{ marginRight: '0.375rem' }} /> Biblioteca de Rutinas
                </button>
                <button className={`tab ${tab === 'subscriptions' ? 'active' : ''}`} onClick={() => setTab('subscriptions')}>
                    <FiUsers size={14} style={{ marginRight: '0.375rem' }} /> Suscripciones <span className="badge badge-primary" style={{ marginLeft: '0.375rem' }}>{subscriptions.length}</span>
                </button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder={tab === 'templates' ? 'Buscar por nombre u objetivo...' : 'Buscar por cliente o rutina...'} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {tab === 'templates' && (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <FiFilter size={14} color="var(--text-muted)" />
                        {['all', ...LEVELS].map(l => (
                            <button key={l} className={`btn btn-sm ${filterLevel === l ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterLevel(l)}>
                                {l === 'all' ? 'Todos' : l}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {tab === 'templates' ? (
                <TemplatesGrid
                    templates={filteredTemplates}
                    subscriptions={subscriptions}
                    onView={handleViewTemplate}
                    onEdit={tmpl => { setEditing(tmpl); setShowForm(true) }}
                    onDelete={handleDelete}
                />
            ) : (
                <SubscriptionsTable
                    subscriptions={filteredSubs}
                    templates={templates}
                    onUnsubscribe={handleUnsubscribe}
                />
            )}

            <TemplateDetailModal
                template={viewing}
                exercises={viewExercises}
                subscribers={viewSubs}
                onClose={() => { setViewing(null); setViewExercises([]); setViewSubs([]) }}
                onEdit={() => { const t = viewing; setViewing(null); setViewExercises([]); setViewSubs([]); setEditing(t); setShowForm(true) }}
            />

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