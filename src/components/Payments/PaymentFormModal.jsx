import { useState, useRef } from 'react'
import { FiX, FiSearch, FiAlertCircle, FiDollarSign } from 'react-icons/fi'

export default function PaymentFormModal({ clients, membershipTypes, classes, onSave, onClose }) {
    const activeClients = clients.filter(c => c.status === 'active')
    const activeClasses = classes.filter(c => c.status === 'active')

    const [clientSearch, setClientSearch] = useState('')
    const [showClientDropdown, setShowClientDropdown] = useState(false)
    const [pickedClient, setPickedClient] = useState(null)
    const clientSearchRef = useRef(null)

    const clientSuggestions = clientSearch.length > 0
        ? activeClients.filter(c =>
            c.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
            c.document?.includes(clientSearch) ||
            c.email?.toLowerCase().includes(clientSearch.toLowerCase())
        ).slice(0, 8)
        : []

    const [form, setForm] = useState({
        client_id: '',
        concept: 'Mensualidad',
        membership_type_id: membershipTypes[0]?.id || '',
        membership_type_name: membershipTypes[0]?.name || '',
        class_id: activeClasses[0]?.id || '',
        class_name: '',
        amount: membershipTypes[0]?.price?.toString() || '',
        method: 'Efectivo',
        date: new Date().toISOString().split('T')[0],
        next_due: (() => {
            if (!membershipTypes[0]) return ''
            const d = new Date()
            d.setDate(d.getDate() + (membershipTypes[0].duration_days || 30))
            return d.toISOString().split('T')[0]
        })()
    })

    const selectClient = (client) => {
        setPickedClient(client)
        setClientSearch(client.name)
        setShowClientDropdown(false)
        setForm(prev => {
            const updated = { ...prev, client_id: client.id }
            if (prev.concept === 'Clase Grupal') {
                const m = client?.membership_type?.name
                if (m === 'Fit' || m === 'Gold') updated.amount = '0'
            }
            return updated
        })
    }

    const clearClient = () => {
        setPickedClient(null)
        setClientSearch('')
        setForm(prev => ({ ...prev, client_id: '' }))
    }

    const isMembershipConcept = form.concept === 'Mensualidad' || form.concept === 'Renovación'
    const isClassConcept = form.concept === 'Clase Grupal'

    const selectedClient = activeClients.find(c => c.id === form.client_id)
    const clientMembershipName = selectedClient?.membership_type?.name || null
    const isBasicMembership = clientMembershipName === 'Estándar'
    const hasFreeClasses = clientMembershipName === 'Fit' || clientMembershipName === 'Gold'

    const handleChange = (field, value) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value }

            if (field === 'concept') {
                const isMembership = value === 'Mensualidad' || value === 'Renovación'
                const isClass = value === 'Clase Grupal'

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

            if (field === 'class_id') {
                const selected = activeClasses.find(c => c.id === value)
                if (selected) {
                    updated.class_name = selected.name
                    updated.amount = selected.price_standard?.toString() || ''
                }
            }

            if (field === 'date' && updated.membership_type_id) {
                const selected = membershipTypes.find(m => m.id === updated.membership_type_id)
                if (selected) {
                    const dueDate = new Date(value)
                    dueDate.setDate(dueDate.getDate() + (selected.duration_days || 30))
                    updated.next_due = dueDate.toISOString().split('T')[0]
                }
            }

            if (field === 'client_id' && prev.concept === 'Clase Grupal') {
                const newClient = activeClients.find(c => c.id === value)
                const newMembership = newClient?.membership_type?.name
                if (newMembership === 'Fit' || newMembership === 'Gold') {
                    updated.amount = '0'
                }
            }

            return updated
        })
    }

    const selectedMembership = membershipTypes.find(m => m.id === form.membership_type_id)
    const selectedClass = activeClasses.find(c => c.id === form.class_id)

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

                        {/* Cliente — buscador */}
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label className="form-label">Cliente *</label>
                            {pickedClient ? (
                                <div style={{
                                    padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                                    background: 'var(--dark-600)', border: '1px solid var(--border-subtle)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>
                                            {pickedClient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{pickedClient.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {pickedClient.document} • {pickedClient.email}
                                            </div>
                                            {pickedClient.membership_type && (
                                                <span style={{ fontSize: '0.75rem', color: pickedClient.membership_type.color || 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                                                    {pickedClient.membership_type.icon} <strong>{pickedClient.membership_type.name}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost btn-icon" onClick={clearClient} title="Cambiar cliente"><FiX size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <div className="search-bar">
                                        <span className="search-bar-icon"><FiSearch /></span>
                                        <input
                                            ref={clientSearchRef}
                                            placeholder="Buscar por nombre, documento o email..."
                                            value={clientSearch}
                                            onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true) }}
                                            onFocus={() => setShowClientDropdown(true)}
                                            autoFocus
                                        />
                                    </div>
                                    {showClientDropdown && clientSuggestions.length > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                            background: 'var(--dark-700)', border: '1px solid var(--border-subtle)',
                                            borderRadius: 'var(--radius-lg)', marginTop: '0.25rem',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxHeight: '280px', overflowY: 'auto'
                                        }}>
                                            {clientSuggestions.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => selectClient(c)}
                                                    style={{
                                                        width: '100%', padding: 'var(--space-md)', border: 'none',
                                                        background: 'transparent', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                        textAlign: 'left', color: 'var(--text-primary)',
                                                        transition: 'background 0.15s',
                                                        borderBottom: '1px solid var(--border-subtle)'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-600)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.75rem', flexShrink: 0 }}>{c.name.charAt(0)}</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{c.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.document} • {c.email}</div>
                                                    </div>
                                                    <span className="badge" style={{
                                                        background: `${c.membership_type?.color || '#94a3b8'}20`,
                                                        color: c.membership_type?.color || '#94a3b8', flexShrink: 0
                                                    }}>
                                                        {c.membership_type?.icon} {c.membership_type?.name || 'Sin membresía'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {showClientDropdown && clientSearch.length > 0 && clientSuggestions.length === 0 && (
                                        <div style={{
                                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                            background: 'var(--dark-700)', border: '1px solid var(--border-subtle)',
                                            borderRadius: 'var(--radius-lg)', marginTop: '0.25rem',
                                            padding: 'var(--space-lg)', textAlign: 'center',
                                            color: 'var(--text-muted)', fontSize: '0.875rem'
                                        }}>
                                            No se encontraron clientes activos
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Concepto */}
                        <div className="form-group">
                            <label className="form-label">Concepto *</label>
                            <select className="form-input" value={form.concept} onChange={e => handleChange('concept', e.target.value)}>
                                <option value="Mensualidad">Mensualidad</option>
                                <option value="Renovación">Renovación</option>
                                <option value="Clase Grupal">Clase Grupal</option>
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