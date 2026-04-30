import { useState, useEffect } from 'react'
import { FiSearch, FiPlus } from 'react-icons/fi'
import { getExercises, createExercise, updateExercise, deleteExercise } from '../../lib/services'

import ExercisesGrid from '../../components/Exercises/ExercisesGrid'
import ExerciseViewModal from '../../components/Exercises/ExerciseViewModal'
import ExerciseFormModal from '../../components/Exercises/ExerciseFormModal'

const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cuerpo Completo']

const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

export default function Exercises() {
    const [exercises, setExercises] = useState([])
    const [search, setSearch] = useState('')
    const [filterGroup, setFilterGroup] = useState('all')
    const [showFormModal, setShowFormModal] = useState(false)
    const [editingExercise, setEditingExercise] = useState(null)
    const [viewingExercise, setViewingExercise] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const data = await getExercises()
            setExercises(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filtered = exercises.filter(e => {
        const ms = !search || (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (e.muscle_group || '').toLowerCase().includes(search.toLowerCase()) ||
            (e.equipment || '').toLowerCase().includes(search.toLowerCase())
        const mg = filterGroup === 'all' || e.muscle_group === filterGroup
        return ms && mg
    })

    const groupCounts = MUSCLE_GROUPS.map(g => ({
        name: g, count: exercises.filter(e => e.muscle_group === g).length
    }))

    const openNew = () => { setEditingExercise(null); setShowFormModal(true) }
    const openEdit = (ex) => { setViewingExercise(null); setEditingExercise(ex); setShowFormModal(true) }

    const handleDelete = async (exercise) => {
        if (!window.confirm(`¿Eliminar el ejercicio "${exercise.name}"? Esta acción no se puede deshacer.`)) return
        try { await deleteExercise(exercise.id); await loadData() }
        catch (err) { console.error(err) }
    }

    const handleSave = async (formData) => {
        try {
            if (editingExercise) await updateExercise(editingExercise.id, formData)
            else await createExercise(formData)

            await loadData()
            setShowFormModal(false)
            setEditingExercise(null)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">Ejercicios</h1>
                    <p className="page-subtitle">Gestiona el catálogo de ejercicios del gimnasio</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>
                    <FiPlus /> Nuevo Ejercicio
                </button>
            </div>

            {/* Botones de Filtro por Grupo Muscular */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <button
                    className={`btn btn-sm ${filterGroup === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilterGroup('all')}>
                    Todos ({exercises.length})
                </button>
                {groupCounts.filter(g => g.count > 0).map(g => {
                    const active = filterGroup === g.name
                    return (
                        <button key={g.name}
                            className={`btn btn-sm ${active ? '' : 'btn-secondary'}`}
                            onClick={() => setFilterGroup(g.name)}
                            style={active ? { background: muscleColor[g.name] || '#94a3b8', color: 'white', border: 'none' } : {}}>
                            {g.name} ({g.count})
                        </button>
                    )
                })}
            </div>

            {/* Buscador */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="search-bar">
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar por nombre, grupo muscular o equipo..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <ExercisesGrid
                exercises={filtered}
                onView={setViewingExercise}
                onEdit={openEdit}
                onDelete={handleDelete}
            />

            <ExerciseViewModal
                exercise={viewingExercise}
                onClose={() => setViewingExercise(null)}
                onEdit={openEdit}
            />

            {showFormModal && (
                <ExerciseFormModal
                    exercise={editingExercise}
                    onSave={handleSave}
                    onClose={() => { setShowFormModal(false); setEditingExercise(null) }}
                />
            )}
        </div>
    )
}