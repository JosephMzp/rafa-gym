import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiCheckCircle, FiClock, FiFilter, FiPlus, FiX, FiMapPin, FiAlertCircle, FiUser } from 'react-icons/fi'
import { getClients, getAttendances, getLocations, createAttendance } from '../../lib/services'

export default function Attendance() {
    const [attendances, setAttendances] = useState([])
    const [allClients, setAllClients] = useState([])
    const [locations, setLocations] = useState([])
    const [filterSearch, setFilterSearch] = useState('')
    const [selectedLocation, setSelectedLocation] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [a, c, l] = await Promise.all([getAttendances(), getClients(), getLocations()])
            setAttendances(a); setAllClients(c); setLocations(l)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filtered = attendances.filter(a => {
        const matchSearch = !filterSearch || a.client_name?.toLowerCase().includes(filterSearch.toLowerCase())
        const matchLocation = selectedLocation === 'all' || a.location_id === selectedLocation
        return matchSearch && matchLocation
    })

    // Stats
    const today = new Date().toISOString().split('T')[0]
    const todayCount = attendances.filter(a => a.date === today).length
    const uniqueToday = new Set(attendances.filter(a => a.date === today).map(a => a.client_id)).size

    const handleRegisterSuccess = async () => {
        await loadData()
        setShowModal(false)
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Control de Asistencias</h1><p className="page-subtitle">Registra y consulta las asistencias de los clientes</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Registrar Asistencia
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiCheckCircle /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Ingresos Hoy</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{todayCount}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiUser /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Clientes Únicos Hoy</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{uniqueToday}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary-400)' }}><FiClock /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Total Registros</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{attendances.length}</div></div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Filtrar por nombre de cliente..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <FiFilter color="var(--text-muted)" />
                    <select className="form-input" style={{ maxWidth: 220 }} value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
                        <option value="all">Todas las sedes</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name.replace('RafaGym - ', '')}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Cliente</th><th>Membresía</th><th>Sede</th><th>Fecha</th><th>Hora</th></tr></thead>
                    <tbody>
                        {filtered.map(a => (
                            <tr key={a.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{a.client_name?.charAt(0)}</div>
                                        <span style={{ fontWeight: 500 }}>{a.client_name}</span>
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{a.membership_type || '-'}</span></td>
                                <td style={{ fontSize: '0.875rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><FiMapPin size={13} color="var(--text-muted)" /> {a.location_name?.replace('RafaGym - ', '')}</div></td>
                                <td style={{ fontSize: '0.875rem' }}>{a.date}</td>
                                <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}><FiClock size={14} /> {a.time}</div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No hay registros de asistencia</div></div>}
            </div>

            {/* Registration Modal */}
            {showModal && (
                <AttendanceModal
                    clients={allClients}
                    locations={locations}
                    attendances={attendances}
                    onSuccess={handleRegisterSuccess}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}

function AttendanceModal({ clients, locations, attendances, onSuccess, onClose }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedClient, setSelectedClient] = useState(null)
    const [selectedLocationId, setSelectedLocationId] = useState('')
    const [result, setResult] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef(null)

    const activeClients = clients.filter(c => c.status === 'active')
    const suggestions = searchQuery.length > 0
        ? activeClients.filter(c =>
            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.document?.includes(searchQuery) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 8)
        : []

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const selectClient = (client) => {
        setSelectedClient(client)
        setSearchQuery(client.name)
        setShowDropdown(false)
        setResult(null)

        const membershipName = client.membership_type?.name
        if (membershipName === 'Estándar') {
            // Estándar: auto-assign their registered location
            setSelectedLocationId(client.location?.id || '')
        } else if (membershipName === 'Fit' || membershipName === 'Gold') {
            // Fit/Gold: default to first location, user can change
            setSelectedLocationId(locations[0]?.id || '')
        } else {
            setSelectedLocationId(client.location?.id || locations[0]?.id || '')
        }
    }

    const clearSelection = () => {
        setSelectedClient(null)
        setSearchQuery('')
        setSelectedLocationId('')
        setResult(null)
    }

    // Validation
    const membershipName = selectedClient?.membership_type?.name
    const hasActiveMembership = !!selectedClient?.membership_type
    const isBasic = membershipName === 'Estándar'
    const isFitOrGold = membershipName === 'Fit' || membershipName === 'Gold'
    const canSelectLocation = isFitOrGold

    // Check daily attendance limit
    const todayAttCount = selectedClient
        ? attendances.filter(a => a.client_id === selectedClient.id && a.date === todayStr).length
        : 0

    let maxPerDay = null
    if (isBasic) maxPerDay = 1
    if (membershipName === 'Fit') maxPerDay = 1
    if (membershipName === 'Gold') maxPerDay = null // Unlimited

    const limitReached = maxPerDay !== null && todayAttCount >= maxPerDay

    // Location validation for basic membership
    const wrongLocation = isBasic && selectedLocationId && selectedClient?.location?.id
        ? selectedLocationId !== selectedClient.location.id
        : false

    const canSubmit = selectedClient && selectedLocationId && hasActiveMembership && !limitReached && !wrongLocation && !submitting

    const handleSubmit = async () => {
        if (!canSubmit) return
        setSubmitting(true)
        try {
            await createAttendance({ client_id: selectedClient.id, location_id: selectedLocationId })
            setResult({ type: 'success', message: `✅ Asistencia registrada para ${selectedClient.name}` })
            setTimeout(() => { onSuccess() }, 1200)
        } catch (err) {
            console.error(err)
            setResult({ type: 'error', message: 'Error al registrar asistencia' })
            setSubmitting(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">📋 Registrar Asistencia</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                        {/* Date & Time - Auto */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label">📅 Fecha</label>
                                <input className="form-input" type="text" value={todayStr} readOnly
                                    style={{ background: 'var(--dark-600)', cursor: 'not-allowed', fontWeight: 600 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">🕐 Hora</label>
                                <input className="form-input" type="text" value={timeStr} readOnly
                                    style={{ background: 'var(--dark-600)', cursor: 'not-allowed', fontWeight: 600 }} />
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.75rem' }}>
                            La fecha y hora se asignan automáticamente al momento del registro
                        </span>

                        {/* Client Search */}
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label className="form-label">Buscar Cliente *</label>
                            {selectedClient ? (
                                // Selected client card
                                <div style={{
                                    padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                    background: 'var(--dark-600)', border: '1px solid var(--border-subtle)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="avatar" style={{ width: 44, height: 44 }}>{selectedClient.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedClient.name}</div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{selectedClient.document} • {selectedClient.email}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                                                <span className="badge" style={{
                                                    background: `${selectedClient.membership_type?.color || '#94a3b8'}20`,
                                                    color: selectedClient.membership_type?.color || '#94a3b8'
                                                }}>
                                                    {selectedClient.membership_type?.icon} {membershipName || 'Sin membresía'}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    • Sede: {selectedClient.location?.name?.replace('RafaGym - ', '') || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost btn-icon" onClick={clearSelection} title="Cambiar cliente">
                                        <FiX size={18} />
                                    </button>
                                </div>
                            ) : (
                                // Search input with dropdown
                                <>
                                    <div className="search-bar">
                                        <span className="search-bar-icon"><FiSearch /></span>
                                        <input
                                            ref={searchRef}
                                            placeholder="Buscar por nombre, documento o email..."
                                            value={searchQuery}
                                            onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                                            onFocus={() => setShowDropdown(true)}
                                            autoFocus
                                        />
                                    </div>
                                    {showDropdown && suggestions.length > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                            background: 'var(--dark-700)', border: '1px solid var(--border-subtle)',
                                            borderRadius: 'var(--radius-lg)', marginTop: '0.25rem',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxHeight: '320px', overflowY: 'auto'
                                        }}>
                                            {suggestions.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => selectClient(c)}
                                                    style={{
                                                        width: '100%', padding: 'var(--space-md)', border: 'none', background: 'transparent',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        textAlign: 'left', color: 'var(--text-primary)', transition: 'background 0.15s',
                                                        borderBottom: '1px solid var(--border-subtle)'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-600)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{c.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.document} • {c.email}</div>
                                                    </div>
                                                    <span className="badge" style={{
                                                        background: `${c.membership_type?.color || '#94a3b8'}20`,
                                                        color: c.membership_type?.color || '#94a3b8', flexShrink: 0
                                                    }}>
                                                        {c.membership_type?.icon} {c.membership_type?.name || 'N/A'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showDropdown && searchQuery.length > 0 && suggestions.length === 0 && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                            background: 'var(--dark-700)', border: '1px solid var(--border-subtle)',
                                            borderRadius: 'var(--radius-lg)', marginTop: '0.25rem', padding: 'var(--space-lg)',
                                            textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem'
                                        }}>
                                            No se encontraron clientes activos
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Location Selection - Only shows after client is selected */}
                        {selectedClient && (
                            <div className="form-group">
                                <label className="form-label"><FiMapPin size={14} style={{ marginRight: '0.25rem' }} /> Sede de Ingreso *</label>
                                {canSelectLocation ? (
                                    // Fit/Gold: can choose any location
                                    <>
                                        <select className="form-input" value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)}>
                                            {locations.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <FiCheckCircle size={12} /> Membresía {membershipName}: acceso a todas las sedes
                                        </span>
                                    </>
                                ) : (
                                    // Estándar: locked to their registered location
                                    <>
                                        <input
                                            className="form-input"
                                            type="text"
                                            value={locations.find(l => l.id === selectedLocationId)?.name || 'Sin sede asignada'}
                                            readOnly
                                            style={{ background: 'var(--dark-600)', cursor: 'not-allowed', fontWeight: 600 }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            🔒 Membresía Estándar: solo puede ingresar a su sede registrada
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Warnings & Validations */}
                        {selectedClient && !hasActiveMembership && (
                            <div style={{
                                padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                            }}>
                                <FiAlertCircle size={20} color="var(--danger)" />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.875rem' }}>
                                        Sin membresía activa
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {selectedClient.name} no tiene una membresía activa. Registra un pago de membresía antes de permitir el ingreso.
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedClient && limitReached && (
                            <div style={{
                                padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                            }}>
                                <FiAlertCircle size={20} color="var(--danger)" />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.875rem' }}>
                                        Límite de ingresos alcanzado
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {selectedClient.name} ya registró {todayAttCount} ingreso(s) hoy.
                                        {membershipName} permite máximo {maxPerDay} ingreso(s) por día.
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedClient && wrongLocation && (
                            <div style={{
                                padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                display: 'flex', alignItems: 'center', gap: '0.75rem'
                            }}>
                                <FiAlertCircle size={20} color="var(--danger)" />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.875rem' }}>
                                        Sede no permitida
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        La membresía Estándar solo permite el ingreso a la sede registrada del cliente:
                                        <strong> {selectedClient.location?.name?.replace('RafaGym - ', '')}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success / Error result */}
                        {result && (
                            <div className={`alert alert-${result.type === 'success' ? 'success' : 'danger'}`}>
                                {result.message}
                            </div>
                        )}

                        {/* Daily attendance summary for the selected client */}
                        {selectedClient && todayAttCount > 0 && !limitReached && (
                            <div style={{
                                padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
                                background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
                                fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                ℹ️ {selectedClient.name} tiene {todayAttCount} ingreso(s) registrado(s) hoy
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {submitting ? <span className="spinner" /> : <><FiCheckCircle /> Registrar Asistencia</>}
                    </button>
                </div>
            </div>
        </div>
    )
}
