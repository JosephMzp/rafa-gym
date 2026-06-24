import { useState } from 'react'
import { FiUsers, FiAward, FiUser, FiClock, FiSearch, FiMapPin, FiCheckCircle } from 'react-icons/fi'
import { formatSchedule } from '../../lib/classHelpers'

export default function ClassesEnrollment({
    membershipName, allClasses, user, enrollMsg, enrolling, handleEnroll
}) {
    const [searchQuery, setSearchQuery] = useState('')

    if (membershipName !== 'Fit' && membershipName !== 'Gold') {
        return (
            <div className="glass card" style={{ textAlign: 'center', padding: 'var(--space-xl)', background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)' }}>
                <FiAward size={48} color="var(--text-muted)" style={{ marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>Acceso a Clases Grupales Inactivo</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 450, margin: '0 auto' }}>
                    Tu membresía actual no incluye acceso a clases grupales. Actualiza tu membresía a <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Fit</span> o <span style={{ color: '#f59e0b', fontWeight: 600 }}>Gold</span> para inscribirte.
                </p>
            </div>
        )
    }

    const filteredClasses = (allClasses || []).filter(cls => {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return true
        return (
            cls.name?.toLowerCase().includes(query) ||
            cls.instructor?.toLowerCase().includes(query) ||
            cls.location?.name?.toLowerCase().includes(query) ||
            (cls.days_of_week && cls.days_of_week.some(d => d.toLowerCase().includes(query)))
        )
    })

    return (
        <div className="glass card" style={{ marginBottom: 'var(--space-xl)', background: 'var(--surface-glass)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', margin: 0 }}>
                    <FiUsers color="#8b5cf6" size={22} /> 
                    <span>Clases Grupales Disponibles</span>
                </h3>
                <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 800, 
                    padding: '0.375rem 0.75rem', 
                    borderRadius: 'var(--radius-full)', 
                    background: membershipName === 'Gold' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)', 
                    color: membershipName === 'Gold' ? '#f59e0b' : '#a78bfa', 
                    border: `1px solid ${membershipName === 'Gold' ? '#f59e0b30' : '#8b5cf630'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    letterSpacing: '0.05em'
                }}>
                    <FiAward size={14} /> 
                    {membershipName} — ACCESO INCLUIDO
                </span>
            </div>

            {/* Local Realtime Search Bar */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-lg)' }}>
                <FiSearch size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                    type="text" 
                    placeholder="Buscar por clase, instructor, día o sede..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                        background: 'var(--dark-800)', border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)',
                        fontSize: '0.875rem', transition: 'all 0.2s ease-in-out'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-500)'; e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
                />
            </div>

            {/* Notification alert message */}
            {enrollMsg && (
                <div style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: 'var(--radius-lg)', 
                    marginBottom: 'var(--space-lg)', 
                    background: enrollMsg.startsWith('⚠') ? 'var(--warning-bg)' : 'var(--success-bg)', 
                    color: enrollMsg.startsWith('⚠') ? 'var(--warning)' : 'var(--success)', 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    border: '1px solid ' + (enrollMsg.startsWith('⚠') ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)'),
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {enrollMsg}
                </div>
            )}

            {filteredClasses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--text-muted)' }}>
                    <FiSearch size={32} style={{ marginBottom: 'var(--space-sm)', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.875rem' }}>No se encontraron clases que coincidan con tu búsqueda.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 'var(--space-md)' }}>
                    {filteredClasses.map(cls => {
                        const enrolledCount = (cls.class_enrollments || []).length
                        const alreadyEnrolled = (cls.class_enrollments || []).some(e => e.client_id === user.id)
                        const isFull = enrolledCount >= cls.capacity && !alreadyEnrolled
                        const pct = Math.min(100, Math.round((enrolledCount / cls.capacity) * 100))
                        
                        // Color progression logic
                        const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#eab308' : '#22c55e'

                        return (
                            <div 
                                key={cls.id} 
                                className="glass"
                                style={{ 
                                    borderRadius: 'var(--radius-xl)', 
                                    padding: 'var(--space-md)', 
                                    background: alreadyEnrolled 
                                        ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 100%)' 
                                        : 'var(--dark-800)', 
                                    border: '1px solid ' + (alreadyEnrolled ? '#8b5cf650' : 'var(--border-subtle)'), 
                                    boxShadow: alreadyEnrolled ? '0 4px 20px rgba(139,92,246,0.1)' : 'none',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
                                    opacity: isFull ? 0.65 : 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.borderColor = alreadyEnrolled ? '#8b5cf680' : 'var(--border-strong)'
                                    if (!alreadyEnrolled) e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = ''
                                    e.currentTarget.style.borderColor = alreadyEnrolled ? '#8b5cf650' : 'var(--border-subtle)'
                                    e.currentTarget.style.boxShadow = alreadyEnrolled ? '0 4px 20px rgba(139,92,246,0.1)' : 'none'
                                }}
                            >
                                {/* Glow element for enrolled classes */}
                                {alreadyEnrolled && (
                                    <div style={{
                                        position: 'absolute', top: -30, right: -30,
                                        width: 80, height: 80, borderRadius: '50%',
                                        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                                        pointerEvents: 'none'
                                    }} />
                                )}

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-xs)', marginBottom: 'var(--space-xs)' }}>
                                        <div>
                                            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                                                {cls.name}
                                            </h4>
                                            
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {cls.instructor && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                                        <FiUser size={12} color="var(--primary-400)" />
                                                        {cls.instructor}
                                                    </span>
                                                )}
                                                {cls.instructor && <span>•</span>}
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                                    <FiMapPin size={12} />
                                                    {cls.location?.name}
                                                </span>
                                            </div>
                                        </div>

                                        {alreadyEnrolled && (
                                            <span style={{ 
                                                fontSize: '0.65rem', 
                                                fontWeight: 800, 
                                                padding: '2px 8px', 
                                                borderRadius: 'var(--radius-full)', 
                                                background: 'rgba(139,92,246,0.2)', 
                                                color: '#a78bfa', 
                                                whiteSpace: 'nowrap',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 3,
                                                border: '1px solid rgba(139,92,246,0.3)'
                                            }}>
                                                <FiCheckCircle size={10} /> Inscrito
                                            </span>
                                        )}
                                    </div>

                                    {/* Schedule */}
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'var(--text-secondary)', 
                                        marginBottom: 'var(--space-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-xs)',
                                        fontWeight: 500
                                    }}>
                                        <FiClock size={13} color="#8b5cf6" />
                                        <span>{formatSchedule(cls.days_of_week, cls.start_time, cls.end_time)}</span>
                                    </div>
                                </div>

                                <div>
                                    {/* Occupancy Indicator */}
                                    <div style={{ marginBottom: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                            <span>Capacidad de la clase</span>
                                            <span style={{ color: barColor, fontWeight: 700 }}>
                                                {enrolledCount} / {cls.capacity} cupos
                                            </span>
                                        </div>
                                        <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--dark-500)', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: pct + '%', 
                                                background: `linear-gradient(90deg, ${barColor}80, ${barColor})`, 
                                                borderRadius: 'var(--radius-full)', 
                                                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                                            }} />
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <button 
                                        onClick={() => handleEnroll(cls)} 
                                        disabled={isFull || enrolling}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.5rem 1rem', 
                                            borderRadius: 'var(--radius-md)', 
                                            fontWeight: 700, 
                                            fontSize: '0.8125rem', 
                                            cursor: isFull ? 'not-allowed' : 'pointer', 
                                            transition: 'all 0.2s ease', 
                                            background: isFull 
                                                ? 'var(--dark-600)' 
                                                : alreadyEnrolled 
                                                    ? 'rgba(239,68,68,0.15)' 
                                                    : 'rgba(139,92,246,0.18)',  
                                            color: isFull 
                                                ? 'var(--text-muted)' 
                                                : alreadyEnrolled 
                                                    ? 'var(--danger)' 
                                                    : '#a78bfa',
                                            border: isFull
                                                ? 'none'
                                                : alreadyEnrolled
                                                    ? '1px solid rgba(239,68,68,0.2)'
                                                    : '1px solid rgba(139,92,246,0.2)'
                                        }}
                                        onMouseEnter={e => {
                                            if (isFull) return
                                            if (alreadyEnrolled) {
                                                e.currentTarget.style.background = 'var(--danger)'
                                                e.currentTarget.style.color = 'white'
                                                e.currentTarget.style.borderColor = 'var(--danger)'
                                            } else {
                                                e.currentTarget.style.background = '#8b5cf6'
                                                e.currentTarget.style.color = 'white'
                                                e.currentTarget.style.borderColor = '#8b5cf6'
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (isFull) return
                                            if (alreadyEnrolled) {
                                                e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                                                e.currentTarget.style.color = 'var(--danger)'
                                                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
                                            } else {
                                                e.currentTarget.style.background = 'rgba(139,92,246,0.18)'
                                                e.currentTarget.style.color = '#a78bfa'
                                                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'
                                            }
                                        }}
                                    >
                                        {isFull ? 'Clase Completa' : alreadyEnrolled ? '✕ Cancelar Matrícula' : '+ Inscribirme Gratis'}
                                    </button>
                                </div>

                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}