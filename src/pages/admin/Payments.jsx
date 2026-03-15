import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiX, FiDollarSign, FiAlertTriangle } from 'react-icons/fi'
import { getPayments, getClients, createPayment } from '../../lib/services'

export default function Payments() {
    const [payments, setPayments] = useState([])
    const [allClients, setAllClients] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [p, c] = await Promise.all([getPayments(), getClients()])
            setPayments(p); setAllClients(c)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filtered = payments.filter(p => {
        const matchSearch = p.client_name?.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || p.status === filterStatus
        return matchSearch && matchStatus
    })

    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
    const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0)

    const handleSavePayment = async (form) => {
        try {
            await createPayment({ client_id: form.client_id, concept: form.concept, amount: Number(form.amount), method: form.method, date: form.date, next_due: form.next_due || null, status: 'paid' })
            await loadData()
            setShowModal(false)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Gestión de Pagos</h1><p className="page-subtitle">Registra y consulta los pagos de membresías</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Registrar Pago</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card"><div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div><div className="stat-card-content"><div className="stat-card-label">Total Cobrado</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>S/ {totalPaid.toFixed(0)}</div></div></div>
                <div className="stat-card"><div className="stat-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}><FiAlertTriangle /></div><div className="stat-card-content"><div className="stat-card-label">Total Vencido</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>S/ {totalOverdue.toFixed(0)}</div></div></div>
                <div className="stat-card"><div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiDollarSign /></div><div className="stat-card-content"><div className="stat-card-label">Total Pagos</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{payments.length}</div></div></div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}><span className="search-bar-icon"><FiSearch /></span><input placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    {['all', 'paid', 'overdue'].map(s => (<button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s === 'all' ? 'Todos' : s === 'paid' ? 'Pagados' : 'Vencidos'}</button>))}
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Cliente</th><th>Concepto</th><th>Monto</th><th>Método</th><th>Fecha de Pago</th><th>Próximo Vencimiento</th><th>Estado</th></tr></thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 500 }}>{p.client_name}</td>
                                <td style={{ fontSize: '0.875rem' }}>{p.concept}</td>
                                <td style={{ fontWeight: 700, color: 'var(--primary-400)' }}>S/ {Number(p.amount).toFixed(2)}</td>
                                <td><span className="badge badge-neutral">{p.method}</span></td>
                                <td style={{ fontSize: '0.875rem' }}>{p.date}</td>
                                <td style={{ fontSize: '0.875rem' }}>{p.next_due || '-'}</td>
                                <td><span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>{p.status === 'paid' ? 'Pagado' : 'Vencido'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && <PaymentFormModal clients={allClients} onSave={handleSavePayment} onClose={() => setShowModal(false)} />}
        </div>
    )
}

function PaymentFormModal({ clients, onSave, onClose }) {
    const activeClients = clients.filter(c => c.status === 'active')
    const [form, setForm] = useState({ client_id: activeClients[0]?.id || '', concept: 'Mensualidad', amount: '', method: 'Efectivo', date: new Date().toISOString().split('T')[0], next_due: '' })
    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2 className="modal-title">Registrar Pago</h2><button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button></div>
                <div className="modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <div className="form-group"><label className="form-label">Cliente *</label>
                            <select className="form-input" value={form.client_id} onChange={e => handleChange('client_id', e.target.value)}>
                                {activeClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Concepto</label>
                            <select className="form-input" value={form.concept} onChange={e => handleChange('concept', e.target.value)}>
                                <option>Mensualidad</option><option>Renovación</option><option>Clase Grupal</option><option>Producto</option>
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Monto (S/) *</label><input className="form-input" type="number" value={form.amount} onChange={e => handleChange('amount', e.target.value)} placeholder="0.00" /></div>
                        <div className="form-group"><label className="form-label">Método de Pago</label>
                            <select className="form-input" value={form.method} onChange={e => handleChange('method', e.target.value)}>
                                <option>Efectivo</option><option>Tarjeta</option><option>Yape</option><option>Plin</option><option>Transferencia</option>
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Fecha de Pago</label><input className="form-input" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Próximo Vencimiento</label><input className="form-input" type="date" value={form.next_due} onChange={e => handleChange('next_due', e.target.value)} /></div>
                    </div>
                </div>
                <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={() => onSave(form)}>Registrar Pago</button></div>
            </div>
        </div>
    )
}
