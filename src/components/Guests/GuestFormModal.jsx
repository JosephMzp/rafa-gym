import { useState, useEffect, useRef } from 'react'
import { FiUserPlus, FiX, FiSearch, FiMapPin, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export default function GuestFormModal({ goldClients, locations, getGuestCount, onSave, onClose }) {
    const [form, setForm] = useState({
        name: '',
        document: '',
        host_client_id: '',
        location_id: locations[0]?.id || '',
        date: new Date().toISOString().split('T')[0]
    })

    // Search state for host client
    const [hostSearch, setHostSearch] = useState('')
    const [selectedHost, setSelectedHost] = useState(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const searchRef = useRef(null)
    const dropdownRef = useRef(null)

    const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }))
    const count = selectedHost ? getGuestCount(selectedHost.id) : 0

    const suggestions = hostSearch.length > 0
        ? goldClients.filter(c =>
            c.name?.toLowerCase().includes(hostSearch.toLowerCase()) ||
            c.document?.includes(hostSearch) ||
            c.email?.toLowerCase().includes(hostSearch.toLowerCase())
        ).slice(0, 8)
        : []

    const selectHost = (client) => {
        setSelectedHost(client)
        setHostSearch(client.name)
        setShowDropdown(false)
        handleChange('host_client_id', client.id)
    }

    const clearHost = () => {
        setSelectedHost(null)
        setHostSearch('')
        setShowDropdown(false)
        handleChange('host_client_id', '')
        setTimeout(() => searchRef.current?.focus(), 50)
    }

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const canSubmit = form.name && form.host_client_id && count < 5

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
                <div className="modal-header">
                    <h2 className="modal-title"><FiUserPlus size={18} style={{ marginRight: '0.375rem' }} /> Registrar Invitado</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                    {/* Buscador de Anfitrión */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">
                            <FiSearch size={13} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                            Cliente Anfitrión (Gold) *
                        </label>

                        {selectedHost ? (
                            <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', background: 'var(--dark-600)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="avatar" style={{ width: 44, height: 44 }}>{selectedHost.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedHost.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            {selectedHost.document} {selectedHost.email ? `• ${selectedHost.email}` : ''}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <span className="badge" style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308' }}>🥇 Gold</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: count >= 5 ? 'var(--danger)' : 'var(--success)' }}>
                                                {count}/5 invitados este mes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-icon" onClick={clearHost} title="Cambiar anfitrión"><FiX size={18} /></button>
                            </div>
                        ) : (
                            <>
                                <div className="search-bar">
                                    <span className="search-bar-icon"><FiSearch /></span>
                                    <input
                                        ref={searchRef}
                                        placeholder="Buscar cliente Gold por nombre, documento o email..."
                                        value={hostSearch}
                                        onChange={e => { setHostSearch(e.target.value); setShowDropdown(true) }}
                                        onFocus={() => setShowDropdown(true)}
                                        autoFocus
                                    />
                                </div>

                                {showDropdown && suggestions.length > 0 && (
                                    <div ref={dropdownRef} style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--dark-700)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginTop: '0.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxHeight: '280px', overflowY: 'auto' }}>
                                        {suggestions.map(c => {
                                            const guestCount = getGuestCount(c.id)
                                            const isFull = guestCount >= 5
                                            return (
                                                <button key={c.id} onClick={() => !isFull && selectHost(c)} disabled={isFull}
                                                    style={{ width: '100%', padding: 'var(--space-md)', border: 'none', background: 'transparent', cursor: isFull ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left', color: isFull ? 'var(--text-muted)' : 'var(--text-primary)', transition: 'background 0.15s', borderBottom: '1px solid var(--border-subtle)', opacity: isFull ? 0.55 : 1 }}
                                                    onMouseEnter={e => { if (!isFull) e.currentTarget.style.background = 'var(--dark-600)' }}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{c.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.document} {c.email ? `• ${c.email}` : ''}</div>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, color: isFull ? 'var(--danger)' : 'var(--success)' }}>
                                                        {guestCount}/5
                                                        {isFull && <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 400 }}>cupo lleno</span>}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}

                                {showDropdown && hostSearch.length > 0 && suggestions.length === 0 && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--dark-700)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', marginTop: '0.25rem', padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        No se encontraron clientes Gold activos
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {selectedHost && count >= 5 && (
                        <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FiAlertCircle size={18} color="var(--danger)" />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--danger)', fontWeight: 600 }}>{selectedHost.name} ya alcanzó el límite de 5 invitados este mes.</span>
                        </div>
                    )}

                    {/* Datos del Invitado */}
                    <div className="form-group">
                        <label className="form-label">Nombre del Invitado *</label>
                        <input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nombre completo del invitado" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Documento (DNI)</label>
                        <input className="form-input" value={form.document} onChange={e => handleChange('document', e.target.value)} placeholder="Número de documento" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div className="form-group">
                            <label className="form-label"><FiMapPin size={13} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /> Sede</label>
                            <select className="form-input" value={form.location_id} onChange={e => handleChange('location_id', e.target.value)}>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name.replace('RafaGym - ', '')}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label"><FiCalendar size={13} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /> Fecha de Visita</label>
                            <input className="form-input" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!canSubmit}>
                        <FiCheckCircle /> Registrar Invitado
                    </button>
                </div>
            </div>
        </div>
    )
}