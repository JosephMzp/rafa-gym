import { useState, useEffect, useMemo } from 'react'
import {
    FiDollarSign, FiHash, FiTrendingDown,
    FiActivity, FiUsers, FiAlertTriangle,
    FiBarChart2,
} from 'react-icons/fi'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts'

import { getClients, getPayments, getAttendances, getLocations } from '../../lib/services'

import ReportsTabs from '../../components/Reports/ReportsTabs'
import ReportsFilters from '../../components/Reports/ReportsFilters'
import ReportKPICards from '../../components/Reports/ReportKPICards'
import ReportDataGrid from '../../components/Reports/ReportDataGrid'
import ExportButtons from '../../components/Reports/ExportButtons'

const fmt = n => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtPct = n => `${Number(n).toFixed(1)}%`

function monthsAgo(n) {
    const d = new Date()
    d.setMonth(d.getMonth() - n)
    d.setDate(1)
    return d.toISOString().split('T')[0]
}

const TOOLTIP_STYLE = {
    background: '#1c1c28',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#f1f5f9',
}

export default function Reports() {
    const [activeTab, setActiveTab] = useState('finance')
    const [loading, setLoading] = useState(true)
    const [clients, setClients] = useState([])
    const [payments, setPayments] = useState([])
    const [attendances, setAttendances] = useState([])
    const [locations, setLocations] = useState([])
    const [dateFrom, setDateFrom] = useState(monthsAgo(3))
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
    const [locationId, setLocationId] = useState('all')

    useEffect(() => {
        setLoading(true)
        Promise.all([getClients(), getPayments(), getAttendances(), getLocations()])
            .then(([c, p, a, l]) => {
                setClients(c)
                setPayments(p)
                setAttendances(a)
                setLocations(l)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const inRange = p.date >= dateFrom && p.date <= dateTo
            const inLoc = locationId === 'all' || String(p.location_id) === String(locationId)
            return inRange && p.status === 'paid' && inLoc
        })
    }, [payments, dateFrom, dateTo, locationId])

    const filteredAttendances = useMemo(() => {
        return attendances.filter(a => {
            const date = a.date || a.check_in?.split('T')[0]
            const inRange = date >= dateFrom && date <= dateTo
            const inLoc = locationId === 'all' || String(a.location_id) === String(locationId)
            return inRange && inLoc
        })
    }, [attendances, dateFrom, dateTo, locationId])

    const financeKPIs = useMemo(() => {
        const total = filteredPayments.reduce((s, p) => s + Number(p.amount), 0)
        const count = filteredPayments.length
        const avg = count ? total / count : 0
        return [
            { label: 'Ingresos Totales', value: fmt(total), sub: `${count} pagos en el período`, Icon: FiDollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
            { label: 'Cantidad de Pagos', value: count, sub: `${dateFrom} → ${dateTo}`, Icon: FiHash, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
            { label: 'Ticket Promedio', value: fmt(avg), sub: 'Por transacción', Icon: FiTrendingDown, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        ]
    }, [filteredPayments, dateFrom, dateTo])

    const financeRows = useMemo(() =>
        filteredPayments.map(p => ({
            id: p.id,
            date: p.date,
            client: p.client_name || p.client?.name || '—',
            concept: p.concept || p.payment_type || '—',
            amount: fmt(p.amount),
            amount_raw: Number(p.amount),
        })),
        [filteredPayments])

    const financeMonthly = useMemo(() => {
        const map = {}
        filteredPayments.forEach(p => {
            const key = p.date?.slice(0, 7)
            if (key) map[key] = (map[key] || 0) + Number(p.amount)
        })
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, rev]) => ({
                month: new Date(key + '-01').toLocaleString('es-PE', { month: 'short' }),
                revenue: rev,
            }))
    }, [filteredPayments])

    const FINANCE_COLUMNS = [
        { key: 'date', header: 'Fecha' },
        { key: 'client', header: 'Cliente' },
        { key: 'concept', header: 'Concepto' },
        { key: 'amount', header: 'Monto', align: 'right' },
    ]

    const operationsKPIs = useMemo(() => {
        const total = filteredAttendances.length
        const unique = new Set(filteredAttendances.map(a => a.client_id)).size
        const avg = unique ? (total / unique).toFixed(1) : 0
        return [
            { label: 'Total Asistencias', value: total, sub: 'En el período', Icon: FiActivity, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
            { label: 'Clientes Únicos', value: unique, sub: 'Que asistieron al menos 1x', Icon: FiUsers, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
            { label: 'Asist. Promedio', value: avg, sub: 'Por cliente único', Icon: FiBarChart2, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
        ]
    }, [filteredAttendances])

    const operationsRows = useMemo(() =>
        filteredAttendances.map(a => ({
            id: a.id,
            date: a.date || a.check_in?.split('T')[0] || '—',
            time: a.time || '—',
            client: a.client_name || '—',
            location: (a.location_name || '—').replace('RafaGym - ', ''),
            membership: a.membership_type || '—',
        })),
        [filteredAttendances])

    const attendanceByDay = useMemo(() => {
        const DAY = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        const map = {}
        filteredAttendances.forEach(a => {
            const d = new Date(a.check_in || a.date)
            const key = DAY[d.getDay()]
            map[key] = (map[key] || 0) + 1
        })
        return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => ({
            day, count: map[day] || 0,
        }))
    }, [filteredAttendances])

    const OPS_COLUMNS = [
        { key: 'date', header: 'Fecha' },
        { key: 'time', header: 'Hora' },
        { key: 'client', header: 'Cliente' },
        { key: 'location', header: 'Sede' },
        { key: 'membership', header: 'Membresía' },
    ]

    const retentionKPIs = useMemo(() => {
        const periodStart = new Date(dateFrom)
        const activeAtStart = clients.filter(c => {
            const joined = new Date(c.created_at || c.membership_start || '2000-01-01')
            return joined <= periodStart && c.status === 'active'
        }).length

        const cancellations = clients.filter(c => {
            if (c.status !== 'inactive') return false
            const upd = (c.updated_at || '').split('T')[0]
            return upd >= dateFrom && upd <= dateTo
        }).length

        const churnRate = activeAtStart > 0 ? (cancellations / activeAtStart) * 100 : 0
        const retentionRate = 100 - churnRate

        return [
            { label: 'Churn Rate', value: fmtPct(churnRate), sub: 'Cancelaciones / Base anterior', Icon: FiAlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
            { label: 'Retención', value: fmtPct(retentionRate), sub: '100% − Churn', Icon: FiUsers, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
            { label: 'Cancelaciones', value: cancellations, sub: `Base activa: ${activeAtStart}`, Icon: FiTrendingDown, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        ]
    }, [clients, dateFrom, dateTo])

    const retentionRows = useMemo(() => {
        return clients
            .filter(c => {
                if (c.status !== 'inactive') return false
                const upd = (c.updated_at || '').split('T')[0]
                return upd >= dateFrom && upd <= dateTo
            })
            .map(c => ({
                id: c.id,
                name: c.name,
                location: (c.location_name || '—').replace('RafaGym - ', ''),
                membership: c.membership_type?.name || '—',
                cancelled: (c.updated_at || '').split('T')[0],
            }))
    }, [clients, dateFrom, dateTo])

    const RETENTION_COLUMNS = [
        { key: 'name', header: 'Cliente' },
        { key: 'location', header: 'Sede' },
        { key: 'membership', header: 'Membresía' },
        { key: 'cancelled', header: 'Fecha de baja' },
    ]

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '6rem' }}>
            <div className="spinner spinner-lg" />
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>Cargando reportes…</p>
        </div>
    )

    const tabConfig = {
        finance: { kpis: financeKPIs, rows: financeRows, columns: FINANCE_COLUMNS, filename: 'Reporte_Finanzas', sheet: 'Finanzas' },
        operations: { kpis: operationsKPIs, rows: operationsRows, columns: OPS_COLUMNS, filename: 'Reporte_Asistencias', sheet: 'Asistencias' },
        retention: { kpis: retentionKPIs, rows: retentionRows, columns: RETENTION_COLUMNS, filename: 'Reporte_Retencion', sheet: 'Retención' },
    }
    const { kpis, rows, columns, filename, sheet } = tabConfig[activeTab]

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes</h1>
                    <p className="page-subtitle">Análisis corporativo del gimnasio</p>
                </div>
                <ExportButtons
                    filename={filename}
                    sheetName={sheet}
                    columns={columns}
                    rows={rows}
                />
            </div>

            {/* Tabs */}
            <ReportsTabs active={activeTab} onChange={setActiveTab} />

            {/* Filters */}
            <ReportsFilters
                dateFrom={dateFrom}
                dateTo={dateTo}
                locationId={locationId}
                locations={locations}
                onDateFrom={setDateFrom}
                onDateTo={setDateTo}
                onLocation={setLocationId}
            />

            {/* KPI Cards */}
            <ReportKPICards cards={kpis} />

            {/* Charts — only in Finance and Operations */}
            {activeTab === 'finance' && financeMonthly.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)', fontSize: '1rem' }}>
                        Ingresos por Mes
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={financeMonthly} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `S/${v}`} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [fmt(v), 'Ingresos']} />
                            <Bar dataKey="revenue" fill="var(--primary-500)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {activeTab === 'operations' && (
                <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)', fontSize: '1rem' }}>
                        Asistencia por Día de la Semana
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={attendanceByDay} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v, 'Asistencias']} />
                            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Data Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {rows.length} registro{rows.length !== 1 ? 's' : ''}
                </span>
            </div>
            <ReportDataGrid
                columns={columns}
                rows={rows}
                rowKey="id"
            />
        </div>
    )
}
