import React, { useState, useRef } from 'react'
import {
    FiList, FiX, FiCalendar, FiClock, FiSearch,
    FiMapPin, FiCheckCircle, FiLock, FiAlertCircle, FiInfo
} from 'react-icons/fi'
import { createAttendance } from '../../lib/services'

export default function AttendanceModal({ clients, locations, attendances, onSuccess, onClose }) {
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
            setSelectedLocationId(client.location?.id || '')
        } else if (membershipName === 'Fit' || membershipName === 'Gold') {
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

    const membershipName = selectedClient?.membership_type?.name
    const hasActiveMembership = !!selectedClient?.membership_type
    const isBasic = membershipName === 'Estándar'
    const isFitOrGold = membershipName === 'Fit' || membershipName === 'Gold'
    const canSelectLocation = isFitOrGold

    const todayAttCount = selectedClient
        ? attendances.filter(a => a.client_id === selectedClient.id && a.date === todayStr).length
        : 0

    let maxPerDay = null
    if (isBasic) maxPerDay = 1
    if (membershipName === 'Fit') maxPerDay = 1
    if (membershipName === 'Gold') maxPerDay = null // ilimitado

    const limitReached = maxPerDay !== null && todayAttCount >= maxPerDay

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
                    <h2 className="modal-title"><FiList size={18} style={{ marginRight: '0.375rem' }} /> Registrar Asistencia</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="form-group">
                                <label className="form-label"><FiCalendar size={13} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /> Fecha</label>
                                <input className="form-input" type="text" value={todayStr} readOnly
                                    style={{ background: 'var(--dark-600)', cursor: 'not-allowed', fontWeight: 600 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiClock size={13} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /> Hora</label>
                                <input className="form-input" type="text" value={timeStr} readOnly
                                    style={{ background: 'var(--dark-600)', cursor: 'not-allowed', fontWeight: 600 }} />
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.75rem' }}>
                            La fecha y hora se asignan automáticamente al momento del registro
                        </span>

                        <div className="form-group" style={{ position: 'relative' }}>
                            <label className="form-label">Buscar Cliente *</label>
                            {selectedClient ? (
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

                        {selectedClient && (
                            <div className="form-group">
                                <label className="form-label"><FiMapPin size={14} style={{ marginRight: '0.25rem' }} /> Sede de Ingreso *</label>
                                {canSelectLocation ? (
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
                                    <>
                                        <input
                                            className="form-input"
                                            type="text"
                                            value={locations.find(l => l.id === selectedLocationId)?.name || 'Sin sede asignada'}
                                            readOnly
                                            style={{ background: 'var(--dark-600)', cursor: 'not-allowed', fontWeight: 600 }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <FiLock size={12} /> Membresía Estándar: solo puede ingresar a su sede registrada
                                        </span>
                                    </>
                                )}
                            </div>
                        )}

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

                        {result && (
                            <div className={`alert alert-${result.type === 'success' ? 'success' : 'danger'}`}>
                                {result.message}
                            </div>
                        )}

                        {selectedClient && todayAttCount > 0 && !limitReached && (
                            <div style={{
                                padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
                                background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
                                fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                <FiInfo size={14} /> {selectedClient.name} tiene {todayAttCount} ingreso(s) registrado(s) hoy
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
