import { useState, useEffect } from 'react'
import { getMembershipTypes, getClients } from '../../lib/services'

export default function Memberships() {
    const [membershipTypes, setMembershipTypes] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getMembershipTypes(), getClients()])
            .then(([m, c]) => { setMembershipTypes(m); setClients(c) })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const getMemberCount = (typeId) => clients.filter(c => c.membership_type?.id === typeId && c.status === 'active').length

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Membresías</h1><p className="page-subtitle">Gestiona los planes de membresía del gimnasio</p></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
                {membershipTypes.map(m => (
                    <div key={m.id} className="card" style={{ borderTop: `3px solid ${m.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                            <div>
                                <span style={{ fontSize: '2rem' }}>{m.icon}</span>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>{m.name}</h3>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: m.color }}>S/ {Number(m.price).toFixed(0)}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>/mes</div>
                            </div>
                        </div>
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Beneficios</div>
                            <ul style={{ listStyle: 'none' }}>
                                {m.features?.map((f, i) => (
                                    <li key={i} style={{ padding: '0.375rem 0', fontSize: '0.9375rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: 'var(--success)' }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
                            <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clientes Activos</div><div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>{getMemberCount(m.id)}</div></div>
                            <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duración</div><div style={{ fontWeight: 600 }}>{m.duration_days} días</div></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Comparación de Planes</h3>
                <div className="table-container" style={{ border: 'none' }}>
                    <table className="table">
                        <thead><tr><th>Característica</th>
                            {membershipTypes.map(m => <th key={m.id} style={{ textAlign: 'center' }}>{m.icon} {m.name}</th>)}
                        </tr></thead>
                        <tbody>
                            {[
                                ['Acceso a sedes', m => m.all_locations ? 'Todas' : '1 sede'],
                                ['Ingresos por día', m => m.max_entries_per_day || 'Ilimitado'],
                                ['Asesoramiento', m => m.includes_coaching ? '✅' : '❌'],
                                ['Clases grupales', m => m.free_group_classes ? 'Gratis' : 'Con pago'],
                                ['Invitados/mes', m => m.guests_per_month || '0'],
                                ['Precio', m => `S/ ${Number(m.price).toFixed(2)}`]
                            ].map(([feature, getter], i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{feature}</td>
                                    {membershipTypes.map(m => <td key={m.id} style={{ textAlign: 'center' }}>{getter(m)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
