import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getClients, getPayments, getAttendances, getLocations, getMembershipTypes } from '../../lib/services'

export default function Reports() {
    const [activeReport, setActiveReport] = useState('revenue')
    const [clients, setClients] = useState([])
    const [payments, setPayments] = useState([])
    const [attendances, setAttendances] = useState([])
    const [locations, setLocations] = useState([])
    const [membershipTypes, setMembershipTypes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getClients(), getPayments(), getAttendances(), getLocations(), getMembershipTypes()])
            .then(([c, p, a, l, m]) => { setClients(c); setPayments(p); setAttendances(a); setLocations(l); setMembershipTypes(m) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    // Monthly revenue
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i)
        const key = d.toISOString().slice(0, 7)
        const label = d.toLocaleString('es-PE', { month: 'short' })
        const rev = payments.filter(p => p.date?.startsWith(key) && p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
        monthlyRevenue.push({ month: label.charAt(0).toUpperCase() + label.slice(1), revenue: rev })
    }

    // Location revenue
    const locationRevenue = locations.map(l => {
        const locClients = clients.filter(c => c.location?.id === l.id)
        const rev = payments.filter(p => locClients.some(c => c.id === p.client_id) && p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0)
        return { name: l.name.replace('RafaGym - ', ''), revenue: rev }
    })

    // Membership distribution
    const membershipDist = membershipTypes.map(mt => ({
        name: mt.name, value: clients.filter(c => c.membership_type?.id === mt.id && c.status === 'active').length, color: mt.color
    }))

    // Weekly attendance
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab']
    const weeklyAttendance = [1, 2, 3, 4, 5, 6].map(dayNum => ({
        day: dayNames[dayNum % 7], count: attendances.filter(a => { const d = new Date(a.check_in || a.date); return d.getDay() === dayNum % 7 }).length
    }))

    const reports = [{ id: 'revenue', label: 'Ingresos' }, { id: 'attendance', label: 'Asistencia' }, { id: 'clients', label: 'Clientes' }, { id: 'memberships', label: 'Membresías' }]
    const tooltipStyle = { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }

    return (
        <div>
            <div className="page-header"><div><h1 className="page-title">Reportes</h1><p className="page-subtitle">Análisis y estadísticas del gimnasio</p></div></div>

            <div className="tabs" style={{ marginBottom: 'var(--space-xl)' }}>
                {reports.map(r => <button key={r.id} className={`tab ${activeReport === r.id ? 'active' : ''}`} onClick={() => setActiveReport(r.id)}>{r.label}</button>)}
            </div>

            {activeReport === 'revenue' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    <div className="card"><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Ingresos Mensuales</h3>
                        <ResponsiveContainer width="100%" height={300}><BarChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="month" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={tooltipStyle} formatter={v => [`S/ ${v}`, 'Ingresos']} /><Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart></ResponsiveContainer>
                    </div>
                    <div className="card"><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Ingresos por Sede</h3>
                        <ResponsiveContainer width="100%" height={300}><BarChart data={locationRevenue} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis type="number" stroke="#64748b" fontSize={12} /><YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
                            <Tooltip contentStyle={tooltipStyle} formatter={v => [`S/ ${v}`, 'Ingresos']} /><Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart></ResponsiveContainer>
                    </div>
                </div>
            )}

            {activeReport === 'attendance' && (
                <div className="card"><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Asistencia Semanal</h3>
                    <ResponsiveContainer width="100%" height={350}><BarChart data={weeklyAttendance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="day" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart></ResponsiveContainer>
                </div>
            )}

            {activeReport === 'clients' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    <div className="card"><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Estado de Clientes</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2xl)' }}>
                            <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: 'var(--success)' }}>{clients.filter(c => c.status === 'active').length}</div><div style={{ color: 'var(--text-secondary)' }}>Activos</div></div>
                            <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: 'var(--danger)' }}>{clients.filter(c => c.status === 'inactive').length}</div><div style={{ color: 'var(--text-secondary)' }}>Inactivos</div></div>
                        </div>
                    </div>
                    <div className="card"><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Clientes por Sede</h3>
                        {locations.map(l => {
                            const count = clients.filter(c => c.location?.id === l.id && c.status === 'active').length
                            return <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ fontSize: '0.9375rem' }}>{l.name.replace('RafaGym - ', '')}</span><span className="badge badge-primary">{count} clientes</span>
                            </div>
                        })}
                    </div>
                </div>
            )}

            {activeReport === 'memberships' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    <div className="card"><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Distribución</h3>
                        <ResponsiveContainer width="100%" height={250}><PieChart>
                            <Pie data={membershipDist} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                                {membershipDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie><Tooltip contentStyle={tooltipStyle} />
                        </PieChart></ResponsiveContainer>
                    </div>
                    <div className="card"><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Pagos Pendientes</h3>
                        {payments.filter(p => p.status === 'overdue').length === 0 ? (
                            <div className="empty-state"><p>✅ Sin pagos pendientes</p></div>
                        ) : (
                            payments.filter(p => p.status === 'overdue').map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.client_name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Venció: {p.next_due}</div></div>
                                    <span className="badge badge-danger">S/ {Number(p.amount).toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
