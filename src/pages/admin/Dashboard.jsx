import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { FiUsers, FiDollarSign, FiCalendar, FiAlertTriangle } from 'react-icons/fi'
import { getClients, getPayments, getAttendances, getMembershipTypes } from '../../lib/services'

export default function Dashboard() {
    const [stats, setStats] = useState({ activeClients: 0, todayAttendances: 0, monthRevenue: 0, expiring: 0 })
    const [overduePayments, setOverduePayments] = useState([])
    const [monthlyRevenue, setMonthlyRevenue] = useState([])
    const [membershipDist, setMembershipDist] = useState([])
    const [weeklyAttendance, setWeeklyAttendance] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        try {
            const [clients, payments, attendances, membershipTypes] = await Promise.all([
                getClients(), getPayments(), getAttendances(), getMembershipTypes()
            ])

            const today = new Date().toISOString().split('T')[0]
            const activeClients = clients.filter(c => c.status === 'active').length
            const todayAtt = attendances.filter(a => a.date === today).length

            // This month revenue
            const thisMonth = new Date().toISOString().slice(0, 7)
            const monthRev = payments.filter(p => p.date?.startsWith(thisMonth) && p.status === 'paid')
                .reduce((sum, p) => sum + Number(p.amount), 0)

            // Expiring within 7 days
            const now = new Date()
            const expiring = clients.filter(c => {
                if (!c.membership_end || c.status !== 'active') return false
                const end = new Date(c.membership_end)
                const diff = (end - now) / (1000 * 60 * 60 * 24)
                return diff <= 7 && diff >= 0
            }).length

            // Overdue payments
            const overdue = payments.filter(p => p.status === 'overdue')
            setOverduePayments(overdue)

            // Monthly revenue chart (last 6 months)
            const months = []
            for (let i = 5; i >= 0; i--) {
                const d = new Date()
                d.setMonth(d.getMonth() - i)
                const key = d.toISOString().slice(0, 7)
                const label = d.toLocaleString('es-PE', { month: 'short' })
                const rev = payments.filter(p => p.date?.startsWith(key) && p.status === 'paid')
                    .reduce((sum, p) => sum + Number(p.amount), 0)
                months.push({ month: label.charAt(0).toUpperCase() + label.slice(1), revenue: rev })
            }
            setMonthlyRevenue(months)

            // Membership distribution
            const dist = membershipTypes.map(mt => ({
                name: mt.name,
                value: clients.filter(c => c.membership_type?.id === mt.id && c.status === 'active').length,
                color: mt.color
            }))
            setMembershipDist(dist)

            // Weekly attendance
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab']
            const weekData = [1, 2, 3, 4, 5, 6].map(dayNum => {
                const count = attendances.filter(a => {
                    const d = new Date(a.check_in || a.date)
                    return d.getDay() === dayNum % 7
                }).length
                return { day: dayNames[dayNum % 7], count }
            })
            setWeeklyAttendance(weekData)

            setStats({ activeClients, todayAttendances: todayAtt, monthRevenue: monthRev, expiring })
        } catch (err) {
            console.error('Dashboard error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="dashboard">
                <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner spinner-lg"></div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>Cargando datos...</p>
                </div>
            </div>
        )
    }

    const todayStr = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Resumen general del gimnasio</p>
                </div>
                <div className="badge badge-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    📅 {todayStr}
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiUsers /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Clientes Activos</div>
                        <div className="stat-card-value">{stats.activeClients}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--primary-400)' }}><FiCalendar /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Asistencias Hoy</div>
                        <div className="stat-card-value">{stats.todayAttendances}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Ingresos del Mes</div>
                        <div className="stat-card-value">S/ {stats.monthRevenue.toFixed(0)}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><FiAlertTriangle /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Por Vencer</div>
                        <div className="stat-card-value">{stats.expiring}</div>
                        <div className="stat-card-change negative">Requieren atención</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)', fontWeight: 700 }}>
                        Ingresos Mensuales
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyRevenue}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }}
                                formatter={(value) => [`S/ ${value}`, 'Ingresos']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)', fontWeight: 700 }}>
                        Distribución de Membresías
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={membershipDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                                {membershipDist.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                        {membershipDist.map(m => (
                            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{m.name} ({m.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Attendance + Overdue */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)', fontWeight: 700 }}>
                        Asistencia Semanal
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyAttendance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                            <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiAlertTriangle color="var(--danger)" /> Pagos Vencidos
                    </h3>
                    {overduePayments.length === 0 ? (
                        <div className="empty-state"><p>✅ No hay pagos vencidos</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {overduePayments.map(p => (
                                <div key={p.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 'var(--space-md)', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)',
                                    border: '1px solid rgba(239,68,68,0.15)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.client_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Venció: {p.next_due}</div>
                                    </div>
                                    <span className="badge badge-danger">S/ {Number(p.amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
