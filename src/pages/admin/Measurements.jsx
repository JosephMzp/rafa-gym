import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getClients } from '../../lib/services'
import { getClientMeasurements, createMeasurement, deleteMeasurement } from '../../lib/services'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
    FiPlus, FiTrash2, FiSliders, FiUser, FiTrendingDown, FiTrendingUp,
    FiChevronDown, FiX, FiSave, FiCamera, FiSearch, FiActivity, FiCalendar, FiImage
} from 'react-icons/fi'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

async function uploadToCloudinary(file) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'rafagym/measurements')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.secure_url
}

const ImageUploadField = ({ label, url, onUpload, onRemove }) => {
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef(null)

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const secureUrl = await uploadToCloudinary(file)
            onUpload(secureUrl)
        } catch (err) {
            console.error("Error uploading to cloudinary", err)
            alert("Error al subir la imagen")
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    return (
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">{label}</label>
            {url ? (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px solid var(--primary-500)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={onRemove} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#ef4444'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.9)'}>
                        <FiX size={14} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'wait' : 'pointer', background: 'var(--dark-800)', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.background = 'var(--dark-700)' }}
                    onMouseLeave={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--dark-800)' }}
                >
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                            <div className="spinner spinner-md" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-400)' }}>Subiendo...</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <FiCamera size={20} color="var(--primary-400)" />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Añadir foto</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG</span>
                        </>
                    )}
                </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
    )
}

const EMPTY_FORM = {
    measurement_date: new Date().toISOString().split('T')[0],
    weight_kg: '', height_cm: '', body_fat_pct: '', muscle_pct: '',
    neck_cm: '', chest_cm: '', waist_cm: '', hip_cm: '',
    right_arm_cm: '', right_leg_cm: '',
    photo_front_url: '', photo_side_url: '', photo_back_url: '',
    notes: ''
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
    const [activeChart, setActiveChart] = useState(['weight_kg'])

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
            if (user?.isStaff) payload.recorded_by = user.id
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
        { key: 'weight_kg', label: 'Peso (kg)', color: '#8b5cf6' },
        { key: 'body_fat_pct', label: '% Grasa', color: '#ef4444' },
        { key: 'muscle_pct', label: '% Músculo', color: '#10b981' },
        { key: 'waist_cm', label: 'Cintura (cm)', color: '#f59e0b' },
    ]

    const chartData = measurements.map(m => ({
        fecha: m.measurement_date,
        weight_kg: m.weight_kg ? Number(m.weight_kg) : null,
        body_fat_pct: m.body_fat_pct ? Number(m.body_fat_pct) : null,
        muscle_pct: m.muscle_pct ? Number(m.muscle_pct) : null,
        waist_cm: m.waist_cm ? Number(m.waist_cm) : null,
    }))

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
                    <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700, boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }} onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }}>
                        <FiPlus size={18} /> Nueva Medición
                    </button>
                )}
            </div>

            {/* Client selector */}
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
                                    {c.photo_url ? (
                                        <img src={c.photo_url} alt={c.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }} />
                                    ) : (
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--primary-400)', flexShrink: 0, border: '1px solid rgba(139,92,246,0.3)' }}>
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
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
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--dark-800)', padding: '10px 16px', borderRadius: 'var(--radius-md)', display: 'inline-flex', border: '1px solid var(--dark-700)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cliente actual:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {selectedClient.photo_url ? (
                                <img src={selectedClient.photo_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : null}
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
                    {/* Stats cards */}
                    {latest && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                            {[
                                { label: 'Peso actual', value: latest.weight_kg ? `${latest.weight_kg} kg` : '—', delta: diff('weight_kg'), invert: true, icon: <FiActivity />, color: '#8b5cf6' },
                                { label: '% Grasa', value: latest.body_fat_pct ? `${latest.body_fat_pct}%` : '—', delta: diff('body_fat_pct'), invert: true, icon: <FiTrendingDown />, color: '#ef4444' },
                                { label: '% Músculo', value: latest.muscle_pct ? `${latest.muscle_pct}%` : '—', delta: diff('muscle_pct'), invert: false, icon: <FiTrendingUp />, color: '#10b981' },
                                { label: 'Cintura', value: latest.waist_cm ? `${latest.waist_cm} cm` : '—', delta: diff('waist_cm'), invert: true, icon: <FiSliders />, color: '#f59e0b' },
                                { label: 'Total mediciones', value: measurements.length, delta: null, icon: <FiCalendar />, color: '#3b82f6' },
                            ].map((s, i) => {
                                const dv = s.delta !== null ? parseFloat(s.delta) : null
                                const isGood = dv !== null ? (s.invert ? dv < 0 : dv > 0) : null
                                return (
                                    <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden', padding: '1.25rem' }}>
                                        <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1, color: s.color, transform: 'scale(3)' }}>
                                            {s.icon}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '8px', background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {s.icon}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                        </div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: s.delta !== null ? 4 : 0 }}>{s.value}</div>
                                        {dv !== null && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600, color: isGood ? 'var(--success)' : (dv === 0 ? 'var(--text-muted)' : 'var(--danger)'), marginTop: 8 }}>
                                                {dv !== 0 ? (isGood ? <FiTrendingDown size={14} /> : <FiTrendingUp size={14} />) : <span style={{ opacity: 0.5 }}>—</span>}
                                                <span style={{ background: isGood ? 'rgba(16,185,129,0.15)' : (dv === 0 ? 'transparent' : 'rgba(239,68,68,0.15)'), padding: '2px 6px', borderRadius: 4 }}>
                                                    {dv > 0 ? '+' : ''}{dv} vs anterior
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Chart */}
                    {measurements.length > 1 && (
                        <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 12 }}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiActivity color="var(--primary-400)" /> Evolución de Métricas
                                </h2>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {chartLines.map(l => (
                                        <button key={l.key}
                                            onClick={() => setActiveChart(prev => prev.includes(l.key) ? prev.filter(k => k !== l.key) : [...prev, l.key])}
                                            style={{
                                                padding: '6px 14px', borderRadius: 'var(--radius-full)', border: `2px solid ${l.color}`,
                                                background: activeChart.includes(l.key) ? l.color : 'transparent',
                                                color: activeChart.includes(l.key) ? '#fff' : l.color,
                                                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                                                boxShadow: activeChart.includes(l.key) ? `0 4px 12px ${l.color}40` : 'none'
                                            }}>
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: 'var(--dark-800)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 1rem 0.5rem 0', border: '1px solid var(--dark-700)' }}>
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-600)" vertical={false} />
                                        <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dx={-10} />
                                        <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid var(--border-subtle)', borderRadius: 12, color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} itemStyle={{ fontWeight: 700 }} />
                                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                                        {chartLines.filter(l => activeChart.includes(l.key)).map(l => (
                                            <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} name={l.label} strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: 'var(--dark-900)' }} activeDot={{ r: 8, strokeWidth: 0 }} connectNulls />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* History table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiCalendar color="var(--primary-400)" /> Historial de Registros
                                <span style={{ background: 'var(--dark-700)', padding: '2px 10px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{measurements.length}</span>
                            </h2>
                        </div>
                        {measurements.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                                    <FiSliders size={30} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                                <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>No hay mediciones registradas aún para este cliente.</p>
                                <button className="btn btn-primary" style={{ marginTop: 24, borderRadius: 'var(--radius-full)' }} onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }}>
                                    <FiPlus /> Registrar la primera medición
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table" style={{ minWidth: 1000, margin: 0, border: 'none' }}>
                                    <thead style={{ background: 'var(--dark-800)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem 1.5rem' }}>Fecha</th>
                                            <th>Peso</th>
                                            <th>Grasa</th>
                                            <th>Músculo</th>
                                            <th>Cintura</th>
                                            <th>Cadera</th>
                                            <th>Brazos/Piernas</th>
                                            <th>Fotos</th>
                                            <th>Registró</th>
                                            <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...measurements].reverse().map((m, i) => (
                                            <tr key={m.id} style={{ borderBottom: i === measurements.length - 1 ? 'none' : '1px solid var(--border-subtle)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--dark-800)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        {new Date(m.measurement_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td>
                                                    {m.weight_kg ? <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{m.weight_kg} kg</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                                <td>{m.body_fat_pct != null ? <span style={{ fontWeight: 600, color: '#ef4444' }}>{m.body_fat_pct}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>{m.muscle_pct != null ? <span style={{ fontWeight: 600, color: '#10b981' }}>{m.muscle_pct}%</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>{m.waist_cm ? `${m.waist_cm} cm` : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>{m.hip_cm ? `${m.hip_cm} cm` : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        <span>B: {m.right_arm_cm ? `${m.right_arm_cm}cm` : '—'}</span>
                                                        <span>P: {m.right_leg_cm ? `${m.right_leg_cm}cm` : '—'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        {m.photo_front_url && <a href={m.photo_front_url} target="_blank" rel="noreferrer" title="Frente" style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)', transition: 'background 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-500)'; e.currentTarget.style.color = 'white' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark-700)'; e.currentTarget.style.color = 'var(--primary-400)' }}><FiImage size={14} /></a>}
                                                        {m.photo_side_url && <a href={m.photo_side_url} target="_blank" rel="noreferrer" title="Perfil" style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)', transition: 'background 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-500)'; e.currentTarget.style.color = 'white' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark-700)'; e.currentTarget.style.color = 'var(--primary-400)' }}><FiImage size={14} /></a>}
                                                        {m.photo_back_url && <a href={m.photo_back_url} target="_blank" rel="noreferrer" title="Espalda" style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--dark-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)', transition: 'background 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-500)'; e.currentTarget.style.color = 'white' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark-700)'; e.currentTarget.style.color = 'var(--primary-400)' }}><FiImage size={14} /></a>}
                                                        {!m.photo_front_url && !m.photo_side_url && !m.photo_back_url && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        <FiUser size={10} />
                                                        {m.registrador_name || 'Sistema'}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                                    <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)', width: 32, height: 32, background: 'rgba(239,68,68,0.1)' }} onClick={() => handleDelete(m.id)} title="Eliminar registro">
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
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal glass" style={{ maxWidth: 740, width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0, border: '1px solid var(--border-subtle)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Nueva Medición</h2>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FiUser size={12} /> Cliente: <span style={{ color: 'var(--primary-400)', fontWeight: 700 }}>{selectedClient?.name}</span>
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-icon" style={{ background: 'var(--dark-700)', width: 36, height: 36 }} onClick={() => setShowModal(false)}>
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: '#f87171', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                                    <FiX size={16} /> {error}
                                </div>
                            )}

                            {/* Fecha */}
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiCalendar size={14} /> Fecha de medición *</label>
                                <input type="date" className="form-input" required value={form.measurement_date} onChange={e => setForm(f => ({ ...f, measurement_date: e.target.value }))} style={{ maxWidth: 220 }} />
                            </div>

                            {/* Métricas principales */}
                            <div style={{ marginBottom: '2rem', background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiActivity size={16} /> Métricas principales
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Peso (kg) *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" step="0.01" className="form-input" required placeholder="70.50" value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} style={{ paddingRight: 40 }} />
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>kg</span>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Altura (cm)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" step="0.01" className="form-input" placeholder="170.0" value={form.height_cm} onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))} style={{ paddingRight: 40 }} />
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>cm</span>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">% Grasa</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" step="0.01" className="form-input" placeholder="18.5" value={form.body_fat_pct} onChange={e => setForm(f => ({ ...f, body_fat_pct: e.target.value }))} style={{ paddingRight: 35 }} />
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>%</span>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">% Músculo</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" step="0.01" className="form-input" placeholder="42.0" value={form.muscle_pct} onChange={e => setForm(f => ({ ...f, muscle_pct: e.target.value }))} style={{ paddingRight: 35 }} />
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Perímetros */}
                            <div style={{ marginBottom: '2rem', background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiSliders size={16} /> Perímetros corporales (cm)
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
                                    {[
                                        { field: 'neck_cm', label: 'Cuello' },
                                        { field: 'chest_cm', label: 'Pecho' },
                                        { field: 'waist_cm', label: 'Cintura' },
                                        { field: 'hip_cm', label: 'Cadera' },
                                        { field: 'right_arm_cm', label: 'Brazo (Der)' },
                                        { field: 'right_leg_cm', label: 'Pierna (Der)' },
                                    ].map(({ field, label }) => (
                                        <div key={field} className="form-group" style={{ margin: 0 }}>
                                            <label className="form-label">{label}</label>
                                            <input type="number" step="0.01" className="form-input" placeholder="—" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fotos (Cloudinary Uploaders) */}
                            <div style={{ marginBottom: '2rem', background: 'var(--dark-800)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiImage size={16} /> Fotos de progreso
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                                    <ImageUploadField
                                        label="Foto Frontal"
                                        url={form.photo_front_url}
                                        onUpload={(url) => setForm(f => ({ ...f, photo_front_url: url }))}
                                        onRemove={() => setForm(f => ({ ...f, photo_front_url: '' }))}
                                    />
                                    <ImageUploadField
                                        label="Foto Perfil"
                                        url={form.photo_side_url}
                                        onUpload={(url) => setForm(f => ({ ...f, photo_side_url: url }))}
                                        onRemove={() => setForm(f => ({ ...f, photo_side_url: '' }))}
                                    />
                                    <ImageUploadField
                                        label="Foto Espalda"
                                        url={form.photo_back_url}
                                        onUpload={(url) => setForm(f => ({ ...f, photo_back_url: url }))}
                                        onRemove={() => setForm(f => ({ ...f, photo_back_url: '' }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label className="form-label">Notas Adicionales</label>
                                <textarea className="form-input" rows={3} placeholder='Ej: "Se tomó la medida en ayunas, después del entrenamiento..."' value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem 1.5rem', fontWeight: 700, minWidth: 160, display: 'flex', justifyContent: 'center', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}>
                                    {saving ? <><div className="spinner spinner-sm" style={{ marginRight: 8 }} /> Guardando...</> : <><FiSave style={{ marginRight: 8 }} /> Guardar medición</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

