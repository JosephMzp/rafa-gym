import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FiActivity } from 'react-icons/fi'

const chartLines = [
    { key: 'weight_kg', label: 'Peso (kg)', color: '#8b5cf6' },
    { key: 'body_fat_pct', label: '% Grasa', color: '#ef4444' },
    { key: 'muscle_pct', label: '% Músculo', color: '#10b981' },
    { key: 'waist_cm', label: 'Cintura (cm)', color: '#f59e0b' },
]

export default function MeasurementChart({ measurements }) {
    const [activeChart, setActiveChart] = useState(['weight_kg'])

    if (measurements.length <= 1) return null

    const chartData = measurements.map(m => ({
        fecha: m.measurement_date,
        weight_kg: m.weight_kg ? Number(m.weight_kg) : null,
        body_fat_pct: m.body_fat_pct ? Number(m.body_fat_pct) : null,
        muscle_pct: m.muscle_pct ? Number(m.muscle_pct) : null,
        waist_cm: m.waist_cm ? Number(m.waist_cm) : null,
    }))

    return (
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
    )
}