import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getClients, getClientMeasurements, createMeasurement, deleteMeasurement } from '../../lib/services'
import { FiPlus, FiSearch, FiUser, FiX, FiActivity } from 'react-icons/fi'

import MeasurementStats from '../../components/Measurements/MeasurementStats'
import MeasurementChart from '../../components/Measurements/MeasurementChart'
import MeasurementHistoryTable from '../../components/Measurements/MeasurementHistoryTable'
import MeasurementFormModal from '../../components/Measurements/MeasurementFormModal'

export default function Measurements() {
    const { user } = useAuth()

    const [clients, setClients] = useState([])
    const [selectedClient, setSelectedClient] = useState(null)
    const [measurements, setMeasurements] = useState([])

    const [search, setSearch] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [loadingM, setLoadingM] = useState(false)

    useEffect(() => { getClients().then(setClients) }, [])

    useEffect(() => {
        if (!selectedClient) { setMeasurements([]); return }
        setLoadingM(true)
        getClientMeasurements(selectedClient.id).then(d => {
            setMeasurements(d)
            setLoadingM(false)
        })
    }, [selectedClient])

    const filtered = useMemo(() =>
        clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8),
        [clients, search])

    const handleSave = async (formData) => {
        const payload = { ...formData, client_id: selectedClient.id }
        if (user?.isStaff) payload.recorded_by = user.id
        Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })

        await createMeasurement(payload)
        const updated = await getClientMeasurements(selectedClient.id)
        setMeasurements(updated)
        setShowModal(false)
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta medición?')) return
        await deleteMeasurement(id)
        setMeasurements(m => m.filter(x => x.id !== id))
    }

    return (
        <div style={{ padding: 'var(--space-xl)', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
                        <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}>
                            <FiActivity style={{ color: 'white' }} size={24} />
                        </div>
                        Medidas Corporales
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: '1rem' }}>Registro y evolución física de clientes a lo largo del tiempo</p>
                </div>
                {selectedClient && (
                    <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700, boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }} onClick={() => setShowModal(true)}>
                        <FiPlus size={18} /> Nueva Medición
                    </button>
                )}
            </div>

            {/* Selector de Cliente */}
            <div className="card glass" style={{ marginBottom: 'var(--space-xl)', borderTop: '4px solid var(--primary-500)', overflow: 'visible' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: 12, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Seleccionar Cliente</label>
                <div style={{ position: 'relative', maxWidth: 480 }}>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-400)', fontSize: '1.2rem' }} />
                        <input
                            className="form-input"
                            style={{ paddingLeft: 44, height: 48, fontSize: '1rem', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                            placeholder="Buscar cliente por nombre..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                            onFocus={() => setShowDropdown(true)}
                        />
                    </div>
                    {showDropdown && filtered.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginTop: 8, overflow: 'hidden' }}>
                            {filtered.map((c, idx) => (
                                <div key={c.id}
                                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, borderBottom: idx < filtered.length - 1 ? '1px solid var(--dark-700)' : 'none', transition: 'background 0.15s' }}
                                    onMouseDown={() => { setSelectedClient(c); setSearch(c.name); setShowDropdown(false) }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-700)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0 }}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.membership_type?.name || 'Sin membresía'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selectedClient && (
                    <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--dark-800)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-700)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cliente actual:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>{selectedClient.name}</span>
                        </div>
                        <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24, marginLeft: 4 }} onClick={() => { setSelectedClient(null); setSearch(''); setMeasurements([]) }}>
                            <FiX size={14} />
                        </button>
                    </div>
                )}
            </div>

            {!selectedClient && (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)', background: 'var(--dark-800)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-subtle)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                        <FiUser size={40} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Ningún cliente seleccionado</h3>
                    <p style={{ fontSize: '1rem', maxWidth: 400, margin: '0 auto' }}>Usa el buscador de arriba para seleccionar un cliente y ver o registrar su historial de medidas.</p>
                </div>
            )}

            {selectedClient && loadingM && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner spinner-lg" />
                    <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontWeight: 600 }}>Cargando datos...</div>
                </div>
            )}

            {selectedClient && !loadingM && (
                <>
                    <MeasurementStats measurements={measurements} />
                    <MeasurementChart measurements={measurements} />
                    <MeasurementHistoryTable measurements={measurements} onDelete={handleDelete} onNewMeasurement={() => setShowModal(true)} />
                </>
            )}

            {showModal && (
                <MeasurementFormModal
                    selectedClient={selectedClient}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}