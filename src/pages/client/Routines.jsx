import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiActivity } from 'react-icons/fi'
import { getClientSubscriptions, subscribeToTemplate, unsubscribeFromTemplate, getRoutineTemplates, getTemplateExercises } from '../../lib/services'

import AssignedRoutineCard from '../../components/ClientRoutines/AssignedRoutineCard'
import RoutineCatalog from '../../components/ClientRoutines/RoutineCatalog'
import RoutineDetail from '../../components/ClientRoutines/RoutineDetail'
import ExerciseViewModal from '../../components/Exercises/ExerciseViewModal'

export default function ClientRoutines() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const clientId = user?.id

    const [loading, setLoading] = useState(true)
    const [assignedRoutine, setAssignedRoutine] = useState(null)
    const [subscriptions, setSubscriptions] = useState([])
    const [allTemplates, setAllTemplates] = useState([])

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
            const { data: routData } = await supabase
                .from('routines')
                .select('*, routine_exercises(*, exercises(*))')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .maybeSingle()
            setAssignedRoutine(routData || null)

            const subs = await getClientSubscriptions(clientId)
            setSubscriptions(subs || [])

            const templates = await getRoutineTemplates()
            setAllTemplates(templates || [])

            if (subs && subs.length > 0 && templates && templates.length > 0) {
                const activeTmpl = templates.find(t => t.id === subs[0].template_id)
                if (activeTmpl) handleSelect(activeTmpl)
            } else if (!routData && templates && templates.length > 0) {
                handleSelect(templates[0])
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const handleSelect = async (tmpl) => {
        setSelectedTemplate(tmpl)
        setLoadingExs(true)
        try {
            const exs = await getTemplateExercises(tmpl.id)
            setTemplateExercises(exs || [])
        } catch (err) { console.error(err) }
        finally { setLoadingExs(false) }
    }

    const handleToggle = async (tmpl) => {
        if (acting) return
        setActing(true)
        try {
            const isSubbed = subscriptions.some(s => s.template_id === tmpl.id)
            if (isSubbed) {
                await unsubscribeFromTemplate(clientId, tmpl.id)
            } else {
                await subscribeToTemplate(clientId, tmpl.id)
            }
            await loadData()
            handleSelect(tmpl)
        } catch (err) { console.error(err) }
        finally { setActing(false) }
    }

    const subscribedIds = useMemo(() => subscriptions.map(s => s.template_id), [subscriptions])

    const filteredTemplates = useMemo(() => allTemplates.filter(t => {
        const ms = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.objective?.toLowerCase().includes(search.toLowerCase())
        const fl = filterLevel === 'all' || t.level === filterLevel
        return ms && fl
    }), [allTemplates, search, filterLevel])

    const byDay = useMemo(() => {
        const bd = {}
        templateExercises.forEach(ex => {
            const day = ex.day || 'General'
            if (!bd[day]) bd[day] = []
            bd[day].push(ex)
        })
        return bd
    }, [templateExercises])

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--dark-900)' }}><div className="spinner spinner-lg" style={{ color: 'var(--primary-500)' }} /></div>

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            {/* Header Fijo */}
            <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--surface-glass)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-default)', padding: '0.75rem 0' }}>
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

                {/* 1. Rutina Personalizada */}
                <AssignedRoutineCard
                    routine={assignedRoutine}
                    onSelectExercise={setViewingExercise}
                />

                <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 600, alignItems: 'stretch' }}>
                    {/* 2. Catálogo de Rutinas */}
                    <RoutineCatalog
                        templates={filteredTemplates}
                        subscribedIds={subscribedIds}
                        selectedTemplate={selectedTemplate}
                        search={search}
                        setSearch={setSearch}
                        filterLevel={filterLevel}
                        setFilterLevel={setFilterLevel}
                        onSelect={handleSelect}
                    />

                    {/* 3. Detalle de Rutina */}
                    <RoutineDetail
                        template={selectedTemplate}
                        byDay={byDay}
                        exercisesCount={templateExercises.length}
                        isSubscribed={subscribedIds.includes(selectedTemplate?.id)}
                        acting={acting}
                        loadingExs={loadingExs}
                        onToggle={handleToggle}
                        onSelectExercise={setViewingExercise}
                    />
                </div>
            </main>

            {/* 4. Modal Visualizador */}
            <ExerciseViewModal
                exercise={viewingExercise}
                onClose={() => setViewingExercise(null)}
            />
        </div>
    )
}