import { CLIENTS, MEMBERSHIP_TYPES, LOCATIONS, ATTENDANCES, PAYMENTS, ROUTINES, CLASSES } from '../../data/demoData'
import { useAuth } from '../../context/AuthContext'
import { FiUser, FiAward, FiCalendar, FiDollarSign, FiActivity, FiBookOpen } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

export default function ClientDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    // Demo: show Carlos Mendoza's data
    const client = CLIENTS[0]
    const membership = MEMBERSHIP_TYPES.find(m => m.id === client.membership_type_id)
    const location = LOCATIONS.find(l => l.id === client.location_id)
    const clientAttendances = ATTENDANCES.filter(a => a.client_id === client.id).slice(0, 5)
    const clientPayments = PAYMENTS.filter(p => p.client_id === client.id).slice(0, 3)
    const clientRoutine = ROUTINES.find(r => r.client_id === client.id)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const daysLeft = Math.max(0, Math.ceil((new Date(client.end_date) - new Date('2026-03-01')) / (1000 * 60 * 60 * 24)))

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)' }}>
            {/* Top nav */}
            <nav className="glass" style={{ padding: '0.75rem var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 50 }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                    <span style={{ fontSize: '1.5rem' }}>💪</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>Rafa<span className="gradient-text">Gym</span></span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Salir</button>
                </div>
            </nav>

            <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '1100px' }}>
                {/* Welcome Header */}
                <div style={{ marginBottom: 'var(--space-2xl)' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>
                        Hola, <span className="gradient-text">{client.name}</span> 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Aquí está el resumen de tu cuenta</p>
                </div>

                {/* Membership Card */}
                <div className="card" style={{ marginBottom: 'var(--space-xl)', background: `linear-gradient(135deg, ${membership.color}15, ${membership.color}05)`, borderColor: `${membership.color}30` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FiAward color={membership.color} size={20} />
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: membership.color }}>
                                    Membresía {membership.name} {membership.icon}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sede: {location.name}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: daysLeft <= 7 ? 'var(--danger)' : 'var(--success)' }}>
                                {daysLeft}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>días restantes</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vence: {client.end_date}</div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--primary-400)' }}><FiCalendar /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Asistencias</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{clientAttendances.length}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Último Pago</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>S/ {clientPayments[0]?.amount || 0}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiActivity /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Rutina</div>
                            <div className="stat-card-value" style={{ fontSize: '1rem' }}>{clientRoutine?.objective || 'Sin asignar'}</div>
                        </div>
                    </div>
                </div>

                {/* Two columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    {/* Recent Attendance */}
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCalendar color="var(--primary-400)" /> Últimas Asistencias
                        </h3>
                        {clientAttendances.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                                <span>{a.date}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{a.time} - {a.location_name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Current Routine */}
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiActivity color="var(--primary-400)" /> Mi Rutina
                        </h3>
                        {clientRoutine ? (
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    <strong>Objetivo:</strong> {clientRoutine.objective}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    <strong>Nivel:</strong> <span className="badge badge-warning">{clientRoutine.level}</span>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    <strong>Entrenador:</strong> {clientRoutine.trainer}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <strong>Días:</strong> {clientRoutine.days.map(d => <span key={d} className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>{d}</span>)}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state"><p>No tienes rutina asignada</p></div>
                        )}
                    </div>
                </div>

                {/* Personal Info */}
                <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser color="var(--primary-400)" /> Mis Datos
                    </h3>
                    <div className="form-grid">
                        {[
                            ['Nombre', client.name],
                            ['Documento', client.document],
                            ['Email', client.email],
                            ['Teléfono', client.phone],
                            ['Fecha de Nacimiento', client.birth_date],
                            ['Dirección', client.address]
                        ].map(([label, value]) => (
                            <div key={label} className="form-group">
                                <span className="form-label">{label}</span>
                                <span style={{ fontSize: '0.9375rem' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
