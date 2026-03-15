import { useState, useEffect } from 'react'
import { FiMapPin, FiPhone, FiClock, FiUsers } from 'react-icons/fi'
import { getLocations, getClients, getAttendances } from '../../lib/services'

export default function Locations() {
    const [locations, setLocations] = useState([])
    const [clients, setClients] = useState([])
    const [attendances, setAttendances] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getLocations(), getClients(), getAttendances()])
            .then(([l, c, a]) => { setLocations(l); setClients(c); setAttendances(a) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const today = new Date().toISOString().split('T')[0]
    const getClientCount = (locId) => clients.filter(c => c.location?.id === locId && c.status === 'active').length
    const getTodayAttendance = (locId) => attendances.filter(a => a.location_id === locId && a.date === today).length

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header"><div><h1 className="page-title">Sedes</h1><p className="page-subtitle">Administra las sedes del gimnasio</p></div></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 'var(--space-xl)' }}>
                {locations.map(loc => (
                    <div key={loc.id} className="card" style={{ padding: 0 }}>
                        <div style={{ padding: 'var(--space-xl)', background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,88,12,0.03))', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div><h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{loc.name}</h3><span className={`badge ${loc.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{loc.status === 'active' ? 'Activa' : 'Inactiva'}</span></div>
                                <div style={{ fontSize: '2rem' }}>🏢</div>
                            </div>
                        </div>
                        <div style={{ padding: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}><FiMapPin size={16} color="var(--primary-400)" /> {loc.address}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}><FiPhone size={16} color="var(--primary-400)" /> {loc.phone}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}><FiClock size={16} color="var(--primary-400)" /> {loc.hours}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}><FiUsers size={16} color="var(--primary-400)" /> Capacidad: {loc.capacity} personas</div>
                            </div>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Servicios</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                    {loc.services?.map((s, i) => <span key={i} className="badge badge-primary">{s}</span>)}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Clientes</div><div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>{getClientCount(loc.id)}</div></div>
                                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Asistencias Hoy</div><div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-400)' }}>{getTodayAttendance(loc.id)}</div></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
