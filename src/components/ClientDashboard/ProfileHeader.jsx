import { useRef, useState } from 'react'
import { FiCheck, FiMapPin, FiCamera, FiAward, FiShield, FiCalendar, FiActivity } from 'react-icons/fi'

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_face,q_auto,f_auto/`)
}

export default function ProfileHeader({ user, location, membership, preview, uploading, handlePhoto }) {
    const fileRef = useRef(null)
    const [avatarHover, setAvatarHover] = useState(false)

    const membershipName = membership?.membership_type?.name || 'Sin membresía'
    
    const membershipColors = {
        'Gold': {
            primary: '#f59e0b',
            gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.04) 100%)',
            glow: 'rgba(245, 158, 11, 0.3)',
            border: 'rgba(245, 158, 11, 0.25)',
            badgeText: 'GOLD MEMBER',
            accentGlow: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)'
        },
        'Fit': {
            primary: '#8b5cf6',
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.04) 100%)',
            glow: 'rgba(139, 92, 246, 0.3)',
            border: 'rgba(139, 92, 246, 0.25)',
            badgeText: 'FIT MEMBER',
            accentGlow: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)'
        }
    }
    
    const defaultColors = {
        primary: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.04) 100%)',
        glow: 'rgba(16, 185, 129, 0.3)',
        border: 'rgba(16, 185, 129, 0.25)',
        badgeText: 'MEMBER',
        accentGlow: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)'
    }
    
    const colors = membershipColors[membershipName] || defaultColors
    const photoDisplay = preview || (user?.photo_url ? optimizeUrl(user.photo_url, 200, 200) : null)

    const daysLeft = membership?.end_date
        ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0

    const daysColor = daysLeft <= 7 ? 'var(--danger)' : daysLeft <= 15 ? 'var(--warning)' : 'var(--success)'

    return (
        <div 
            className="glass" 
            style={{
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-xl)',
                marginBottom: 'var(--space-2xl)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-xl)',
                background: 'var(--surface-glass)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-xl)',
                position: 'relative',
                overflow: 'hidden',
                alignItems: 'center'
            }}
        >
            {/* Background glowing shapes */}
            <div style={{
                position: 'absolute', top: -100, left: -100,
                width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: -100, right: -100,
                width: 300, height: 300, borderRadius: '50%',
                background: colors.accentGlow,
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* Columna izquierda: Información del Atleta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', zIndex: 1, flexWrap: 'wrap' }}>
                <div 
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setAvatarHover(true)}
                    onMouseLeave={() => setAvatarHover(false)}
                >
                    {/* Ring aura */}
                    <div style={{
                        position: 'absolute', inset: -4, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.primary}, var(--primary-500))`,
                        opacity: avatarHover ? 0.8 : 0.4,
                        filter: avatarHover ? 'blur(4px)' : 'none',
                        transition: 'opacity 0.3s, filter 0.3s',
                        zIndex: -1
                    }} />

                    {/* Avatar Container */}
                    <div
                        onClick={() => { if (!uploading && fileRef.current) fileRef.current.click() }}
                        style={{
                            width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', cursor: uploading ? 'wait' : 'pointer',
                            background: photoDisplay ? `url(${photoDisplay}) center/cover no-repeat` : `linear-gradient(135deg, ${colors.primary}, var(--primary-700))`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--dark-800)',
                            position: 'relative', transition: 'transform 0.3s'
                        }}
                    >
                        {!photoDisplay && !uploading && (
                            <span style={{ fontSize: '2.25rem', color: 'white', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                                {(user?.name || 'C').charAt(0).toUpperCase()}
                            </span>
                        )}
                        {uploading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="spinner" style={{ width: 28, height: 28 }}></div>
                            </div>
                        )}
                        {/* Hover Overlay */}
                        <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.4)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            opacity: avatarHover && !uploading ? 1 : 0, transition: 'opacity 0.2s', color: 'white',
                            fontSize: '0.7rem', fontWeight: 700, gap: 2
                        }}>
                            <FiCamera size={18} />
                            <span>CAMBIAR</span>
                        </div>
                    </div>

                    {/* Verified/Active Badge Floating */}
                    <div style={{
                        position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%',
                        background: colors.primary, border: '2px solid var(--dark-800)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)'
                    }}>
                        <FiShield size={14} />
                    </div>

                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhoto(e.target.files[0])} />
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                            background: `${colors.primary}20`, color: colors.primary,
                            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em',
                            textTransform: 'uppercase', display: 'inline-block'
                        }}>
                            {colors.badgeText}
                        </span>
                        <span style={{
                            padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                            background: membership ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: membership ? 'var(--success)' : 'var(--danger)',
                            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em',
                            textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 3
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: membership ? 'var(--success)' : 'var(--danger)',
                                display: 'inline-block',
                                animation: membership ? 'pulse 2s infinite' : 'none'
                            }} />
                            {membership ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, marginTop: 'var(--space-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                        ¡Hola, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
                        <FiCheck size={20} style={{ color: 'var(--primary-400)', background: 'var(--primary-100)', borderRadius: '50%', padding: 2, display: 'inline-flex', flexShrink: 0 }} />
                    </h1>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1px' }}>
                        Es un buen día para entrenar duro.
                    </p>

                    {location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'var(--space-sm)', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            <FiMapPin size={13} color="var(--primary-400)" />
                            <span>Sede {location.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Columna derecha: Estado de Membresía */}
            <div style={{ zIndex: 1 }}>
                <div 
                    className="glass" 
                    style={{
                        background: colors.gradient,
                        borderColor: colors.border,
                        borderLeft: `4px solid ${colors.primary}`,
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-lg)',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: `0 8px 32px ${colors.primary}08`,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        cursor: 'default'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = `0 12px 40px ${colors.primary}15`
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = ''
                        e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}08`
                    }}
                >
                    {/* Glowing effect inside card */}
                    <div style={{
                        position: 'absolute', top: -20, right: -20,
                        width: 100, height: 100, borderRadius: '50%',
                        background: `radial-gradient(circle, ${colors.primary}25 0%, transparent 70%)`,
                        pointerEvents: 'none'
                    }} />

                    {/* Pulse animation keyframes only */}
                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(0.9); opacity: 0.6; }
                            50% { transform: scale(1.15); opacity: 1; }
                            100% { transform: scale(0.9); opacity: 0.6; }
                        }
                    `}</style>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                                <FiAward size={18} color={colors.primary} />
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: colors.primary, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                                    {membershipName}
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fecha de Vencimiento</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FiCalendar size={14} color={colors.primary} />
                                    {membership?.end_date ? membership.end_date : 'Sin membresía activa'}
                                </span>
                            </div>
                        </div>

                        {membership ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)', fontSize: '2.5rem',
                                    fontWeight: 900, lineHeight: 1.1,
                                    color: daysColor, textShadow: `0 0 10px ${daysColor}25`
                                }}>
                                    {daysLeft}
                                </div>
                                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                                    Días Restantes
                                </div>
                                {daysLeft <= 7 && (
                                    <span style={{ 
                                        display: 'inline-block', marginTop: 'var(--space-xs)', fontSize: '0.65rem', 
                                        color: 'var(--danger)', fontWeight: 800, background: 'var(--danger-bg)',
                                        padding: '2px 8px', borderRadius: 'var(--radius-sm)'
                                    }}>
                                        ¡RENUEVA PRONTO!
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                                <FiActivity size={32} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                                <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 6, textAlign: 'center' }}>
                                    Sin Membresía
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}