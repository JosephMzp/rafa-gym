import { useState, useEffect } from 'react'
import {
    FiSearch, FiPlus, FiEdit2, FiEye, FiUserX, FiUserCheck, FiX,
    FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiActivity,
    FiAward, FiClock, FiDollarSign, FiBookOpen, FiZap, FiAlertCircle,
    FiTrendingUp, FiCheckCircle
} from 'react-icons/fi'
import { getClients, getMembershipTypes, getLocations, createClient, updateClient, getClientFullDetail } from '../../lib/services'
import { getOptimizedUrl } from '../../lib/cloudinary'
import ImageUpload from '../../components/ImageUpload'

export default function Clients() {
    const [clients, setClients] = useState([])
    const [membershipTypes, setMembershipTypes] = useState([])
    const [locations, setLocations] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingClient, setEditingClient] = useState(null)
    const [selectedClient, setSelectedClient] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [c, m, l] = await Promise.all([getClients(), getMembershipTypes(), getLocations()])
            setClients(c); setMembershipTypes(m); setLocations(l)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filtered = clients.filter(c => {
        const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.document?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || c.status === filterStatus
        return matchSearch && matchStatus
    })

    const toggleStatus = async (client) => {
        try {
            const newStatus = client.status === 'active' ? 'inactive' : 'active'
            await updateClient(client.id, { status: newStatus })
            setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: newStatus } : c))
        } catch (err) { console.error(err) }
    }

    const handleSave = async (formData) => {
        try {
            if (editingClient) {
                await updateClient(editingClient.id, formData)
            } else {
                await createClient(formData)
            }
            await loadData()
            setShowModal(false); setEditingClient(null)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">Gestiona los clientes del gimnasio</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingClient(null); setShowModal(true) }}>
                    <FiPlus /> Nuevo Cliente
                </button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar por nombre, documento o email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    {['all', 'active', 'inactive'].map(s => (
                        <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                            {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Cliente</th><th>Documento</th><th>Membresía</th><th>Sede</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {c.photo_url ? (
                                            <img src={getOptimizedUrl(c.photo_url, { width: 80, height: 80 })} alt={c.name}
                                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="avatar">{c.name?.charAt(0)}</div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{c.document}</td>
                                <td>
                                    <span className="badge" style={{
                                        background: `${c.membership_type?.color || '#94a3b8'}20`,
                                        color: c.membership_type?.color || '#94a3b8'
                                    }}>
                                        {c.membership_type?.name || 'Sin membresía'}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.8125rem' }}>{c.location_name?.replace('RafaGym - ', '')}</td>
                                <td style={{ fontSize: '0.875rem' }}>{c.membership_end || '-'}</td>
                                <td>
                                    <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                        {c.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button className="btn btn-ghost btn-icon" onClick={() => setSelectedClient(c)} title="Ver detalle"><FiEye size={16} /></button>
                                        <button className="btn btn-ghost btn-icon" onClick={() => { setEditingClient(c); setShowModal(true) }} title="Editar"><FiEdit2 size={16} /></button>
                                        <button className="btn btn-ghost btn-icon" onClick={() => toggleStatus(c)} title={c.status === 'active' ? 'Desactivar' : 'Activar'}>
                                            {c.status === 'active' ? <FiUserX size={16} color="var(--danger)" /> : <FiUserCheck size={16} color="var(--success)" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No se encontraron clientes</div></div>}
            </div>

            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onEdit={() => { setEditingClient(selectedClient); setSelectedClient(null); setShowModal(true) }}
                />
            )}

            {showModal && (
                <ClientFormModal
                    client={editingClient}
                    membershipTypes={membershipTypes}
                    locations={locations}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingClient(null) }}
                />
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────
   ENHANCED CLIENT DETAIL MODAL
───────────────────────────────────────────── */
function ClientDetailModal({ client, onClose, onEdit }) {
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

/* ─────────────────────────────────────────────
   CLIENT FORM MODAL (unchanged)
───────────────────────────────────────────── */
function ClientFormModal({ client, membershipTypes, locations, onSave, onClose }) {
    const [form, setForm] = useState({
        name: client?.name || '', document: client?.document || '', email: client?.email || '',
        phone: client?.phone || '', birth_date: client?.birth_date || '', address: client?.address || '',
        emergency_contact: client?.emergency_contact || '', location_id: client?.location_id || locations[0]?.id || '',
        photo_url: client?.photo_url || ''
    })
    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    {/* Photo Upload */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                        <ImageUpload
                            currentUrl={form.photo_url}
                            onUpload={({ url }) => handleChange('photo_url', url || '')}
                            folder="rafagym/clients"
                            size={110}
                            fallbackText={form.name?.charAt(0) || '?'}
                        />
                    </div>
                    <div className="form-grid">
                        <div className="form-group"><label className="form-label">Nombre Completo *</label><input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nombre completo" /></div>
                        <div className="form-group"><label className="form-label">Documento *</label><input className="form-input" value={form.document} onChange={e => handleChange('document', e.target.value)} placeholder="DNI" /></div>
                        <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@ejemplo.com" /></div>
                        <div className="form-group"><label className="form-label">Teléfono *</label><input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="987654321" /></div>
                        <div className="form-group"><label className="form-label">Fecha de Nacimiento</label><input className="form-input" type="date" value={form.birth_date} onChange={e => handleChange('birth_date', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Dirección</label><input className="form-input" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Dirección" /></div>
                        <div className="form-group"><label className="form-label">Contacto de Emergencia</label><input className="form-input" value={form.emergency_contact} onChange={e => handleChange('emergency_contact', e.target.value)} placeholder="Nombre - Teléfono" /></div>
                        <div className="form-group"><label className="form-label">Sede *</label>
                            <select className="form-input" value={form.location_id} onChange={e => handleChange('location_id', e.target.value)}>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => onSave(form)}>{client ? 'Guardar Cambios' : 'Crear Cliente'}</button>
                </div>
            </div>
        </div>
    )
}
