import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { FiActivity, FiTrendingDown, FiTrendingUp } from 'react-icons/fi'

const CHART_LINES = [
    { key: 'weight_kg',    label: 'Peso (kg)',  color: '#8b5cf6' },
    { key: 'body_fat_pct', label: '% Grasa',    color: '#10b981' },
    { key: 'muscle_pct',   label: '% Músculo',  color: '#f59e0b' },
    { key: 'waist_cm',     label: 'Cintura (cm)', color: '#06b6d4' },
]

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 32px rgba(0,0,0,0.6)', minWidth: 160
        }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </p>
            {payload.map(entry => (
                <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{entry.name}</span>
                    <span style={{ color: '#fff', fontWeight: 700, marginLeft: 'auto', fontSize: '0.875rem' }}>
                        {entry.value !== null ? entry.value : '—'}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default function ClientMeasurementChart({ measurements }) {
    const [activeLines, setActiveLines] = useState(['weight_kg', 'body_fat_pct'])

    // Necesita al menos 2 puntos para mostrar el gráfico
    if (!measurements || measurements.length < 2) {
        return (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                <FiActivity size={32} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Registra al menos <strong style={{ color: 'var(--primary-400)' }}>2 mediciones</strong> para ver tu gráfico de evolución.
                </p>
            </div>
        )
    }

    const chartData = measurements.map(m => ({
        fecha: m.measurement_date,
        weight_kg:    m.weight_kg    ? Number(m.weight_kg)    : null,
        body_fat_pct: m.body_fat_pct ? Number(m.body_fat_pct) : null,
        muscle_pct:   m.muscle_pct   ? Number(m.muscle_pct)   : null,
        waist_cm:     m.waist_cm     ? Number(m.waist_cm)     : null,
    }))

    // Calcular tendencia del peso
    const weights = measurements.filter(m => m.weight_kg).map(m => Number(m.weight_kg))
    const weightTrend = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null
    const TrendIcon = weightTrend !== null ? (weightTrend <= 0 ? FiTrendingDown : FiTrendingUp) : null
    const trendColor = weightTrend !== null ? (weightTrend <= 0 ? '#10b981' : '#ef4444') : null

    const toggleLine = (key) => {
        setActiveLines(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    return (
        <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiActivity color="var(--primary-400)" /> Evolución de Métricas
                    </h2>
                    {weightTrend !== null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                            <TrendIcon size={14} color={trendColor} />
                            <span style={{ fontSize: '0.8rem', color: trendColor, fontWeight: 600 }}>
                                Peso: {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)} kg desde el inicio
                            </span>
                        </div>
                    )}
                </div>
                {/* Toggles de líneas */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {CHART_LINES.map(l => {
                        const isActive = activeLines.includes(l.key)
                        return (
                            <button
                                key={l.key}
                                onClick={() => toggleLine(l.key)}
                                style={{
                                    padding: '5px 12px', borderRadius: 'var(--radius-full)',
                                    border: `2px solid ${l.color}`,
                                    background: isActive ? l.color : 'transparent',
                                    color: isActive ? '#fff' : l.color,
                                    fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: isActive ? `0 4px 12px ${l.color}40` : 'none'
                                }}
                            >
                                {l.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Chart */}
            <div style={{
                background: 'var(--dark-800)', borderRadius: 'var(--radius-lg)',
                padding: '1.5rem 1rem 0.5rem 0', border: '1px solid var(--dark-700)'
            }}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--dark-600)" vertical={false} />
                        <XAxis
                            dataKey="fecha"
                            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                            axisLine={false} tickLine={false} dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                            axisLine={false} tickLine={false} dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                        />
                        {CHART_LINES.filter(l => activeLines.includes(l.key)).map(l => (
                            <Line
                                key={l.key}
                                type="monotone"
                                dataKey={l.key}
                                stroke={l.color}
                                name={l.label}
                                strokeWidth={3}
                                dot={{ r: 5, strokeWidth: 2, fill: 'var(--dark-900)', stroke: l.color }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: l.color }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
