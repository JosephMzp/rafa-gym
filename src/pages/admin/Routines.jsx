import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiPlus, FiX, FiEdit2, FiTrash2, FiEye, FiTarget, FiUser, FiCalendar, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import {
    getRoutines, createRoutine, updateRoutine, deleteRoutine,
    getRoutineExercises, saveRoutineExercises,
    getExercises, getClients
} from '../../lib/services'

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado']
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom']

const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }
const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

export default function Routines() {
    var _routines = useState([])
    var _search = useState('')
    var _filterStatus = useState('all')
    var _loading = useState(true)
    var _showForm = useState(false)
    var _editing = useState(null)
    var _viewing = useState(null)
    var _viewExercises = useState([])

    var routines = _routines[0], setRoutines = _routines[1]
    var search = _search[0], setSearch = _search[1]
    var filterStatus = _filterStatus[0], setFilterStatus = _filterStatus[1]
    var loading = _loading[0], setLoading = _loading[1]
    var showForm = _showForm[0], setShowForm = _showForm[1]
    var editing = _editing[0], setEditing = _editing[1]
    var viewing = _viewing[0], setViewing = _viewing[1]
    var viewExercises = _viewExercises[0], setViewExercises = _viewExercises[1]

    useEffect(function () { loadData() }, [])

    async function loadData() {
        try {
            var data = await getRoutines()
            setRoutines(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    var filtered = routines.filter(function (r) {
        var ms = !search || (r.client_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.objective || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.trainer_name || '').toLowerCase().includes(search.toLowerCase())
        var fs = filterStatus === 'all' || r.status === filterStatus
        return ms && fs
    })

    var totalActive = routines.filter(function (r) { return r.status === 'active' }).length

    async function handleView(routine) {
        setViewing(routine)
        try {
            var exs = await getRoutineExercises(routine.id)
            setViewExercises(exs)
        } catch (err) { console.error(err); setViewExercises([]) }
    }

    async function handleDelete(routine) {
        if (!window.confirm('¿Eliminar la rutina de ' + (routine.client_name || 'este cliente') + '?')) return
        try { await deleteRoutine(routine.id); await loadData() }
        catch (err) { console.error(err) }
    }

    async function handleSave(data, exerciseList) {
        try {
            var routineId
            if (editing) {
                await updateRoutine(editing.id, data)
                routineId = editing.id
            } else {
                var created = await createRoutine(data)
                routineId = created.id
            }
            if (exerciseList && exerciseList.length > 0) {
                await saveRoutineExercises(routineId, exerciseList)
            }
            await loadData()
            setShowForm(false)
            setEditing(null)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Rutinas</h1>
                    <p className="page-subtitle">Rutinas personalizadas asignadas por entrenadores</p>
                </div>
                <button className="btn btn-primary" onClick={function () { setEditing(null); setShowForm(true) }}>
                    <FiPlus /> Nueva Rutina
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-card-content"><div className="stat-card-label">Total Rutinas</div><div className="stat-card-value">{routines.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content"><div className="stat-card-label">Activas</div><div className="stat-card-value" style={{ color: 'var(--success)' }}>{totalActive}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content"><div className="stat-card-label">Finalizadas</div><div className="stat-card-value" style={{ color: 'var(--text-muted)' }}>{routines.length - totalActive}</div></div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar por cliente, entrenador u objetivo..." value={search}
                        onChange={function (e) { setSearch(e.target.value) }} />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    {['all', 'active', 'completed'].map(function (s) {
                        return (
                            <button key={s} className={'tab ' + (filterStatus === s ? 'active' : '')}
                                onClick={function () { setFilterStatus(s) }}>
                                {s === 'all' ? 'Todas' : s === 'active' ? 'Activas' : 'Finalizadas'}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
                {filtered.map(function (r) {
                    var lColor = levelColor[r.level] || '#94a3b8'
                    return (
                        <div key={r.id} className="card" style={{ opacity: r.status === 'active' ? 1 : 0.65 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{r.client_name || 'Sin cliente'}</h3>
                                    <span className={'badge ' + (r.status === 'active' ? 'badge-success' : 'badge-neutral')}>
                                        {r.status === 'active' ? 'Activa' : 'Finalizada'}
                                    </span>
                                </div>
                                <div className="avatar" style={{ width: 44, height: 44 }}>{(r.client_name || '?').charAt(0)}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiTarget size={14} color="var(--primary-400)" /> <strong>Objetivo:</strong> {r.objective || '-'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiUser size={14} color="var(--primary-400)" /> <strong>Entrenador:</strong> {r.trainer_name || r.trainer || '-'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiClock size={14} color="var(--primary-400)" /> <strong>Duracion:</strong> {r.duration || '-'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                <span className="form-label" style={{ margin: 0, fontSize: '0.6875rem' }}>NIVEL</span>
                                <span className="badge" style={{ background: lColor + '20', color: lColor, fontWeight: 600 }}>{r.level}</span>
                            </div>

                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <span className="form-label" style={{ fontSize: '0.6875rem' }}>DIAS</span>
                                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                    {(r.days || []).map(function (d) {
                                        return <span key={d} className="badge badge-primary">{d}</span>
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
                                <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={function () { handleView(r) }}>
                                    <FiEye size={14} /> Ver
                                </button>
                                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={function () { setEditing(r); setShowForm(true) }}>
                                    <FiEdit2 size={14} /> Editar
                                </button>
                                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={function () { handleDelete(r) }}>
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">{'📋'}</div>
                    <div className="empty-state-title">No se encontraron rutinas</div>
                </div>
            )}

            {viewing && (
                <DetailModal routine={viewing} exercises={viewExercises}
                    onClose={function () { setViewing(null); setViewExercises([]) }}
                    onEdit={function () { setViewing(null); setViewExercises([]); setEditing(viewing); setShowForm(true) }}
                />
            )}

            {showForm && (
                <FormModal
                    routine={editing}
                    onSave={handleSave}
                    onClose={function () { setShowForm(false); setEditing(null) }}
                />
            )}
        </div>
    )
}

function DetailModal(props) {
    var routine = props.routine
    var exercises = props.exercises
    var onClose = props.onClose
    var onEdit = props.onEdit
    var lColor = levelColor[routine.level] || '#94a3b8'

    var byDay = {}
    exercises.forEach(function (ex) {
        var day = ex.day || 'Sin dia'
        if (!byDay[day]) byDay[day] = []
        byDay[day].push(ex)
    })

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={function (e) { e.stopPropagation() }} style={{ maxWidth: 600 }}>
                <div className="modal-header">
                    <h2 className="modal-title">Rutina de {routine.client_name}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        <div className="form-group"><span className="form-label">Cliente</span><span style={{ fontWeight: 600 }}>{routine.client_name}</span></div>
                        <div className="form-group"><span className="form-label">Entrenador</span><span style={{ fontWeight: 500 }}>{routine.trainer_name || routine.trainer}</span></div>
                        <div className="form-group"><span className="form-label">Objetivo</span><span style={{ fontWeight: 500 }}>{routine.objective}</span></div>
                        <div className="form-group">
                            <span className="form-label">Nivel</span>
                            <span className="badge" style={{ background: lColor + '20', color: lColor, fontWeight: 600 }}>{routine.level}</span>
                        </div>
                        <div className="form-group"><span className="form-label">Duracion</span><span style={{ fontWeight: 500 }}>{routine.duration}</span></div>
                        <div className="form-group"><span className="form-label">Estado</span>
                            <span className={'badge ' + (routine.status === 'active' ? 'badge-success' : 'badge-neutral')}>
                                {routine.status === 'active' ? 'Activa' : 'Finalizada'}
                            </span>
                        </div>
                    </div>

                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 'var(--space-md)' }}>Ejercicios por dia</h3>
                    {Object.keys(byDay).length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay ejercicios asignados</p>
                    )}
                    {Object.keys(byDay).map(function (day) {
                        return (
                            <div key={day} style={{ marginBottom: 'var(--space-lg)' }}>
                                <div className="badge badge-primary" style={{ marginBottom: 'var(--space-sm)' }}>{day}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {byDay[day].map(function (ex, idx) {
                                        var exData = ex.exercises || {}
                                        var mc = muscleColor[exData.muscle_group] || '#94a3b8'
                                        return (
                                            <div key={ex.id || idx} style={{
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                                                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                                                background: 'var(--dark-600)', borderLeft: '3px solid ' + mc
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{exData.name || 'Ejercicio'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {exData.muscle_group} • {exData.equipment || 'Sin equipo'}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                    <div style={{ fontWeight: 600 }}>{ex.sets} x {ex.reps}</div>
                                                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Descanso: {ex.rest_seconds}s</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    <button className="btn btn-primary" onClick={onEdit}><FiEdit2 /> Editar</button>
                </div>
            </div>
        </div>
    )
}

function FormModal(props) {
    var routine = props.routine
    var onSave = props.onSave
    var onClose = props.onClose

    var _clientId = useState(routine ? routine.client_id : '')
    var _trainer = useState(routine ? routine.trainer_name || '' : '')
    var _objective = useState(routine ? routine.objective || '' : '')
    var _level = useState(routine ? routine.level || LEVELS[0] : LEVELS[0])
    var _days = useState(routine ? routine.days || [] : [])
    var _duration = useState(routine ? routine.duration || '' : '')
    var _status = useState(routine ? routine.status || 'active' : 'active')
    var _exList = useState([])
    var _allExercises = useState([])
    var _clients = useState([])
    var _loadingData = useState(true)

    var clientId = _clientId[0], setClientId = _clientId[1]
    var trainer = _trainer[0], setTrainer = _trainer[1]
    var objective = _objective[0], setObjective = _objective[1]
    var level = _level[0], setLevel = _level[1]
    var days = _days[0], setDays = _days[1]
    var duration = _duration[0], setDuration = _duration[1]
    var status = _status[0], setStatus = _status[1]
    var exList = _exList[0], setExList = _exList[1]
    var allExercises = _allExercises[0], setAllExercises = _allExercises[1]
    var clients = _clients[0], setClients = _clients[1]
    var loadingData = _loadingData[0], setLoadingData = _loadingData[1]

    useEffect(function () {
        async function load() {
            try {
                var results = await Promise.all([getExercises(), getClients()])
                setAllExercises(results[0])
                setClients(results[1])

                if (routine) {
                    var existing = await getRoutineExercises(routine.id)
                    setExList(existing.map(function (ex) {
                        return {
                            exercise_id: ex.exercise_id,
                            day: ex.day || '',
                            sets: ex.sets || 3,
                            reps: ex.reps || '',
                            rest_seconds: ex.rest_seconds || 60,
                            order_index: ex.order_index || 1,
                            _name: ex.exercises?.name || '',
                            _muscle: ex.exercises?.muscle_group || ''
                        }
                    }))
                }
            } catch (err) { console.error(err) }
            finally { setLoadingData(false) }
        }
        load()
    }, [])

    function toggleDay(day) {
        if (days.includes(day)) {
            setDays(days.filter(function (d) { return d !== day }))
        } else {
            setDays(days.concat([day]))
        }
    }

    function addExercise() {
        if (allExercises.length === 0) return
        var first = allExercises[0]
        setExList(exList.concat([{
            exercise_id: first.id,
            day: days[0] || 'Lun',
            sets: 3,
            reps: '10-12',
            rest_seconds: 60,
            order_index: exList.length + 1,
            _name: first.name,
            _muscle: first.muscle_group
        }]))
    }

    function updateExItem(index, field, value) {
        var updated = exList.map(function (item, i) {
            if (i !== index) return item
            var copy = Object.assign({}, item)
            copy[field] = value
            if (field === 'exercise_id') {
                var found = allExercises.find(function (e) { return e.id === value })
                if (found) { copy._name = found.name; copy._muscle = found.muscle_group }
            }
            return copy
        })
        setExList(updated)
    }

    function removeExItem(index) {
        setExList(exList.filter(function (_, i) { return i !== index }))
    }

    function doSave() {
        var routineData = {
            client_id: clientId,
            trainer_name: trainer,
            objective: objective,
            level: level,
            days: days,
            duration: duration,
            status: status
        }
        onSave(routineData, exList)
    }

    if (loadingData) {
        return (
            <div className="modal-overlay"><div className="modal" style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner spinner-lg"></div><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando datos...</p>
            </div></div>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={function (e) { e.stopPropagation() }} style={{ maxWidth: 720, maxHeight: '90vh', overflow: 'auto' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{routine ? 'Editar Rutina' : 'Nueva Rutina'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Cliente *</label>
                            <select className="form-input" value={clientId} onChange={function (e) { setClientId(e.target.value) }}>
                                <option value="">Seleccionar cliente...</option>
                                {clients.map(function (c) {
                                    return <option key={c.id} value={c.id}>{c.name}</option>
                                })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Entrenador *</label>
                            <input className="form-input" value={trainer} onChange={function (e) { setTrainer(e.target.value) }}
                                placeholder="Nombre del entrenador" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Objetivo *</label>
                            <input className="form-input" value={objective} onChange={function (e) { setObjective(e.target.value) }}
                                placeholder="Ganancia muscular, perdida de peso..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nivel</label>
                            <select className="form-input" value={level} onChange={function (e) { setLevel(e.target.value) }}>
                                {LEVELS.map(function (l) { return <option key={l} value={l}>{l}</option> })}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duracion</label>
                            <input className="form-input" value={duration} onChange={function (e) { setDuration(e.target.value) }}
                                placeholder="Ej: 8 semanas" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Estado</label>
                            <select className="form-input" value={status} onChange={function (e) { setStatus(e.target.value) }}>
                                <option value="active">Activa</option>
                                <option value="completed">Finalizada</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                        <label className="form-label">Dias de Entrenamiento</label>
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                            {DAYS.map(function (d) {
                                var active = days.includes(d)
                                return (
                                    <button key={d}
                                        className={'btn btn-sm ' + (active ? 'btn-primary' : 'btn-secondary')}
                                        onClick={function () { toggleDay(d) }}
                                        type="button">
                                        {d}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-xl)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Ejercicios de la Rutina ({exList.length})</h3>
                            <button className="btn btn-sm btn-primary" onClick={addExercise} type="button">
                                <FiPlus size={14} /> Agregar
                            </button>
                        </div>

                        {exList.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>
                                No hay ejercicios agregados. Usa el boton "Agregar" para incluir ejercicios.
                            </p>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {exList.map(function (item, index) {
                                var mc = muscleColor[item._muscle] || '#94a3b8'
                                return (
                                    <div key={index} style={{
                                        border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                                        padding: 'var(--space-md)', borderLeft: '3px solid ' + mc,
                                        background: 'var(--dark-600)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: mc }}>#{index + 1} {item._muscle || ''}</span>
                                            <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, color: 'var(--danger)' }}
                                                onClick={function () { removeExItem(index) }} type="button">
                                                <FiX size={14} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                            <select className="form-input" value={item.exercise_id}
                                                onChange={function (e) { updateExItem(index, 'exercise_id', e.target.value) }}
                                                style={{ fontSize: '0.875rem' }}>
                                                {allExercises.map(function (ex) {
                                                    return <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscle_group})</option>
                                                })}
                                            </select>
                                            <select className="form-input" value={item.day}
                                                onChange={function (e) { updateExItem(index, 'day', e.target.value) }}
                                                style={{ fontSize: '0.875rem', width: 90 }}>
                                                {DAYS.map(function (d) { return <option key={d} value={d}>{d}</option> })}
                                            </select>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
                                            <div>
                                                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Series</label>
                                                <input className="form-input" type="number" min="1" max="10" value={item.sets}
                                                    onChange={function (e) { updateExItem(index, 'sets', parseInt(e.target.value) || 0) }}
                                                    style={{ fontSize: '0.875rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Repeticiones</label>
                                                <input className="form-input" value={item.reps}
                                                    onChange={function (e) { updateExItem(index, 'reps', e.target.value) }}
                                                    placeholder="8-12" style={{ fontSize: '0.875rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Descanso (s)</label>
                                                <input className="form-input" type="number" min="0" value={item.rest_seconds}
                                                    onChange={function (e) { updateExItem(index, 'rest_seconds', parseInt(e.target.value) || 0) }}
                                                    style={{ fontSize: '0.875rem' }} />
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
                    <button className="btn btn-primary" onClick={doSave} disabled={!clientId || !objective}>
                        {routine ? 'Guardar Cambios' : 'Crear Rutina'}
                    </button>
                </div>
            </div>
        </div>
    )
}
