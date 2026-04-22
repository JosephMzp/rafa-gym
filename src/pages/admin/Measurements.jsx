import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getClients } from '../../lib/services'
import { getClientMeasurements, createMeasurement, deleteMeasurement } from '../../lib/services'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
    FiPlus, FiTrash2, FiSliders, FiUser, FiTrendingDown, FiTrendingUp,
    FiChevronDown, FiX, FiSave, FiCamera, FiSearch
} from 'react-icons/fi'

const EMPTY_FORM = {
    fecha_medicion: new Date().toISOString().split('T')[0],
    peso_kg: '', altura_cm: '', porcentaje_grasa: '', porcentaje_musculo: '',
    cuello_cm: '', pecho_cm: '', cintura_cm: '', cadera_cm: '',
    brazo_derecho_cm: '', pierna_derecha_cm: '',
    foto_frente_url: '', foto_perfil_url: '', foto_espalda_url: '',
    notas: ''
}

export default function Measurements() {
    const { user } = useAuth()
    const [clients, setClients] = useState([])
    const [selectedClient, setSelectedClient] = useState(null)
    const [measurements, setMeasurements] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [loadingM, setLoadingM] = useState(false)
    const [activeChart, setActiveChart] = useState(['peso_kg'])

    useEffect(() => {
        getClients().then(setClients)
    }, [])

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

    const latest = measurements[measurements.length - 1]
    const prev = measurements[measurements.length - 2]

    const diff = (field) => {
        if (!latest || !prev || !latest[field] || !prev[field]) return null
        return (Number(latest[field]) - Number(prev[field])).toFixed(1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            const payload = { ...form, client_id: selectedClient.id }
            if (user?.isStaff) payload.registrado_por = user.id
            Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })
            await createMeasurement(payload)
            const updated = await getClientMeasurements(selectedClient.id)
            setMeasurements(updated)
            setShowModal(false)
            setForm(EMPTY_FORM)
        } catch (err) {
            if (err.message?.includes('unique') || err.code === '23505')
                setError('Ya existe una medición para este cliente en esa fecha.')
            else setError(err.message || 'Error al guardar.')
        } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta medición?')) return
        await deleteMeasurement(id)
        setMeasurements(m => m.filter(x => x.id !== id))
    }

    const chartLines = [
        { key: 'peso_kg', label: 'Peso (kg)', color: '#8b5cf6' },
        { key: 'porcentaje_grasa', label: '% Grasa', color: '#ef4444' },
        { key: 'porcentaje_musculo', label: '% Músculo', color: '#10b981' },
        { key: 'cintura_cm', label: 'Cintura (cm)', color: '#f59e0b' },
    ]

    const chartData = measurements.map(m => ({
        fecha: m.fecha_medicion,
        peso_kg: m.peso_kg ? Number(m.peso_kg) : null,
        porcentaje_grasa: m.porcentaje_grasa ? Number(m.porcentaje_grasa) : null,
        porcentaje_musculo: m.porcentaje_musculo ? Number(m.porcentaje_musculo) : null,
        cintura_cm: m.cintura_cm ? Number(m.cintura_cm) : null,
    }))

    return (
        <div style={{ padding: 'var(--space-lg)', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiSliders style={{ color: 'var(--primary)' }} /> Medidas Corporales
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Registro y evolución física de clientes</p>
                </div>
                {selectedClient && (
                    <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }}>
                        <FiPlus /> Nueva Medición
                    </button>
                )}
            </div>

            {/* Client selector */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', border: '1px solid var(--border)' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Seleccionar cliente</label>
                <div style={{ position: 'relative', maxWidth: 420 }}>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            className="form-input"
                            style={{ paddingLeft: 36 }}
                            placeholder="Buscar cliente..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                            onFocus={() => setShowDropdown(true)}
                        />
                    </div>
                    {showDropdown && filtered.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 50, boxShadow: 'var(--shadow-lg)', marginTop: 4 }}>
                            {filtered.map(c => (
                                <div key={c.id}
                                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                                    onMouseDown={() => { setSelectedClient(c); setSearch(c.name); setShowDropdown(false) }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.membership_type?.name || 'Sin membresía'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selectedClient && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cliente seleccionado:</span>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedClient.name}</span>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 2 }} onClick={() => { setSelectedClient(null); setSearch(''); setMeasurements([]) }}>
                            <FiX size={14} />
                        </button>
                    </div>
                )}
            </div>

            {!selectedClient && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                    <FiUser size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p style={{ fontSize: '1.1rem' }}>Selecciona un cliente para ver su historial de medidas</p>
                </div>
            )}

            {selectedClient && loadingM && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner spinner-lg" />
                </div>
            )}

            {selectedClient && !loadingM && (
                <>
                    {/* Stats cards */}
                    {latest && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                            {[
                                { label: 'Peso actual', value: latest.peso_kg ? `${latest.peso_kg} kg` : '—', delta: diff('peso_kg'), unit: 'kg', invert: true },
                                { label: '% Grasa', value: latest.porcentaje_grasa ? `${latest.porcentaje_grasa}%` : '—', delta: diff('porcentaje_grasa'), invert: true },
                                { label: '% Músculo', value: latest.porcentaje_musculo ? `${latest.porcentaje_musculo}%` : '—', delta: diff('porcentaje_musculo'), invert: false },
                                { label: 'Cintura', value: latest.cintura_cm ? `${latest.cintura_cm} cm` : '—', delta: diff('cintura_cm'), invert: true },
                                { label: 'Total mediciones', value: measurements.length, delta: null },
                            ].map((s, i) => {
                                const dv = s.delta !== null ? parseFloat(s.delta) : null
                                const isGood = dv !== null ? (s.invert ? dv < 0 : dv > 0) : null
                                return (
                                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
                                        {dv !== null && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: '0.8rem', color: isGood ? '#10b981' : '#ef4444' }}>
                                                {isGood ? <FiTrendingDown size={14} /> : <FiTrendingUp size={14} />}
                                                {dv > 0 ? '+' : ''}{dv} vs anterior
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Chart */}
                    {measurements.length > 1 && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 8 }}>
                                <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Evolución</h2>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {chartLines.map(l => (
                                        <button key={l.key}
                                            onClick={() => setActiveChart(prev => prev.includes(l.key) ? prev.filter(k => k !== l.key) : [...prev, l.key])}
                                            style={{ padding: '4px 12px', borderRadius: 20, border: `2px solid ${l.color}`, background: activeChart.includes(l.key) ? l.color : 'transparent', color: activeChart.includes(l.key) ? '#fff' : l.color, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                    <Legend />
                                    {chartLines.filter(l => activeChart.includes(l.key)).map(l => (
                                        <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} name={l.label} strokeWidth={2} dot={{ r: 4 }} connectNulls />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* History table */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Historial ({measurements.length})</h2>
                        </div>
                        {measurements.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                <FiSliders size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>No hay mediciones registradas aún.</p>
                                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }}>
                                    <FiPlus /> Registrar primera medición
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table" style={{ minWidth: 900 }}>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Peso (kg)</th>
                                            <th>% Grasa</th>
                                            <th>% Músculo</th>
                                            <th>Cintura cm</th>
                                            <th>Cadera cm</th>
                                            <th>Brazo D. cm</th>
                                            <th>Pierna D. cm</th>
                                            <th>Fotos</th>
                                            <th>Registró</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...measurements].reverse().map(m => (
                                            <tr key={m.id}>
                                                <td style={{ fontWeight: 600 }}>{m.fecha_medicion}</td>
                                                <td>{m.peso_kg ?? '—'}</td>
                                                <td>{m.porcentaje_grasa != null ? `${m.porcentaje_grasa}%` : '—'}</td>
                                                <td>{m.porcentaje_musculo != null ? `${m.porcentaje_musculo}%` : '—'}</td>
                                                <td>{m.cintura_cm ?? '—'}</td>
                                                <td>{m.cadera_cm ?? '—'}</td>
                                                <td>{m.brazo_derecho_cm ?? '—'}</td>
                                                <td>{m.pierna_derecha_cm ?? '—'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        {m.foto_frente_url && <a href={m.foto_frente_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Frente</a>}
                                                        {m.foto_perfil_url && <a href={m.foto_perfil_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Perfil</a>}
                                                        {m.foto_espalda_url && <a href={m.foto_espalda_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Espalda</a>}
                                                        {!m.foto_frente_url && !m.foto_perfil_url && !m.foto_espalda_url && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{m.registrador_name}</td>
                                                <td>
                                                    <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(m.id)}>
                                                        <FiTrash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modal nueva medición */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 680, width: '95%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Medición — {selectedClient?.name}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-lg)' }}>
                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
                                    {error}
                                </div>
                            )}

                            {/* Fecha */}
                            <div className="form-group">
                                <label className="form-label">Fecha de medición *</label>
                                <input type="date" className="form-input" required value={form.fecha_medicion} onChange={e => setForm(f => ({ ...f, fecha_medicion: e.target.value }))} />
                            </div>

                            {/* Métricas principales */}
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                                    Métricas principales
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Peso (kg) *</label>
                                        <input type="number" step="0.01" className="form-input" required placeholder="70.50" value={form.peso_kg} onChange={e => setForm(f => ({ ...f, peso_kg: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Altura (cm)</label>
                                        <input type="number" step="0.01" className="form-input" placeholder="170.00" value={form.altura_cm} onChange={e => setForm(f => ({ ...f, altura_cm: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">% Grasa corporal</label>
                                        <input type="number" step="0.01" className="form-input" placeholder="18.50" value={form.porcentaje_grasa} onChange={e => setForm(f => ({ ...f, porcentaje_grasa: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">% Músculo</label>
                                        <input type="number" step="0.01" className="form-input" placeholder="42.00" value={form.porcentaje_musculo} onChange={e => setForm(f => ({ ...f, porcentaje_musculo: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Perímetros */}
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                                    Perímetros corporales (cm)
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                                    {[
                                        { field: 'cuello_cm', label: 'Cuello' },
                                        { field: 'pecho_cm', label: 'Pecho' },
                                        { field: 'cintura_cm', label: 'Cintura' },
                                        { field: 'cadera_cm', label: 'Cadera' },
                                        { field: 'brazo_derecho_cm', label: 'Brazo derecho' },
                                        { field: 'pierna_derecha_cm', label: 'Pierna derecha' },
                                    ].map(({ field, label }) => (
                                        <div key={field} className="form-group">
                                            <label className="form-label">{label}</label>
                                            <input type="number" step="0.01" className="form-input" placeholder="—" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fotos */}
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiCamera size={14} /> Fotos de progreso (URLs de Cloudinary)
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                                    {[
                                        { field: 'foto_frente_url', label: 'Frente' },
                                        { field: 'foto_perfil_url', label: 'Perfil' },
                                        { field: 'foto_espalda_url', label: 'Espalda' },
                                    ].map(({ field, label }) => (
                                        <div key={field} className="form-group">
                                            <label className="form-label">{label}</label>
                                            <input type="url" className="form-input" placeholder="https://..." value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notas */}
                            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="form-label">Notas</label>
                                <textarea className="form-input" rows={3} placeholder='Ej: "Se tomó la medida en ayunas"' value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={{ resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</> : <><FiSave /> Guardar medición</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
