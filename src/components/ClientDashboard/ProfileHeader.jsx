import { useRef } from 'react'
import { FiCheck, FiMapPin, FiCamera, FiAward } from 'react-icons/fi'

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_face,q_auto,f_auto/`)
}

export default function ProfileHeader({ user, location, membership, preview, uploading, handlePhoto }) {
    const fileRef = useRef(null)

    const membershipName = membership?.membership_type?.name || 'Sin membresía'
    const membershipColor = membershipName === 'Gold' ? '#f59e0b' : membershipName === 'Fit' ? '#8b5cf6' : '#10b981'
    const photoDisplay = preview || (user?.photo_url ? optimizeUrl(user.photo_url, 200, 200) : null)

    const daysLeft = membership?.end_date
        ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => { if (!uploading && fileRef.current) fileRef.current.click() }}
                        style={{
                            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', cursor: uploading ? 'wait' : 'pointer',
                            background: photoDisplay ? `url(${photoDisplay}) center/cover no-repeat` : `linear-gradient(135deg, ${membershipColor}, var(--primary-700))`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${membershipColor}`,
                            boxShadow: `0 4px 20px ${membershipColor}40`, position: 'relative'
                        }}
                    >
                        {!photoDisplay && !uploading && (
                            <span style={{ fontSize: '2rem', color: 'white', fontWeight: 700 }}>
                                {(user?.name || 'C').charAt(0).toUpperCase()}
                            </span>
                        )}
                        {uploading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner" style={{ width: 24, height: 24 }}></div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => { if (!uploading && fileRef.current) fileRef.current.click() }}
                        style={{
                            position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%',
                            background: membershipColor, border: '2px solid var(--dark-700)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                    >
                        <FiCamera size={14} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhoto(e.target.files[0])} />
                </div>

                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
                        Hola, <span className="gradient-text">{user?.name}</span> <FiCheck size={22} style={{ display: 'inline', color: 'var(--primary-400)' }} />
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>Aquí está el resumen de tu cuenta</p>
                    {location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            <FiMapPin size={12} /> {location.name}
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-xl)', background: `linear-gradient(135deg, ${membershipColor}15, ${membershipColor}05)`, borderColor: `${membershipColor}30`, borderLeft: `4px solid ${membershipColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiAward color={membershipColor} size={22} />
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: membershipColor }}>
                                Membresía {membershipName}
                            </span>
                        </div>
                        {membership ? (
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                Desde: {membership.start_date} • Hasta: {membership.end_date}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No tienes una membresía activa</p>
                        )}
                    </div>
                    {membership && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: daysLeft <= 7 ? 'var(--danger)' : daysLeft <= 15 ? 'var(--warning)' : 'var(--success)', lineHeight: 1 }}>
                                {daysLeft}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>días restantes</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}