import { useState, useEffect } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { getGuests, getClients, getLocations, createGuest } from '../../lib/services'

export default function Guests() {
    const [guests, setGuests] = useState([])
    const [allClients, setAllClients] = useState([])
    const [locations, setLocations] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [g, c, l] = await Promise.all([getGuests(), getClients(), getLocations()])
            setGuests(g); setAllClients(c); setLocations(l)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const goldClients = allClients.filter(c => c.membership_type?.name === 'Gold' && c.status === 'active')
    const getGuestCount = (clientId) => guests.filter(g => g.host_client_id === clientId).length

    const handleSave = async (form) => {
        try {
            await createGuest({ name: form.name, document: form.document, host_client_id: form.host_client_id, location_id: form.location_id || locations[0]?.id, visit_date: form.date })
            await loadData()
            setShowModal(false)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Invitados</h1><p className="page-subtitle">Registro de invitados de membresía Gold (máx. 5/mes)</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Registrar Invitado</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                {goldClients.map(c => (
                    <div key={c.id} className="card" style={{ padding: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>{c.name.charAt(0)}</div>
                                <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🥇 Gold</div></div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: getGuestCount(c.id) >= 5 ? 'var(--danger)' : 'var(--success)' }}>{getGuestCount(c.id)}/5</div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>este mes</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Invitado</th><th>Documento</th><th>Anfitrión</th><th>Fecha</th><th>Sede</th></tr></thead>
                    <tbody>
                        {guests.map(g => (
                            <tr key={g.id}>
                                <td style={{ fontWeight: 500 }}>{g.name}</td>
                                <td>{g.document}</td>
                                <td><span className="badge badge-primary">{g.host_name}</span></td>
                                <td>{g.date || g.visit_date}</td>
                                <td>{g.location_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2 className="modal-title">Registrar Invitado</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button></div>
                        <div className="modal-body">
                            <GuestForm goldClients={goldClients} locations={locations} getGuestCount={getGuestCount} onSave={handleSave} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function GuestForm({ goldClients, locations, getGuestCount, onSave }) {
    const [form, setForm] = useState({ name: '', document: '', host_client_id: goldClients[0]?.id || '', location_id: locations[0]?.id || '', date: new Date().toISOString().split('T')[0] })
    const handleChange = (f, v) => setForm(p => ({ ...p, [f]: v }))
    const count = getGuestCount(form.host_client_id)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="form-group"><label className="form-label">Cliente Anfitrión (Gold)</label>
                <select className="form-input" value={form.host_client_id} onChange={e => handleChange('host_client_id', e.target.value)}>
                    {goldClients.map(c => <option key={c.id} value={c.id}>{c.name} ({getGuestCount(c.id)}/5)</option>)}
                </select>
                {count >= 5 && <span className="form-error">Este cliente ya usó sus 5 invitados este mes</span>}
            </div>
            <div className="form-group"><label className="form-label">Nombre del Invitado</label><input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nombre completo" /></div>
            <div className="form-group"><label className="form-label">Documento</label><input className="form-input" value={form.document} onChange={e => handleChange('document', e.target.value)} placeholder="DNI" /></div>
            <div className="form-group"><label className="form-label">Sede</label>
                <select className="form-input" value={form.location_id} onChange={e => handleChange('location_id', e.target.value)}>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} /></div>
            <button className="btn btn-primary" onClick={() => onSave(form)} disabled={count >= 5}>Registrar</button>
        </div>
    )
}
