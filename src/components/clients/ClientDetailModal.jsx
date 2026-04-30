import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FiUser, FiAward, FiSliders, FiZap, FiBookOpen,
    FiActivity, FiDollarSign, FiEdit2, FiX, FiMail,
    FiPhone, FiCalendar, FiMapPin, FiAlertCircle,
    FiClock, FiTrendingUp, FiCheckCircle, FiExternalLink
} from 'react-icons/fi'
import { getClientFullDetail, getClientMeasurements } from '../../lib/services'
import { getOptimizedUrl } from '../../lib/cloudinary'


export default function ClientDetailModal({ client, onClose, onEdit }) {
    const [activeTab, setActiveTab] = useState('info')
    const [detail, setDetail] = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    useEffect(() => {
        if (client) {
            setLoadingDetail(true)
            getClientFullDetail(client.id)
                .then(d => setDetail(d))
                .catch(console.error)
                .finally(() => setLoadingDetail(false))
        }
    }, [client])

    // Membership progress
    const membershipProgress = () => {
        if (!client.membership_start || !client.membership_end) return null
        const start = new Date(client.membership_start).getTime()
        const end = new Date(client.membership_end).getTime()
        const now = Date.now()
        const total = end - start
        const elapsed = now - start
        const pct = Math.min(100, Math.max(0, (elapsed / total) * 100))
        const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
        return { pct, daysLeft }
    }

    const mp = membershipProgress()
    const color = client.membership_type?.color || 'var(--primary-500)'
    const memberInitial = client.name?.charAt(0).toUpperCase()

    const tabs = [
        { id: 'info', label: 'Perfil', icon: <FiUser size={14} /> },
        { id: 'membership', label: 'Membresía', icon: <FiAward size={14} /> },
        { id: 'measurements', label: 'Medidas', icon: <FiSliders size={14} /> },
        { id: 'routines', label: 'Rutinas', icon: <FiZap size={14} /> },
        { id: 'classes', label: 'Clases', icon: <FiBookOpen size={14} /> },
        { id: 'attendance', label: 'Asistencia', icon: <FiActivity size={14} /> },
        { id: 'payments', label: 'Pagos', icon: <FiDollarSign size={14} /> },
    ]

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-xl" onClick={e => e.stopPropagation()}
                style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* ── Hero Header ── */}
                <div style={{
                    background: `linear-gradient(135deg, ${color}25 0%, var(--dark-600) 100%)`,
                    padding: '1.75rem 2rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    position: 'relative',
                    flexShrink: 0,
                }}>
                    {/* Close + Edit */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={onEdit}>
                            <FiEdit2 size={13} /> Editar
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                    </div>

                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            {client.photo_url ? (
                                <img src={getOptimizedUrl(client.photo_url, { width: 200, height: 200 })} alt={client.name}
                                    style={{
                                        width: 84, height: 84, borderRadius: '50%', objectFit: 'cover',
                                        border: `3px solid ${color}`, boxShadow: `0 0 20px ${color}40`
                                    }} />
                            ) : (
                                <div style={{
                                    width: 84, height: 84, borderRadius: '50%', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${color}, ${color}99)`,
                                    fontSize: '2rem', fontWeight: 800, color: '#fff',
                                    border: `3px solid ${color}60`, boxShadow: `0 0 20px ${color}40`,
                                    fontFamily: 'var(--font-display)'
                                }}>{memberInitial}</div>
                            )}
                            <div style={{
                                position: 'absolute', bottom: 2, right: 2,
                                width: 18, height: 18, borderRadius: '50%',
                                background: client.status === 'active' ? 'var(--success)' : 'var(--danger)',
                                border: '2px solid var(--dark-600)'
                            }} />
                        </div>

                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                                {client.name}
                            </h2>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                    {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                                {client.membership_type && (
                                    <span className="badge" style={{ background: `${color}25`, color }}>
                                        {client.membership_type.icon} {client.membership_type.name}
                                    </span>
                                )}
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    DNI {client.document}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.65rem 1.1rem', background: 'none', border: 'none',
                                    cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.8125rem', fontWeight: 600,
                                    color: activeTab === t.id ? color : 'var(--text-secondary)',
                                    borderBottom: `2px solid ${activeTab === t.id ? color : 'transparent'}`,
                                    transition: 'all 0.2s', marginBottom: -1,
                                }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
                    {loadingDetail && activeTab !== 'info' && activeTab !== 'membership' ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <div className="spinner spinner-lg" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && <TabInfo client={client} />}
                            {activeTab === 'membership' && <TabMembership client={client} mp={mp} color={color} />}
                            {activeTab === 'measurements' && <TabMeasurements clientId={client.id} clientName={client.name} />}
                            {activeTab === 'routines' && <TabRoutines routines={detail?.routines || []} loading={loadingDetail} />}
                            {activeTab === 'classes' && <TabClasses classes={detail?.classes || []} loading={loadingDetail} />}
                            {activeTab === 'attendance' && <TabAttendance attendances={detail?.attendances || []} loading={loadingDetail} />}
                            {activeTab === 'payments' && <TabPayments payments={detail?.payments || []} loading={loadingDetail} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ── Tab: Perfil ── */
function TabInfo({ client }) {
    const fields = [
        { icon: <FiMail size={15} />, label: 'Email', value: client.email },
        { icon: <FiPhone size={15} />, label: 'Teléfono', value: client.phone },
        { icon: <FiCalendar size={15} />, label: 'Fecha de Nacimiento', value: client.birth_date ? new Date(client.birth_date + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : null },
        { icon: <FiMapPin size={15} />, label: 'Dirección', value: client.address },
        { icon: <FiAlertCircle size={15} />, label: 'Contacto de Emergencia', value: client.emergency_contact },
        { icon: <FiMapPin size={15} />, label: 'Sede', value: client.location_name },
    ]

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {fields.map(({ icon, label, value }) => (
                <div key={label} style={{
                    background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
                    display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-md)',
                        background: 'rgba(249,115,22,0.1)', color: 'var(--primary-400)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>{icon}</div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>{label}</div>
                        <div style={{ fontSize: '0.9375rem', color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: value ? 500 : 400 }}>
                            {value || '—'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ── Tab: Membresía ── */
function TabMembership({ client, mp, color }) {
    if (!client.membership_type) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon"><FiAward size={40} style={{ opacity: 0.3 }} /></div>
                <div className="empty-state-title">Sin membresía activa</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Este cliente no tiene una membresía activa registrada.</p>
            </div>
        )
    }

    const progressColor = mp?.pct > 80 ? 'var(--danger)' : mp?.pct > 60 ? 'var(--warning)' : 'var(--success)'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Main membership card */}
            <div style={{
                background: `linear-gradient(135deg, ${color}20 0%, var(--surface-card) 100%)`,
                border: `1px solid ${color}40`, borderRadius: 'var(--radius-xl)', padding: '1.5rem',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan activo</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color, marginTop: '0.2rem' }}>
                            {client.membership_type.icon} {client.membership_type.name}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRECIO</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                            S/ {client.membership_type.price?.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                {mp && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Progreso del periodo</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: progressColor }}>
                                {mp.daysLeft} días restantes
                            </span>
                        </div>
                        <div style={{ height: 8, background: 'var(--dark-500)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${mp.pct}%`, borderRadius: 'var(--radius-full)',
                                background: progressColor, transition: 'width 0.8s ease-out'
                            }} />
                        </div>
                    </>
                )}
            </div>

            {/* Dates grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                    { label: 'Fecha de inicio', value: client.membership_start, icon: <FiCalendar size={15} /> },
                    { label: 'Fecha de vencimiento', value: client.membership_end, icon: <FiClock size={15} /> },
                ].map(({ label, value, icon }) => (
                    <div key={label} style={{
                        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
                        display: 'flex', gap: '0.75rem', alignItems: 'center'
                    }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 'var(--radius-md)',
                            background: 'rgba(249,115,22,0.1)', color: 'var(--primary-400)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>{icon}</div>
                        <div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                            <div style={{ fontWeight: 700, marginTop: '0.15rem' }}>{value || '—'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── Tab: Rutinas ── */
function TabRoutines({ routines, loading }) {
    if (loading) return <LoadingTab />
    if (!routines.length) return <EmptyTab icon={<FiZap />} title="Sin rutinas asignadas" desc="Este cliente no tiene rutinas personalizadas creadas aún." />

    const goalColors = { strength: '#f97316', weight_loss: '#22c55e', endurance: '#3b82f6', flexibility: '#a855f7', general: '#64748b' }
    const goalLabels = { strength: 'Fuerza', weight_loss: 'Pérdida de peso', endurance: 'Resistencia', flexibility: 'Flexibilidad', general: 'General' }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {routines.map(r => (
                <div key={r.id} style={{
                    background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)', padding: '1.125rem 1.25rem',
                    display: 'flex', gap: '1rem', alignItems: 'flex-start'
                }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 'var(--radius-md)',
                        background: `${goalColors[r.goal] || '#64748b'}20`,
                        color: goalColors[r.goal] || '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem'
                    }}><FiZap /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{r.name}</div>
                            <span className="badge badge-neutral">{r.days_per_week} días/sem</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            {r.goal && (
                                <span style={{ fontSize: '0.8rem', color: goalColors[r.goal] || 'var(--text-muted)', fontWeight: 600 }}>
                                    {goalLabels[r.goal] || r.goal}
                                </span>
                            )}
                            {r.trainer_name && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Entrenador: <b style={{ color: 'var(--text-secondary)' }}>{r.trainer_name}</b>
                                </span>
                            )}
                        </div>
                        {r.notes && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {r.notes}
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {new Date(r.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ── Tab: Clases ── */
function TabClasses({ classes, loading }) {
    if (loading) return <LoadingTab />
    if (!classes.length) return <EmptyTab icon={<FiBookOpen />} title="Sin clases matriculadas" desc="Este cliente no está inscrito en ninguna clase grupal activa." />

    const dayNames = { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom' }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.875rem' }}>
            {classes.map(e => {
                const sched = e.schedule || {}
                const days = Object.entries(sched).filter(([, v]) => v).map(([k]) => dayNames[k] || k)
                return (
                    <div key={e.id} style={{
                        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)', padding: '1.125rem',
                        display: 'flex', flexDirection: 'column', gap: '0.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{e.class_name}</div>
                            <span className="badge badge-success"><FiCheckCircle size={11} /> Activa</span>
                        </div>
                        {e.instructor && (
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                <FiUser size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                {e.instructor}
                            </div>
                        )}
                        {days.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                {days.map(d => (
                                    <span key={d} style={{
                                        padding: '0.15rem 0.5rem', background: 'rgba(249,115,22,0.1)',
                                        color: 'var(--primary-400)', borderRadius: 'var(--radius-full)',
                                        fontSize: '0.72rem', fontWeight: 700
                                    }}>{d}</span>
                                ))}
                            </div>
                        )}
                        {e.location_name && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                <FiMapPin size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                                {e.location_name.replace('RafaGym - ', '')}
                            </div>
                        )}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                            Matriculado: {new Date(e.enrolled_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/* ── Tab: Asistencia ── */
function TabAttendance({ attendances, loading }) {
    if (loading) return <LoadingTab />
    if (!attendances.length) return <EmptyTab icon={<FiActivity />} title="Sin asistencias registradas" desc="Este cliente aún no tiene registros de asistencia." />

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                background: 'var(--surface-card)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                border: '1px solid var(--border-subtle)', borderBottom: 'none',
                marginBottom: 0
            }}>
                <FiTrendingUp size={15} color="var(--primary-400)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Últimas {attendances.length} asistencias
                </span>
            </div>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
                {attendances.map((a, i) => (
                    <div key={a.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.75rem 1rem',
                        background: i % 2 === 0 ? 'var(--surface-card)' : 'transparent',
                        borderBottom: i < attendances.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 'var(--radius-md)',
                            background: 'var(--success-bg)', color: 'var(--success)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}><FiCheckCircle size={14} /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.date}</div>
                            {a.location_name && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <FiMapPin size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                                    {a.location_name.replace('RafaGym - ', '')}
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            <FiClock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                            {a.time}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── Tab: Pagos ── */
function TabPayments({ payments, loading }) {
    if (loading) return <LoadingTab />
    if (!payments.length) return <EmptyTab icon={<FiDollarSign />} title="Sin pagos registrados" desc="Este cliente no tiene pagos registrados en el sistema." />

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {payments.map(p => (
                <div key={p.id} style={{
                    background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
                    display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 'var(--radius-md)',
                        background: p.status === 'paid' ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: p.status === 'paid' ? 'var(--success)' : 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}><FiDollarSign size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700 }}>{p.concept || 'Pago de membresía'}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{p.date}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                            S/ {Number(p.amount).toFixed(2)}
                        </div>
                        <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '0.25rem' }}>
                            {p.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

/* ── Tab: Medidas ── */
function TabMeasurements({ clientId, clientName }) {
    const [measurements, setMeasurements] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        getClientMeasurements(clientId)
            .then(d => setMeasurements([...d].reverse().slice(0, 5)))
            .finally(() => setLoading(false))
    }, [clientId])

    if (loading) return <LoadingTab />

    const latest = measurements[0]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {measurements.length > 0 ? `Últimas ${measurements.length} mediciones` : 'Sin mediciones registradas'}
                </div>
                <button className="btn btn-secondary btn-sm"
                    onClick={() => { navigate('/admin/measurements', { state: { clientName } }) }}>
                    <FiExternalLink size={13} /> Ver módulo completo
                </button>
            </div>

            {!measurements.length && (
                <EmptyTab icon={<FiSliders />} title="Sin mediciones" desc="Este cliente aún no tiene mediciones corporales registradas." />
            )}

            {latest && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {[
                        // CORRECCIÓN: Se cambiaron las propiedades al inglés según la BD
                        { label: 'Peso', value: latest.weight_kg ? `${latest.weight_kg} kg` : '—' },
                        { label: '% Grasa', value: latest.body_fat_pct ? `${latest.body_fat_pct}%` : '—' },
                        { label: '% Músculo', value: latest.muscle_pct ? `${latest.muscle_pct}%` : '—' },
                        { label: 'Cintura', value: latest.waist_cm ? `${latest.waist_cm} cm` : '—' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '0.875rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {measurements.length > 0 && (
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    {measurements.map((m, i) => (
                        <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            padding: '0.7rem 1rem',
                            background: i % 2 === 0 ? 'var(--surface-card)' : 'transparent',
                            borderBottom: i < measurements.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                            {/* CORRECCIÓN: measurement_date y weight_kg */}
                            <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>{m.measurement_date}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{m.weight_kg ? `${m.weight_kg} kg` : '—'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.registrador_name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
/* ── Helpers ── */
function LoadingTab() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner spinner-lg" />
        </div>
    )
}

function EmptyTab({ icon, title, desc }) {
    return (
        <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <div className="empty-state-icon" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>{icon}</div>
            <div className="empty-state-title">{title}</div>
            {desc && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 320 }}>{desc}</p>}
        </div>
    )
}
