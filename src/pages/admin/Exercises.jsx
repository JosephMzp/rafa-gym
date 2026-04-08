import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiPlus, FiX, FiEdit2, FiTrash2, FiEye, FiTarget, FiTool } from 'react-icons/fi'
import { getExercises, createExercise, updateExercise, deleteExercise } from '../../lib/services'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cuerpo Completo']

const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', '/upload/w_' + w + ',h_' + h + ',c_fill,g_auto,q_auto,f_auto/')
}

async function uploadToCloudinary(file, folder) {
    var fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', folder)
    var res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    var data = await res.json()
    return data.secure_url
}

export default function Exercises() {
    const [exercises, setExercises] = useState([])
    const [search, setSearch] = useState('')
    const [filterGroup, setFilterGroup] = useState('all')
    const [showFormModal, setShowFormModal] = useState(false)
    const [editingExercise, setEditingExercise] = useState(null)
    const [viewingExercise, setViewingExercise] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(function () { loadData() }, [])

    async function loadData() {
        try {
            var data = await getExercises()
            setExercises(data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    var filtered = exercises.filter(function (e) {
        var ms = !search || (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (e.muscle_group || '').toLowerCase().includes(search.toLowerCase()) ||
            (e.equipment || '').toLowerCase().includes(search.toLowerCase())
        var mg = filterGroup === 'all' || e.muscle_group === filterGroup
        return ms && mg
    })

    var groupCounts = MUSCLE_GROUPS.map(function (g) {
        return { name: g, count: exercises.filter(function (e) { return e.muscle_group === g }).length }
    })

    function openNew() {
        setEditingExercise(null)
        setShowFormModal(true)
    }

    function openEdit(ex) {
        setEditingExercise(ex)
        setShowFormModal(true)
    }

    async function handleDelete(exercise) {
        if (!window.confirm('¿Eliminar el ejercicio "' + exercise.name + '"? Esta acción no se puede deshacer.')) return
        try { await deleteExercise(exercise.id); await loadData() }
        catch (err) { console.error(err) }
    }

    async function handleSave(formData) {
        try {
            if (editingExercise) {
                await updateExercise(editingExercise.id, formData)
            } else {
                await createExercise(formData)
            }
            await loadData()
            setShowFormModal(false)
            setEditingExercise(null)
        } catch (err) { console.error(err) }
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ejercicios</h1>
                    <p className="page-subtitle">Gestiona el catalogo de ejercicios del gimnasio</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>
                    <FiPlus /> Nuevo Ejercicio
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <button
                    className={'btn btn-sm ' + (filterGroup === 'all' ? 'btn-primary' : 'btn-secondary')}
                    onClick={function () { setFilterGroup('all') }}>
                    Todos ({exercises.length})
                </button>
                {groupCounts.filter(function (g) { return g.count > 0 }).map(function (g) {
                    var active = filterGroup === g.name
                    return (
                        <button key={g.name}
                            className={'btn btn-sm ' + (active ? '' : 'btn-secondary')}
                            onClick={function () { setFilterGroup(g.name) }}
                            style={active ? { background: muscleColor[g.name] || '#94a3b8', color: 'white', border: 'none' } : {}}>
                            {g.name} ({g.count})
                        </button>
                    )
                })}
            </div>

            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="search-bar">
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar por nombre, grupo muscular o equipo..."
                        value={search} onChange={function (e) { setSearch(e.target.value) }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                {filtered.map(function (exercise) {
                    var color = muscleColor[exercise.muscle_group] || '#94a3b8'

                    return (
                        <div key={exercise.id} className="card" style={{
                            overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{
                                height: 160,
                                background: exercise.image_url
                                    ? 'url(' + optimizeUrl(exercise.image_url, 400, 320) + ') center/cover no-repeat'
                                    : 'linear-gradient(135deg, ' + color + '22, ' + color + '08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', borderBottom: '2px solid ' + color + '30'
                            }}>
                                {!exercise.image_url && (
                                    <span style={{ fontSize: '3rem', opacity: 0.35 }}>{'🏋️'}</span>
                                )}
                                <span className="badge" style={{
                                    position: 'absolute', top: '0.75rem', left: '0.75rem',
                                    background: color + 'dd', color: 'white', fontWeight: 600, fontSize: '0.6875rem'
                                }}>
                                    {exercise.muscle_group}
                                </span>
                            </div>

                            <div style={{ padding: 'var(--space-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.375rem' }}>
                                    {exercise.name}
                                </h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)', flex: 1 }}>
                                    {exercise.description || 'Sin descripcion'}
                                </p>

                                <div style={{
                                    display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)',
                                    fontSize: '0.8125rem', color: 'var(--text-secondary)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <FiTool size={13} /> {exercise.equipment || 'N/A'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <FiTarget size={13} /> {exercise.sets_recommended}x{exercise.reps_recommended}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex', gap: 'var(--space-sm)',
                                    borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)'
                                }}>
                                    <button className="btn btn-sm btn-ghost" style={{ flex: 1 }}
                                        onClick={function () { setViewingExercise(exercise) }}>
                                        <FiEye size={14} /> Ver
                                    </button>
                                    <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}
                                        onClick={function () { openEdit(exercise) }}>
                                        <FiEdit2 size={14} /> Editar
                                    </button>
                                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}
                                        onClick={function () { handleDelete(exercise) }}>
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">{'🏋️'}</div>
                    <div className="empty-state-title">No se encontraron ejercicios</div>
                    <p className="empty-state-description">Prueba con otros filtros o crea un nuevo ejercicio</p>
                </div>
            )}

            {viewingExercise && (
                <div className="modal-overlay" onClick={function () { setViewingExercise(null) }}>
                    <div className="modal" onClick={function (e) { e.stopPropagation() }} style={{ maxWidth: 520 }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Ejercicio</h2>
                            <button className="btn btn-ghost btn-icon" onClick={function () { setViewingExercise(null) }}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body">
                            {viewingExercise.image_url && (
                                <img
                                    src={optimizeUrl(viewingExercise.image_url, 600, 400)}
                                    alt={viewingExercise.name}
                                    style={{
                                        width: '100%', height: 220, objectFit: 'cover',
                                        borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)'
                                    }}
                                />
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <span className="form-label">Nombre</span>
                                    <span style={{ fontWeight: 600, fontSize: '1.0625rem' }}>{viewingExercise.name}</span>
                                </div>
                                <div className="form-group">
                                    <span className="form-label">Grupo Muscular</span>
                                    <span className="badge" style={{
                                        background: (muscleColor[viewingExercise.muscle_group] || '#94a3b8') + '20',
                                        color: muscleColor[viewingExercise.muscle_group] || '#94a3b8',
                                        fontWeight: 600, display: 'inline-block'
                                    }}>{viewingExercise.muscle_group}</span>
                                </div>
                                <div className="form-group">
                                    <span className="form-label">Equipo</span>
                                    <span style={{ fontWeight: 500 }}>{viewingExercise.equipment || 'Sin equipo'}</span>
                                </div>
                                <div className="form-group">
                                    <span className="form-label">Series x Repeticiones</span>
                                    <span style={{ fontWeight: 500 }}>{viewingExercise.sets_recommended} x {viewingExercise.reps_recommended}</span>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                                <span className="form-label">Descripcion</span>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {viewingExercise.description || 'Sin descripcion'}
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={function () { setViewingExercise(null) }}>Cerrar</button>
                            <button className="btn btn-primary" onClick={function () { setViewingExercise(null); openEdit(viewingExercise) }}>
                                <FiEdit2 /> Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFormModal && (
                <ExerciseFormModal
                    exercise={editingExercise}
                    onSave={handleSave}
                    onClose={function () { setShowFormModal(false); setEditingExercise(null) }}
                />
            )}
        </div>
    )
}

function ExerciseFormModal(props) {
    var exercise = props.exercise
    var onSave = props.onSave
    var onClose = props.onClose

    var _name = useState(exercise ? exercise.name || '' : '')
    var _desc = useState(exercise ? exercise.description || '' : '')
    var _group = useState(exercise ? exercise.muscle_group || MUSCLE_GROUPS[0] : MUSCLE_GROUPS[0])
    var _equip = useState(exercise ? exercise.equipment || '' : '')
    var _sets = useState(exercise ? exercise.sets_recommended || 3 : 3)
    var _reps = useState(exercise ? exercise.reps_recommended || '' : '')
    var _img = useState(exercise ? exercise.image_url || '' : '')
    var _uploading = useState(false)
    var _preview = useState(null)
    var _imgError = useState(null)
    var fileRef = useRef(null)

    var name = _name[0], setName = _name[1]
    var desc = _desc[0], setDesc = _desc[1]
    var group = _group[0], setGroup = _group[1]
    var equip = _equip[0], setEquip = _equip[1]
    var sets = _sets[0], setSets = _sets[1]
    var reps = _reps[0], setReps = _reps[1]
    var imgUrl = _img[0], setImgUrl = _img[1]
    var uploading = _uploading[0], setUploading = _uploading[1]
    var preview = _preview[0], setPreview = _preview[1]
    var imgError = _imgError[0], setImgError = _imgError[1]

    var displayImg = preview || (imgUrl ? optimizeUrl(imgUrl, 640, 400) : null)

    async function handleFile(file) {
        if (!file) return
        if (!file.type.startsWith('image/')) { setImgError('Solo se permiten imagenes'); return }
        if (file.size > 5 * 1024 * 1024) { setImgError('La imagen no puede superar 5MB'); return }
        setImgError(null)

        var reader = new FileReader()
        reader.onload = function (ev) { setPreview(ev.target.result) }
        reader.readAsDataURL(file)

        //Cloudinary
        setUploading(true)
        try {
            var url = await uploadToCloudinary(file, 'rafagym/exercises')
            setImgUrl(url)
        } catch (err) {
            console.error('Upload error:', err)
            setImgError('Error al subir imagen')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    function removeImage() {
        setPreview(null)
        setImgUrl('')
        setImgError(null)
    }

    function doSave() {
        onSave({
            name: name,
            description: desc,
            muscle_group: group,
            equipment: equip,
            sets_recommended: sets,
            reps_recommended: reps,
            image_url: imgUrl || null
        })
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={function (e) { e.stopPropagation() }}>
                <div className="modal-header">
                    <h2 className="modal-title">{exercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>

                <div className="modal-body">
                    {/* Image upload area */}
                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <label className="form-label">Imagen del Ejercicio</label>
                        <div
                            onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                            onDragOver={function (e) { e.preventDefault() }}
                            onDrop={function (e) { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
                            style={{
                                width: '100%', maxWidth: 400, height: 180,
                                borderRadius: 'var(--radius-lg)', margin: '0 auto',
                                cursor: uploading ? 'wait' : 'pointer',
                                background: displayImg
                                    ? 'url(' + displayImg + ') center/cover no-repeat'
                                    : 'var(--dark-600)',
                                border: '2px dashed var(--border-subtle)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'column', gap: '0.5rem',
                                position: 'relative', overflow: 'hidden',
                                transition: 'border-color 0.2s'
                            }}
                        >
                            {uploading && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,0,0,0.6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div className="spinner" style={{ width: 32, height: 32 }}></div>
                                </div>
                            )}
                            {!displayImg && !uploading && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: '0.25rem' }}>{'📷'}</div>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        Clic o arrastra una imagen aqui
                                    </span>
                                </div>
                            )}
                        </div>

                        {displayImg && !uploading && (
                            <div style={{ textAlign: 'center', marginTop: '0.375rem' }}>
                                <button onClick={removeImage}
                                    style={{
                                        background: 'none', border: 'none', color: 'var(--danger)',
                                        cursor: 'pointer', fontSize: '0.75rem',
                                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem'
                                    }}>
                                    <FiX size={12} /> Quitar imagen
                                </button>
                            </div>
                        )}

                        {imgError && (
                            <p style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.375rem' }}>
                                {imgError}
                            </p>
                        )}

                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={function (e) { handleFile(e.target.files[0]) }} />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Nombre del Ejercicio *</label>
                            <input className="form-input" value={name}
                                onChange={function (e) { setName(e.target.value) }}
                                placeholder="Ej: Press Banca" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Grupo Muscular *</label>
                            <select className="form-input" value={group}
                                onChange={function (e) { setGroup(e.target.value) }}>
                                {MUSCLE_GROUPS.map(function (g) {
                                    return <option key={g} value={g}>{g}</option>
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Equipo Necesario</label>
                            <input className="form-input" value={equip}
                                onChange={function (e) { setEquip(e.target.value) }}
                                placeholder="Barra, Mancuernas, Maquina..." />
                        </div>

                        <div className="form-group" style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Series</label>
                                <input className="form-input" type="number" min="1" max="10" value={sets}
                                    onChange={function (e) { setSets(parseInt(e.target.value) || 0) }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Repeticiones</label>
                                <input className="form-input" value={reps}
                                    onChange={function (e) { setReps(e.target.value) }}
                                    placeholder="8-12" />
                            </div>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                        <label className="form-label">Descripcion</label>
                        <textarea className="form-input" rows={3} value={desc}
                            onChange={function (e) { setDesc(e.target.value) }}
                            placeholder="Descripcion del ejercicio, tecnica, consejos..."
                            style={{ resize: 'vertical' }} />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={doSave} disabled={!name || uploading}>
                        {exercise ? 'Guardar Cambios' : 'Crear Ejercicio'}
                    </button>
                </div>
            </div>
        </div>
    )
}
