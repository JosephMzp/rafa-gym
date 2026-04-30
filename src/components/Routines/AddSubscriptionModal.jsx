import { useState, useEffect } from 'react'
import { FiX, FiSearch, FiCheck } from 'react-icons/fi'
import { getClients } from '../../lib/services'

export default function AddSubscriptionModal({ templates, onSave, onClose }) {
    const [clients, setClients] = useState([])
    const [clientId, setClientId] = useState('')
    const [templateId, setTemplateId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        getClients().then(c => { setClients(c); setLoading(false) }).catch(console.error)
    }, [])

    const filteredClients = clients.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))

    async function doSave() {
        if (!clientId || !templateId) return
        setSaving(true)
        try { await onSave(clientId, templateId) }
        catch (err) { console.error(err); setSaving(false) }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
                <div className="modal-header">
                    <h2 className="modal-title">Suscribir Cliente a Rutina</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner spinner-lg"></div></div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Buscar cliente</label>
                                <div className="search-bar">
                                    <span className="search-bar-icon"><FiSearch /></span>
                                    <input placeholder="Nombre del cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <select className="form-input" style={{ marginTop: '0.5rem' }} value={clientId} onChange={e => setClientId(e.target.value)}>
                                    <option value="">Seleccionar cliente...</option>
                                    {filteredClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rutina</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {templates.map(t => (
                                        <div key={t.id} onClick={() => setTemplateId(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: templateId === t.id ? `${t.color}15` : 'var(--dark-600)', border: `2px solid ${templateId === t.id ? t.color : 'var(--border-subtle)'}`, transition: 'all 0.15s' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{t.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.level} • {t.duration}</div>
                                            </div>
                                            {templateId === t.id && <span style={{ marginLeft: 'auto', color: t.color, fontWeight: 700 }}><FiCheck /></span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" disabled={!clientId || !templateId || saving} onClick={doSave}>
                        {saving ? 'Guardando...' : <><FiCheck size={14} style={{ marginRight: '0.25rem' }} /> Suscribir</>}
                    </button>
                </div>
            </div>
        </div>
    )
}