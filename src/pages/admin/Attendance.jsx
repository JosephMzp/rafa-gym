import { useState, useEffect } from 'react'
import { FiSearch, FiCheckCircle, FiClock, FiFilter } from 'react-icons/fi'
import { getClients, getAttendances, getLocations, createAttendance } from '../../lib/services'

export default function Attendance() {
    const [attendances, setAttendances] = useState([])
    const [allClients, setAllClients] = useState([])
    const [locations, setLocations] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLocation, setSelectedLocation] = useState('all')
    const [registerResult, setRegisterResult] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [a, c, l] = await Promise.all([getAttendances(), getClients(), getLocations()])
            setAttendances(a); setAllClients(c); setLocations(l)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filtered = attendances.filter(a => {
        const matchSearch = a.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchLocation = selectedLocation === 'all' || a.location_id === selectedLocation
        return matchSearch && matchLocation
    })

    const registerAttendanceHandler = async (clientName) => {
        const client = allClients.find(c => c.name?.toLowerCase().includes(clientName.toLowerCase()))
        if (!client) { setRegisterResult({ type: 'error', message: 'Cliente no encontrado' }); return }
        if (client.status !== 'active') { setRegisterResult({ type: 'error', message: 'El cliente está inactivo' }); return }

        const today = new Date().toISOString().split('T')[0]
        const todayAtt = attendances.filter(a => a.client_id === client.id && a.date === today)
        const membershipName = client.membership_type?.name

        if (membershipName === 'Estándar' && todayAtt.length >= 1) {
            setRegisterResult({ type: 'warning', message: `${client.name} ya tiene 1 ingreso hoy (Estándar: máx 1/día)` }); return
        }
        if (membershipName === 'Fit' && todayAtt.length >= 1) {
            setRegisterResult({ type: 'warning', message: `${client.name} ya tiene 1 ingreso hoy (Fit: máx 1/día)` }); return
        }

        try {
            await createAttendance({ client_id: client.id, location_id: client.location?.id || locations[0]?.id })
            setRegisterResult({ type: 'success', message: `✅ Asistencia registrada para ${client.name} (${membershipName || 'N/A'})` })
            setSearchQuery('')
            await loadData()
        } catch (err) {
            setRegisterResult({ type: 'error', message: 'Error al registrar asistencia' })
        }
    }

    const suggestions = searchQuery.length > 1
        ? allClients.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) && c.status === 'active').slice(0, 5)
        : []

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Control de Asistencias</h1><p className="page-subtitle">Registra y consulta las asistencias de los clientes</p></div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCheckCircle color="var(--success)" /> Registrar Asistencia
                </h3>
                <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <div className="search-bar" style={{ flex: 1 }}>
                        <span className="search-bar-icon"><FiSearch /></span>
                        <input placeholder="Buscar cliente por nombre..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') registerAttendanceHandler(searchQuery) }} />
                    </div>
                    <button className="btn btn-primary" onClick={() => registerAttendanceHandler(searchQuery)}>Registrar</button>
                </div>
                {registerResult && (
                    <div className={`alert alert-${registerResult.type === 'success' ? 'success' : registerResult.type === 'warning' ? 'warning' : 'danger'}`} style={{ marginTop: 'var(--space-md)' }}>
                        {registerResult.message}
                    </div>
                )}
                {suggestions.length > 0 && (
                    <div style={{ marginTop: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {suggestions.map(c => (
                            <button key={c.id} className="btn btn-sm btn-secondary" onClick={() => { setSearchQuery(c.name); registerAttendanceHandler(c.name) }}>
                                {c.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', alignItems: 'center' }}>
                <FiFilter color="var(--text-muted)" />
                <select className="form-input" style={{ maxWidth: 200 }} value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
                    <option value="all">Todas las sedes</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name.replace('RafaGym - ', '')}</option>)}
                </select>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Cliente</th><th>Membresía</th><th>Sede</th><th>Fecha</th><th>Hora</th></tr></thead>
                    <tbody>
                        {filtered.map(a => (
                            <tr key={a.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{a.client_name?.charAt(0)}</div>
                                        <span style={{ fontWeight: 500 }}>{a.client_name}</span>
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{a.membership_type || '-'}</span></td>
                                <td style={{ fontSize: '0.875rem' }}>{a.location_name}</td>
                                <td style={{ fontSize: '0.875rem' }}>{a.date}</td>
                                <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}><FiClock size={14} /> {a.time}</div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No hay registros de asistencia</div></div>}
            </div>
        </div>
    )
}
