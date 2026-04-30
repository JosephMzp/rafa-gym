import { FiActivity, FiTool, FiTarget, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi'

const muscleColor = {
    'Pecho': '#ef4444', 'Espalda': '#3b82f6', 'Piernas': '#10b981', 'Hombros': '#f59e0b',
    'Brazos': '#8b5cf6', 'Core': '#ec4899', 'Cuerpo Completo': '#06b6d4'
}

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_auto,q_auto,f_auto/`)
}

export default function ExercisesGrid({ exercises, onView, onEdit, onDelete }) {
    if (exercises.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon"><FiActivity size={40} /></div>
                <div className="empty-state-title">No se encontraron ejercicios</div>
                <p className="empty-state-description">Prueba con otros filtros o crea un nuevo ejercicio</p>
            </div>
        )
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
            {exercises.map((exercise) => {
                const color = muscleColor[exercise.muscle_group] || '#94a3b8'

                return (
                    <div key={exercise.id} className="card" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            height: 160,
                            background: exercise.image_url
                                ? `url(${optimizeUrl(exercise.image_url, 400, 320)}) center/cover no-repeat`
                                : `linear-gradient(135deg, ${color}22, ${color}08)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', borderBottom: `2px solid ${color}30`
                        }}>
                            {!exercise.image_url && <span style={{ fontSize: '3rem', opacity: 0.35 }}><FiActivity /></span>}
                            <span className="badge" style={{
                                position: 'absolute', top: '0.75rem', left: '0.75rem',
                                background: `${color}dd`, color: 'white', fontWeight: 600, fontSize: '0.6875rem'
                            }}>
                                {exercise.muscle_group}
                            </span>
                        </div>

                        <div style={{ padding: 'var(--space-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.375rem' }}>
                                {exercise.name}
                            </h3>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)', flex: 1 }}>
                                {exercise.description || 'Sin descripción'}
                            </p>

                            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FiTool size={13} /> {exercise.equipment || 'N/A'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FiTarget size={13} /> {exercise.sets_recommended}x{exercise.reps_recommended}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
                                <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={() => onView(exercise)}>
                                    <FiEye size={14} /> Ver
                                </button>
                                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => onEdit(exercise)}>
                                    <FiEdit2 size={14} /> Editar
                                </button>
                                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => onDelete(exercise)}>
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}