import { FiCalendar, FiImage, FiUser, FiTrash2, FiSliders, FiPlus } from 'react-icons/fi'

export default function MeasurementHistoryTable({ measurements, onDelete, onNewMeasurement }) {
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiCalendar color="var(--primary-400)" /> Historial de Registros
                    <span style={{ background: 'var(--dark-700)', padding: '2px 10px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{measurements.length}</span>
                </h2>
            </div>

            {measurements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                        <FiSliders size={30} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>No hay mediciones registradas aún para este cliente.</p>
                    <button className="btn btn-primary" style={{ marginTop: 24, borderRadius: 'var(--radius-full)' }} onClick={onNewMeasurement}>
                        <FiPlus /> Registrar la primera medición
                    </button>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ minWidth: 1000, margin: 0, border: 'none' }}>
                        <thead style={{ background: 'var(--dark-800)' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem' }}>Fecha</th>
                                <th>Peso</th>
                                <th>Grasa</th>
                                <th>Músculo</th>
                                <th>Cintura</th>
                                <th>Cadera</th>
                                <th>Brazos/Piernas</th>
                                <th>Fotos</th>
                                <th>Registró</th>
                                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...measurements].reverse().map((m, i) => (
                                <tr key={m.id} style={{ borderBottom: i === measurements.length - 1 ? 'none' : '1px solid var(--border-subtle)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-800)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {new Date(m.measurement_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>{m.weight_kg ? <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{m.weight_kg} kg</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                    <td>{m.body_fat_pct != null ? <span style={{ fontWeight: 600, color: '#ef4444' }}>{m.body_fat_pct}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                    <td>{m.muscle_pct != null ? <span style={{ fontWeight: 600, color: '#10b981' }}>{m.muscle_pct}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                    <td>{m.waist_cm ? `${m.waist_cm} cm` : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                    <td>{m.hip_cm ? `${m.hip_cm} cm` : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <span>B: {m.right_arm_cm ? `${m.right_arm_cm}cm` : '—'}</span>
                                            <span>P: {m.right_leg_cm ? `${m.right_leg_cm}cm` : '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {m.photo_front_url && <a href={m.photo_front_url} target="_blank" rel="noreferrer" title="Frente" style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}><FiImage size={14} /></a>}
                                            {m.photo_side_url && <a href={m.photo_side_url} target="_blank" rel="noreferrer" title="Perfil" style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}><FiImage size={14} /></a>}
                                            {m.photo_back_url && <a href={m.photo_back_url} target="_blank" rel="noreferrer" title="Espalda" style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}><FiImage size={14} /></a>}
                                            {!m.photo_front_url && !m.photo_side_url && !m.photo_back_url && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            <FiUser size={10} /> {m.registrador_name || 'Sistema'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)', width: 32, height: 32, background: 'rgba(239,68,68,0.1)' }} onClick={() => onDelete(m.id)} title="Eliminar registro">
                                            <FiTrash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}