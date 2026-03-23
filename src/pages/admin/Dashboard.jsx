import React, { useState, useEffect, useMemo } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line
} from 'recharts'
import { FiUsers, FiDollarSign, FiCalendar, FiAlertTriangle, FiFilter } from 'react-icons/fi'
import {
    getClients, getPayments, getAttendances, getLocations, getMembershipTypes,
    getActiveClientsWithMembershipView, getClassAttendanceStatsView
} from '../../lib/services'

export default function Dashboard() {
    // ---- Raw Data State ----
    const [clientsView, setClientsView] = useState([])
    const [payments, setPayments] = useState([])
    const [attendances, setAttendances] = useState([])
    const [classStats, setClassStats] = useState([])
    const [locations, setLocations] = useState([])
    const [memTypes, setMemTypes] = useState([])
    const [loading, setLoading] = useState(true)

    // ---- Filters State ----
    const [filters, setFilters] = useState({
        location_id: 'all',
        date_range: 'este_mes', // 'hoy', 'semana', 'mes', 'todo'
        membership_type_id: 'all',
        client_status: 'all' // 'active', 'inactive', 'expira_pronto'
    })

    useEffect(() => {
        async function fetchAll() {
            try {
                const [cv, pays, atts, cs, locs, mts] = await Promise.all([
                    getActiveClientsWithMembershipView(),
                    getPayments(),
                    getAttendances(),
                    getClassAttendanceStatsView(),
                    getLocations(),
                    getMembershipTypes()
                ])
                setClientsView(cv || [])
                setPayments(pays || [])
                setAttendances(atts || [])
                setClassStats(cs || [])
                setLocations(locs || [])
                setMemTypes(mts || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    // ---- Date Helpers ----
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)) // Lunes
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    function isWithinDateRange(dateStr, rangeStr) {
        if (rangeStr === 'todo' || !dateStr) return true
        const d = new Date(dateStr)
        if (rangeStr === 'hoy') return d >= startOfToday
        if (rangeStr === 'semana') return d >= startOfWeek
        if (rangeStr === 'este_mes') return d >= startOfMonth
        return true
    }

    // ---- Computed Stats & Derived Data ----
    const computed = useMemo(() => {
        let fClients = clientsView.filter(c => {
            if (filters.location_id !== 'all' && c.location_id !== filters.location_id) return false
            if (filters.membership_type_id !== 'all' && c.membership_type_id !== filters.membership_type_id) return false
            if (filters.client_status === 'active' && c.client_status !== 'active') return false
            if (filters.client_status === 'inactive' && c.client_status !== 'inactive') return false
            if (filters.client_status === 'expira_pronto' && c.estado_riesgo !== 'expira_pronto') return false
            return true
        })

        let fPayments = payments.filter(p => {
            if (p.status !== 'paid') return false
            if (!isWithinDateRange(p.date, filters.date_range)) return false
            // Note: payments don't directly have location right now unless joined, we'll ignore location filter for raw payments or join roughly
            return true
        })

        let fAttendances = attendances.filter(a => {
            if (filters.location_id !== 'all' && a.location_id !== filters.location_id) return false
            if (!isWithinDateRange(a.check_in, filters.date_range)) return false
            return true
        })

        let fClassStats = classStats.filter(cs => {
            if (filters.location_id !== 'all' && cs.location_id !== filters.location_id) return false
            return true
        })

        // -- KPIs --
        const monthRevenue = fPayments.reduce((acc, p) => acc + Number(p.amount), 0)
        const activeClients = fClients.filter(c => c.client_status === 'active').length
        const churnRisk = fClients.filter(c => c.estado_riesgo === 'expira_pronto').length
        
        // Aforo (no check_out today)
        const todayStr = new Date().toISOString().split('T')[0]
        const aforo = attendances.filter(a => a.check_in?.startsWith(todayStr) && !a.check_out && (filters.location_id === 'all' || a.location_id === filters.location_id)).length

        // -- Charts Data --
        
        // 1. Monthly Revenue Trend
        const monthlyRevMap = {}
        payments.filter(p => p.status === 'paid').forEach(p => {
            if (!p.date) return
            const mKey = p.date.substring(0, 7) // YYYY-MM
            monthlyRevMap[mKey] = (monthlyRevMap[mKey] || 0) + Number(p.amount)
        })
        const past6Months = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const mStr = d.toISOString().substring(0, 7)
            const label = d.toLocaleString('es-PE', { month: 'short' })
            past6Months.push({ month: label.charAt(0).toUpperCase() + label.slice(1), revenue: monthlyRevMap[mStr] || 0 })
        }

        // 2. Revenue by Membership Type (Donut)
        // We'll estimate this by looking at clients active currently
        const memCountMap = {}
        fClients.forEach(c => {
            const name = c.membership_name || 'Sin plan'
            memCountMap[name] = (memCountMap[name] || 0) + 1
        })
        const membershipDist = Object.entries(memCountMap).map(([name, count]) => {
            const mt = memTypes.find(m => m.name === name)
            return { name, value: count, fill: mt?.color || '#94a3b8' }
        })

        // 3. Class Performance (Bar)
        const classPerfData = fClassStats.map(cs => ({
            name: cs.class_name, 
            capacidad: cs.capacidad_maxima || 0,
            asistencias: cs.asistencia_promedio || 0
        })).sort((a,b) => b.asistencias - a.asistencias).slice(0, 8)

        // 4. Heatmap Data (Hour vs Day)
        // Days 1: Lunes -> 0: Domingo
        const heatmapMatrix = Array(7).fill(0).map(() => Array(24).fill(0))
        fAttendances.forEach(a => {
            if (!a.check_in) return
            const d = new Date(a.check_in)
            const day = d.getDay() // 0=Sun, 1=Mon
            const hour = d.getHours()
            heatmapMatrix[day][hour]++
        })

        // Format heatmap specifically for 6AM to 10PM (16 hours)
        const daysLabel = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        const heatmapCells = []
        let maxHeat = 0
        for (let d = 1; d <= 7; d++) {
            const currentDay = d % 7 // Lun to Dom
            for (let h = 6; h <= 21; h++) {
                const val = heatmapMatrix[currentDay][h]
                if (val > maxHeat) maxHeat = val
                heatmapCells.push({ day: daysLabel[currentDay], hour: h, val })
            }
        }

        // 5. Daily Attendances (LineChart)
        const dailyAttMap = {}
        fAttendances.forEach(a => {
            if (!a.check_in) return
            const dStr = a.check_in.substring(0, 10) // YYYY-MM-DD
            dailyAttMap[dStr] = (dailyAttMap[dStr] || 0) + 1
        })
        const dailyAttData = Object.entries(dailyAttMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, count]) => {
                const parts = date.split('-')
                const label = `${parts[2]}/${parts[1]}`
                return { fullDate: date, date: label, asistencias: count }
            })

        return {
            monthRevenue, activeClients, churnRisk, aforo,
            past6Months, membershipDist, classPerfData, heatmapCells, maxHeat, dailyAttData
        }

    }, [clientsView, payments, attendances, classStats, filters, memTypes])


    if (loading) {
        return (
            <div className="dashboard page-container">
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <div className="spinner spinner-lg"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Calculando métricas analíticas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard page-container" style={{ paddingBottom: '4rem' }}>
            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <h1 className="page-title">Dashboard Analítico</h1>
                    <p className="page-subtitle">Indicadores clave y análisis operativo</p>
                </div>
            </div>

            {/* Global Filters Bar */}
            <div className="card" style={{ marginBottom: 'var(--space-2xl)', padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)', fontWeight: 600, marginRight: '1rem' }}>
                    <FiFilter /> Filtros
                </div>
                
                <select className="form-input" style={{ width: 'auto', minWidth: 150 }} 
                    value={filters.location_id} onChange={(e) => setFilters(f => ({...f, location_id: e.target.value}))}>
                    <option value="all">📍 Todas las Sedes</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>

                <select className="form-input" style={{ width: 'auto', minWidth: 150 }} 
                    value={filters.date_range} onChange={(e) => setFilters(f => ({...f, date_range: e.target.value}))}>
                    <option value="este_mes">📅 Este Mes</option>
                    <option value="semana">📅 Esta Semana</option>
                    <option value="hoy">📅 Hoy</option>
                    <option value="todo">📅 Histórico Total</option>
                </select>

                <select className="form-input" style={{ width: 'auto', minWidth: 150 }} 
                    value={filters.membership_type_id} onChange={(e) => setFilters(f => ({...f, membership_type_id: e.target.value}))}>
                    <option value="all">💎 Todos los Planes</option>
                    {memTypes.map(m => <option key={m.id} value={m.id}>Plan {m.name}</option>)}
                </select>

                <select className="form-input" style={{ width: 'auto', minWidth: 150 }} 
                    value={filters.client_status} onChange={(e) => setFilters(f => ({...f, client_status: e.target.value}))}>
                    <option value="all">🏃‍♂️ Todos los Estados</option>
                    <option value="active">🟢 Activos</option>
                    <option value="expira_pronto">🟠 Riesgo Churn</option>
                    <option value="inactive">🔴 Inactivos</option>
                </select>
            </div>

            {/* 1. KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Ingresos Filtro</div>
                        <div className="stat-card-value">S/ {computed.monthRevenue.toLocaleString('en-US', {maximumFractionDigits:0})}</div>
                    </div>
                </div>
                
                <div className="stat-card" style={{ borderLeft: '4px solid var(--info)' }}>
                    <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiUsers /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Clientes Activos</div>
                        <div className="stat-card-value">{computed.activeClients}</div>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><FiAlertTriangle /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Riesgo Churn (7D)</div>
                        <div className="stat-card-value">{computed.churnRisk}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, fontWeight: 500 }}>¡Atención requerida!</div>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
                    <div className="stat-card-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary-400)' }}><FiCalendar /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Aforo Actual</div>
                        <div className="stat-card-value">{computed.aforo}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Asistencias hoy s/ salida</div>
                    </div>
                </div>
            </div>

            {/* 2. Charts Data Row A */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                {/* Heatmap */}
                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', fontWeight: 700, fontSize: '1.1rem' }}>
                        🔥 Mapa de Calor de Asistencias (Hora vs Día)
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Analiza las horas pico del gimnasio filtrado por el rango de fechas seleccionado.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(16, 1fr)', gap: '4px', position: 'relative' }}>
                        {/* Headers Horizontal */}
                        <div style={{ height: 20 }}></div>
                        {Array.from({length: 16}).map((_, i) => (
                            <div key={i} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                {i + 6}
                            </div>
                        ))}

                        {/* Rows */}
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
                            <React.Fragment key={dayName}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.5rem' }}>
                                    {dayName}
                                </div>
                                {computed.heatmapCells.filter(c => c.day === dayName).map((cell, i) => {
                                    let opacity = computed.maxHeat === 0 ? 0.05 : (cell.val / computed.maxHeat)
                                    if (opacity > 0 && opacity < 0.2) opacity = 0.2 // min visibility
                                    
                                    return (
                                        <div key={i} title={cell.val + ' asistencias a las ' + cell.hour + ':00'} style={{ 
                                            background: `rgba(249, 115, 22, ${opacity})`, 
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '4px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s'
                                        }} 
                                        onMouseEnter={(e)=> e.currentTarget.style.transform='scale(1.2)'}
                                        onMouseLeave={(e)=> e.currentTarget.style.transform='scale(1)'}
                                        />
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Class Performance */}
                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', fontWeight: 700, fontSize: '1.1rem' }}>
                        🏋️ Rendimiento de Clases Grupales
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Inscripciones actuales vs Capacidad Máxima (Top 8 Clases)
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={computed.classPerfData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tick={{fill: '#94a3b8'}} angle={-15} textAnchor="end" height={50} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                            <Bar dataKey="asistencias" name="Inscritos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="capacidad" name="Capacidad" fill="#334155" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Daily Attendance LineChart - Full Width */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', fontWeight: 700, fontSize: '1.1rem' }}>
                    📈 Evolución de Asistencias Diarias
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Monitorea el flujo de ingresos al gimnasio día por día según los filtros seleccionados.
                </p>
                {computed.dailyAttData.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No hay suficientes datos de asistencia con los filtros actuales para graficar la evolución.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={computed.dailyAttData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tick={{fill: '#94a3b8'}} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="asistencias" name="Ctd. Personas" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* 3. Charts Data Row B */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-lg)' }}>
                {/* Donut Membership */}
                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', fontWeight: 700, fontSize: '1.1rem' }}>
                        💎 Distribución de Clientes
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Desglose de los planes contratados por clientes actuales.
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={computed.membershipDist} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name" />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {computed.membershipDist.map(m => (
                            <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: m.fill }} />
                                    <span style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                                </div>
                                <span style={{ fontWeight: 600 }}>{m.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tendencia Ingresos */}
                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', fontWeight: 700, fontSize: '1.1rem' }}>
                        📈 Tendencia de Ingresos (Últimos 6 meses)
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Comparativa de los ingresos por venta de planes a nivel general histórico. Esta métrica ignora filtros de tiempo.
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={computed.past6Months} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => 'S/ ' + val} />
                            <Tooltip 
                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                formatter={(value) => [`S/ ${value}`, 'Ingresos']}
                            />
                            <Area type="monotone" dataKey="revenue" name="Ingresos" stroke="#10b981" strokeWidth={3} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
        </div>
    )
}
