import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiX, FiDollarSign, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi'
import { getPayments, getClients, getMembershipTypes, getClasses, createPayment } from '../../lib/services'

export default function Payments() {
    const [payments, setPayments] = useState([])
    const [allClients, setAllClients] = useState([])
    const [membershipTypes, setMembershipTypes] = useState([])
    const [classes, setClasses] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [p, c, m, cl] = await Promise.all([getPayments(), getClients(), getMembershipTypes(), getClasses()])
            setPayments(p); setAllClients(c); setMembershipTypes(m); setClasses(cl)
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
            let conceptText = form.concept
            if (form.membership_type_name) conceptText += ` - ${form.membership_type_name}`
            if (form.class_name) conceptText += ` - ${form.class_name}`

            await createPayment({
                client_id: form.client_id,
                concept: conceptText,
                amount: Number(form.amount),
                method: form.method,
                date: form.date,
                next_due: form.next_due || null,
                status: 'paid'
            })
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

            {showModal && (
                <PaymentFormModal
                    clients={allClients}
                    membershipTypes={membershipTypes}
                    classes={classes}
                    onSave={handleSavePayment}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}

function PaymentFormModal({ clients, membershipTypes, classes, onSave, onClose }) {
    const activeClients = clients.filter(c => c.status === 'active')
    const activeClasses = classes.filter(c => c.status === 'active')

    const [form, setForm] = useState({
        client_id: activeClients[0]?.id || '',
        concept: 'Mensualidad',
        membership_type_id: membershipTypes[0]?.id || '',
        membership_type_name: membershipTypes[0]?.name || '',
        class_id: activeClasses[0]?.id || '',
        class_name: '',
        amount: membershipTypes[0]?.price?.toString() || '',
        method: 'Efectivo',
        date: new Date().toISOString().split('T')[0],
        next_due: ''
    })

    const isMembershipConcept = form.concept === 'Mensualidad' || form.concept === 'Renovación'
    const isClassConcept = form.concept === 'Clase Grupal'

    // Get selected client's membership type
    const selectedClient = activeClients.find(c => c.id === form.client_id)
    const clientMembershipName = selectedClient?.membership_type?.name || null
    const isBasicMembership = clientMembershipName === 'Estándar'
    const hasFreeClasses = clientMembershipName === 'Fit' || clientMembershipName === 'Gold'

    const handleChange = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value }

            // When concept changes
            if (field === 'concept') {
                const isMembership = value === 'Mensualidad' || value === 'Renovación'
                const isClass = value === 'Clase Grupal'

                // Reset all concept-specific fields
                updated.membership_type_id = ''
                updated.membership_type_name = ''
                updated.class_id = ''
                updated.class_name = ''
                updated.amount = ''
                updated.next_due = ''

                if (isMembership && membershipTypes.length > 0) {
                    updated.membership_type_id = membershipTypes[0].id
                    updated.membership_type_name = membershipTypes[0].name
                    updated.amount = membershipTypes[0].price?.toString() || ''
                    const dueDate = new Date(updated.date)
                    dueDate.setDate(dueDate.getDate() + (membershipTypes[0].duration_days || 30))
                    updated.next_due = dueDate.toISOString().split('T')[0]
                }

                if (isClass && activeClasses.length > 0) {
                    updated.class_id = activeClasses[0].id
                    updated.class_name = activeClasses[0].name
                    updated.amount = activeClasses[0].price_standard?.toString() || ''
                }
            }

            // When membership type changes
            if (field === 'membership_type_id') {
                const selected = membershipTypes.find(m => m.id === value)
                if (selected) {
                    updated.amount = selected.price?.toString() || ''
                    updated.membership_type_name = selected.name
                    const dueDate = new Date(updated.date)
                    dueDate.setDate(dueDate.getDate() + (selected.duration_days || 30))
                    updated.next_due = dueDate.toISOString().split('T')[0]
                }
            }

            // When class changes
            if (field === 'class_id') {
                const selected = activeClasses.find(c => c.id === value)
                if (selected) {
                    updated.class_name = selected.name
                    updated.amount = selected.price_standard?.toString() || ''
                }
            }

            // When payment date changes and membership is selected
            if (field === 'date' && updated.membership_type_id) {
                const selected = membershipTypes.find(m => m.id === updated.membership_type_id)
                if (selected) {
                    const dueDate = new Date(value)
                    dueDate.setDate(dueDate.getDate() + (selected.duration_days || 30))
                    updated.next_due = dueDate.toISOString().split('T')[0]
                }
            }

            // When client changes while on class concept, re-check membership
            if (field === 'client_id' && prev.concept === 'Clase Grupal') {
                const newClient = activeClients.find(c => c.id === value)
                const newMembership = newClient?.membership_type?.name
                if (newMembership === 'Fit' || newMembership === 'Gold') {
                    // They get free classes
                    updated.amount = '0'
                }
            }

            return updated
        })
    }

    const selectedMembership = membershipTypes.find(m => m.id === form.membership_type_id)
    const selectedClass = activeClasses.find(c => c.id === form.class_id)

    // Validation: class payment only for basic membership
    const classPaymentBlocked = isClassConcept && hasFreeClasses

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">💳 Registrar Pago</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                        {/* Cliente */}
                        <div className="form-group">
                            <label className="form-label">Cliente *</label>
                            <select className="form-input" value={form.client_id} onChange={e => handleChange('client_id', e.target.value)}>
                                {activeClients.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.membership_type ? `(${c.membership_type.name})` : '(Sin membresía)'}
                                    </option>
                                ))}
                            </select>
                            {selectedClient?.membership_type && (
                                <span style={{ fontSize: '0.75rem', color: selectedClient.membership_type.color || 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {selectedClient.membership_type.icon} Membresía: <strong>{selectedClient.membership_type.name}</strong>
                                </span>
                            )}
                        </div>

                        {/* Concepto */}
                        <div className="form-group">
                            <label className="form-label">Concepto *</label>
                            <select className="form-input" value={form.concept} onChange={e => handleChange('concept', e.target.value)}>
                                <option value="Mensualidad">Mensualidad</option>
                                <option value="Renovación">Renovación</option>
                                <option value="Clase Grupal">Clase Grupal</option>
                                <option value="Producto">Producto</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        {/* Tipo de Membresía — Mensualidad / Renovación */}
                        {isMembershipConcept && (
                            <div className="form-group">
                                <label className="form-label">Tipo de Membresía *</label>
                                <select className="form-input" value={form.membership_type_id} onChange={e => handleChange('membership_type_id', e.target.value)}>
                                    {membershipTypes.map(m => (
                                        <option key={m.id} value={m.id}>{m.icon} {m.name} — S/ {Number(m.price).toFixed(2)}</option>
                                    ))}
                                </select>
                                {selectedMembership && (
                                    <div style={{
                                        marginTop: 'var(--space-sm)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                        background: `${selectedMembership.color}15`, border: `1px solid ${selectedMembership.color}40`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{selectedMembership.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, color: selectedMembership.color }}>{selectedMembership.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedMembership.duration_days} días</div>
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: selectedMembership.color }}>
                                            S/ {Number(selectedMembership.price).toFixed(2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Clase Grupal Selector */}
                        {isClassConcept && (
                            <div className="form-group">
                                <label className="form-label">Clase *</label>
                                {classPaymentBlocked ? (
                                    <div style={{
                                        padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                        background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
                                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                                    }}>
                                        <FiAlertCircle size={20} color="var(--info)" />
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--info)', fontSize: '0.875rem' }}>
                                                Clases gratuitas para {clientMembershipName}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                                Los clientes con membresía <strong>{clientMembershipName}</strong> tienen clases grupales incluidas. No es necesario registrar un pago.
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <select className="form-input" value={form.class_id} onChange={e => handleChange('class_id', e.target.value)}>
                                            {activeClasses.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} — S/ {Number(c.price_standard).toFixed(2)} ({c.schedule})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedClass && (
                                            <div style={{
                                                marginTop: 'var(--space-sm)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                                background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.25)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{selectedClass.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                                        📍 {selectedClass.location_name} • 🕐 {selectedClass.schedule}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        👤 Instructor: {selectedClass.instructor} • {selectedClass.enrolled}/{selectedClass.capacity} inscritos
                                                    </div>
                                                </div>
                                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-400)' }}>
                                                    S/ {Number(selectedClass.price_standard).toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                        {!isBasicMembership && !hasFreeClasses && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                ⚠️ Este cliente no tiene una membresía activa
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Monto */}
                        {!classPaymentBlocked && (
                            <div className="form-group">
                                <label className="form-label">Monto (S/) *</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={e => handleChange('amount', e.target.value)}
                                    placeholder="0.00"
                                    readOnly={isMembershipConcept || isClassConcept}
                                    style={(isMembershipConcept || isClassConcept) ? { background: 'var(--dark-600)', cursor: 'not-allowed' } : {}}
                                />
                                {(isMembershipConcept || isClassConcept) && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                                        💡 El monto se asigna automáticamente según {isMembershipConcept ? 'la membresía' : 'la clase'} seleccionada
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Método de Pago */}
                        {!classPaymentBlocked && (
                            <div className="form-group">
                                <label className="form-label">Método de Pago *</label>
                                <select className="form-input" value={form.method} onChange={e => handleChange('method', e.target.value)}>
                                    <option>Efectivo</option>
                                    <option>Tarjeta</option>
                                    <option>Yape</option>
                                    <option>Plin</option>
                                    <option>Transferencia</option>
                                </select>
                            </div>
                        )}

                        {/* Fechas */}
                        {!classPaymentBlocked && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Fecha de Pago</label>
                                    <input className="form-input" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Próximo Vencimiento</label>
                                    <input
                                        className="form-input" type="date" value={form.next_due}
                                        onChange={e => handleChange('next_due', e.target.value)}
                                        readOnly={isMembershipConcept}
                                        style={isMembershipConcept ? { background: 'var(--dark-600)', cursor: 'not-allowed' } : {}}
                                    />
                                    {isMembershipConcept && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                                            Calculado automáticamente ({selectedMembership?.duration_days || 30} días)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    {!classPaymentBlocked && (
                        <button
                            className="btn btn-primary"
                            onClick={() => onSave(form)}
                            disabled={!form.client_id || !form.amount}
                        >
                            <FiDollarSign /> Registrar Pago
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
