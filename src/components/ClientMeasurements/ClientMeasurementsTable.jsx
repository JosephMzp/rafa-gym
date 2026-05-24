import { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiImage, FiMaximize2 } from 'react-icons/fi'

function DeltaBadge({ current, prev, unit = '', lowerIsBetter = false }) {
    if (current == null || prev == null) return null
    const delta = Number(current) - Number(prev)
    if (delta === 0) return null
    const positive = lowerIsBetter ? delta < 0 : delta > 0
    const color = positive ? '#10b981' : '#ef4444'
    const arrow = delta < 0 ? '↓' : '↑'
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            fontSize: '0.68rem', color, fontWeight: 700, marginLeft: 4
        }}>
            {arrow}{Math.abs(delta).toFixed(1)}{unit}
        </span>
    )
}

function PhotoThumb({ url, label }) {
    const [lightbox, setLightbox] = useState(false)

    if (!url) return null

    return (
        <>
            <button
                type="button"
                title={`Ver ${label}`}
                onClick={() => setLightbox(true)}
                style={{
                    position: 'relative', width: '100%',
                    aspectRatio: '3/4', border: 'none', padding: 0,
                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    cursor: 'pointer', background: 'var(--dark-700)',
                    border: '2px solid var(--border-subtle)',
                    transition: 'border-color 0.2s, transform 0.15s',
                    display: 'block'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary-500)'
                    e.currentTarget.style.transform = 'scale(1.03)'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    e.currentTarget.style.transform = 'scale(1)'
                }}
            >
                <img
                    src={url}
                    alt={label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Overlay en hover */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(139,92,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                    <FiMaximize2 size={20} color="#fff" />
                </div>
                {/* Label inferior */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                    padding: '1rem 0.5rem 0.4rem',
                    fontSize: '0.68rem', color: '#fff', fontWeight: 700, textAlign: 'center'
                }}>
                    {label}
                </div>
            </button>

            {lightbox && (
                <div
                    onClick={() => setLightbox(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-out'
                    }}
                >
                    <img
                        src={url}
                        alt={label}
                        style={{
                            maxWidth: '90vw', maxHeight: '90vh',
                            objectFit: 'contain', borderRadius: 12,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
                        }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightbox(false)}
                        style={{
                            position: 'fixed', top: 20, right: 20,
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            borderRadius: '50%', width: 44, height: 44,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#fff', fontSize: '1.2rem',
                            backdropFilter: 'blur(8px)', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        ✕
                    </button>
                    <div style={{
                        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
                        color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 600,
                        background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: 20,
                        backdropFilter: 'blur(4px)'
                    }}>
                        {label}
                    </div>
                </div>
            )}
        </>
    )
}

function PhotoIndicator({ front, side, back }) {
    const count = [front, side, back].filter(Boolean).length
    if (!count) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FiImage size={13} color="var(--primary-400)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                {count} foto{count > 1 ? 's' : ''}
            </span>
        </div>
    )
}

export default function ClientMeasurementsTable({ measurements }) {
    const [expanded, setExpanded] = useState(null)

    const sorted = [...measurements].sort((a, b) =>
        new Date(b.measurement_date) - new Date(a.measurement_date)
    )

    if (!measurements.length) {
        return (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <FiImage size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Aún no tienes medidas registradas. ¡Registra tu primer pesaje!
                </p>
            </div>
        )
    }

    return (
        <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem',
                marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 10
            }}>
                📋 Historial de Medidas
                <span style={{
                    background: 'var(--dark-700)', padding: '2px 10px',
                    borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)'
                }}>
                    {measurements.length}
                </span>
            </h2>

            <div className="table-container" style={{ marginBottom: 0 }}>
                <table className="table" style={{ fontSize: '0.875rem' }}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Peso (kg)</th>
                            <th>Altura (cm)</th>
                            <th>% Grasa</th>
                            <th>% Músculo</th>
                            <th>Cintura (cm)</th>
                            <th style={{ textAlign: 'center' }}>Fotos</th>
                            <th>Registrado por</th>
                            <th style={{ textAlign: 'center' }}>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((m, idx) => {
                            const prev = sorted[idx + 1]
                            const isOpen = expanded === m.id
                            const hasPhotos = !!(m.photo_front_url || m.photo_side_url || m.photo_back_url)

                            return (
                                <>
                                    <tr
                                        key={m.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setExpanded(isOpen ? null : m.id)}
                                    >
                                        <td style={{ fontWeight: 600 }}>
                                            {m.measurement_date}
                                            {idx === 0 && (
                                                <span className="badge" style={{
                                                    background: 'rgba(139,92,246,0.15)',
                                                    color: 'var(--primary-400)', marginLeft: 6, fontSize: '0.65rem'
                                                }}>
                                                    Último
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                                            {m.weight_kg != null ? Number(m.weight_kg).toFixed(1) : '—'}
                                            {prev && <DeltaBadge current={m.weight_kg} prev={prev.weight_kg} unit=" kg" lowerIsBetter={false} />}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {m.height_cm != null ? Number(m.height_cm).toFixed(1) : '—'}
                                        </td>
                                        <td style={{ color: '#10b981' }}>
                                            {m.body_fat_pct != null ? `${Number(m.body_fat_pct).toFixed(1)}%` : '—'}
                                            {prev && <DeltaBadge current={m.body_fat_pct} prev={prev.body_fat_pct} unit="%" lowerIsBetter={true} />}
                                        </td>
                                        <td style={{ color: '#f59e0b' }}>
                                            {m.muscle_pct != null ? `${Number(m.muscle_pct).toFixed(1)}%` : '—'}
                                            {prev && <DeltaBadge current={m.muscle_pct} prev={prev.muscle_pct} unit="%" lowerIsBetter={false} />}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            {m.waist_cm != null ? Number(m.waist_cm).toFixed(1) : '—'}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <PhotoIndicator
                                                front={m.photo_front_url}
                                                side={m.photo_side_url}
                                                back={m.photo_back_url}
                                            />
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                                {m.registrador_name || 'Yo mismo'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                style={{
                                                    width: 28, height: 28, background: 'var(--dark-700)',
                                                    color: hasPhotos ? 'var(--primary-400)' : 'var(--text-muted)'
                                                }}
                                                onClick={e => { e.stopPropagation(); setExpanded(isOpen ? null : m.id) }}
                                                title="Ver perímetros y fotos"
                                            >
                                                {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* ── Panel expandible ── */}
                                    {isOpen && (
                                        <tr key={`${m.id}-detail`}>
                                            <td colSpan={9} style={{ background: 'var(--dark-800)', padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                                    {/* Perímetros corporales */}
                                                    <div>
                                                        <div style={{
                                                            fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                                                            letterSpacing: '0.06em', color: 'var(--text-muted)',
                                                            marginBottom: 10
                                                        }}>
                                                            Perímetros corporales
                                                        </div>
                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                            gap: '0.625rem'
                                                        }}>
                                                            {[
                                                                { label: 'Cuello', value: m.neck_cm },
                                                                { label: 'Pecho', value: m.chest_cm },
                                                                { label: 'Cadera', value: m.hip_cm },
                                                                { label: 'Brazo (Der)', value: m.right_arm_cm },
                                                                { label: 'Pierna (Der)', value: m.right_leg_cm },
                                                            ].map(({ label, value }) => (
                                                                <div key={label} style={{
                                                                    background: 'var(--dark-700)',
                                                                    borderRadius: 'var(--radius-md)',
                                                                    padding: '0.6rem 0.875rem',
                                                                    border: '1px solid var(--border-subtle)'
                                                                }}>
                                                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                                                                        {label}
                                                                    </div>
                                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                                        {value != null ? `${Number(value).toFixed(1)} cm` : '—'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Fotos de progreso */}
                                                    {hasPhotos && (
                                                        <div>
                                                            <div style={{
                                                                fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                                                                letterSpacing: '0.06em', color: 'var(--primary-400)',
                                                                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6
                                                            }}>
                                                                <FiImage size={13} /> Fotos de progreso
                                                            </div>
                                                            <div style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 160px))',
                                                                gap: '0.875rem'
                                                            }}>
                                                                {m.photo_front_url && (
                                                                    <PhotoThumb url={m.photo_front_url} label="Frontal" />
                                                                )}
                                                                {m.photo_side_url && (
                                                                    <PhotoThumb url={m.photo_side_url} label="Perfil" />
                                                                )}
                                                                {m.photo_back_url && (
                                                                    <PhotoThumb url={m.photo_back_url} label="Espalda" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Notas */}
                                                    {m.notes && (
                                                        <div style={{
                                                            background: 'var(--dark-700)',
                                                            borderRadius: 'var(--radius-md)',
                                                            padding: '0.75rem 1rem',
                                                            border: '1px solid var(--border-subtle)'
                                                        }}>
                                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                Notas
                                                            </div>
                                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                                {m.notes}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
