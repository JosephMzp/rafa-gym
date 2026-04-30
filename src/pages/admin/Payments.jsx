import { useState, useEffect } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { getPayments, getClients, getMembershipTypes, getClasses, createPayment, createClientMembership } from '../../lib/services'

import PaymentsStats from '../../components/Payments/PaymentsStats'
import PaymentsTable from '../../components/Payments/PaymentsTable'
import PaymentFormModal from '../../components/Payments/PaymentFormModal'

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

            const isMembership = form.concept === 'Mensualidad' || form.concept === 'Renovación'
            if (isMembership && form.membership_type_id && form.date && form.next_due) {
                await createClientMembership({
                    client_id: form.client_id,
                    membership_type_id: form.membership_type_id,
                    start_date: form.date,
                    end_date: form.next_due,
                    status: 'active'
                })
            }

            await loadData()
            setShowModal(false)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Pagos</h1>
                    <p className="page-subtitle">Registra y consulta los pagos de membresías</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Registrar Pago
                </button>
            </div>

            <PaymentsStats payments={payments} />

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar por cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    {['all', 'paid', 'overdue'].map(s => (
                        <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                            {s === 'all' ? 'Todos' : s === 'paid' ? 'Pagados' : 'Vencidos'}
                        </button>
                    ))}
                </div>
            </div>

            <PaymentsTable payments={filtered} />

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