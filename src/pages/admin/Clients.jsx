import { useState, useEffect } from 'react'
import { FiSearch, FiPlus, FiEdit2, FiEye, FiUserX, FiUserCheck, FiX } from 'react-icons/fi'
import { getClients, getMembershipTypes, getLocations, createClient, updateClient } from '../../lib/services'
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
                <div className="modal-overlay" onClick={() => setSelectedClient(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Detalle del Cliente</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setSelectedClient(null)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                                {selectedClient.photo_url ? (
                                    <img src={getOptimizedUrl(selectedClient.photo_url, { width: 160, height: 160 })} alt={selectedClient.name}
                                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-subtle)' }} />
                                ) : (
                                    <div className="avatar avatar-lg">{selectedClient.name?.charAt(0)}</div>
                                )}
                                <div>
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{selectedClient.name}</h3>
                                    <span className={`badge ${selectedClient.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                        {selectedClient.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                            <div className="form-grid">
                                {[
                                    ['Documento', selectedClient.document],
                                    ['Email', selectedClient.email],
                                    ['Teléfono', selectedClient.phone],
                                    ['Fecha de Nacimiento', selectedClient.birth_date],
                                    ['Dirección', selectedClient.address],
                                    ['Contacto de Emergencia', selectedClient.emergency_contact],
                                    ['Membresía', selectedClient.membership_type?.name || 'Sin membresía'],
                                    ['Sede', selectedClient.location_name],
                                    ['Fecha de Inicio', selectedClient.membership_start],
                                    ['Fecha de Vencimiento', selectedClient.membership_end]
                                ].map(([label, value]) => (
                                    <div key={label} className="form-group">
                                        <span className="form-label">{label}</span>
                                        <span style={{ fontSize: '0.9375rem' }}>{value || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
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
