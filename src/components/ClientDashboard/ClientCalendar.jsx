import { useState } from 'react'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiGrid, FiList } from 'react-icons/fi'
import { getDayFullNames, fmtTime } from '../../lib/classHelpers'

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ClientCalendar({ classes, calView, setCalendarView, calendarMonth, setCalendarMonth }) {
    const today = new Date()
    const calDate = calendarMonth || new Date(today.getFullYear(), today.getMonth(), 1)
    const year = calDate.getFullYear()
    const month = calDate.getMonth()
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    const getDow = (dt) => { const js = dt.getDay(); return js === 0 ? 6 : js - 1 }

    // Returns time in minutes for sorting (uses start_time field directly)
    const getTimeMinutes = (start_time) => {
        if (!start_time) return 9999
        const m = start_time.match(/(\d{1,2}):(\d{2})/)
        return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 9999
    }

    const sortedDayClasses = (dayName) => {
        return (classes || [])
            .filter(c => {
                const days = c.class?.days_of_week
                if (!days || !Array.isArray(days)) return false
                return getDayFullNames(days).includes(dayName)
            })
            .slice()
            .sort((a, b) => getTimeMinutes(a.class?.start_time) - getTimeMinutes(b.class?.start_time))
    }

    const renderDayCell = (opts) => {
        if (opts.isPad) return (
            <div 
                key={opts.key} 
                style={{ 
                    minHeight: calView === 'weekly' ? 120 : 80, 
                    padding: 'var(--space-sm)', 
                    borderRadius: 'var(--radius-lg)', 
                    background: 'rgba(255, 255, 255, 0.01)', 
                    border: '1px dashed var(--border-subtle)',
                    opacity: 0.25 
                }}
            >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{opts.dayNum}</span>
            </div>
        )

        const dayClasses2 = sortedDayClasses(opts.weekDayName)
        const hasEvents = dayClasses2.length > 0

        return (
            <div 
                key={opts.key} 
                style={{ 
                    minHeight: calView === 'weekly' ? 120 : 80, 
                    padding: 'var(--space-sm)', 
                    borderRadius: 'var(--radius-lg)', 
                    background: opts.isToday 
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.03) 100%)' 
                        : hasEvents 
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)' 
                            : 'var(--dark-800)', 
                    border: opts.isToday 
                        ? '2px solid var(--primary-500)' 
                        : '1px solid var(--border-subtle)', 
                    boxShadow: opts.isToday ? '0 0 16px rgba(249, 115, 22, 0.15)' : 'none',
                    transition: 'all 0.2s ease', 
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                    {calView === 'weekly' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontSize: '0.625rem', color: opts.isWeekend ? 'var(--primary-400)' : 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{opts.dayLabel}</span>
                            <span style={{ 
                                fontSize: '1.05rem', 
                                fontWeight: opts.isToday ? 900 : 700, 
                                width: 28, 
                                height: 28, 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: opts.isToday ? 'var(--gradient-primary)' : 'transparent', 
                                color: opts.isToday ? 'white' : opts.isWeekend ? 'var(--primary-400)' : 'var(--text-primary)',
                                boxShadow: opts.isToday ? 'var(--shadow-glow)' : 'none'
                            }}>
                                {opts.dayNum}
                            </span>
                        </div>
                    ) : (
                        <span style={{ 
                            fontSize: '0.8125rem', 
                            fontWeight: opts.isToday ? 900 : 700, 
                            width: 22, 
                            height: 22, 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: opts.isToday ? 'var(--gradient-primary)' : 'transparent', 
                            color: opts.isToday ? 'white' : 'var(--text-primary)' 
                        }}>
                            {opts.dayNum}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
                    {dayClasses2.map(c => {
                        const timeStr = fmtTime(c.class?.start_time)
                        return (
                            <div 
                                key={c.id} 
                                title={`${c.class?.name} - ${timeStr}`}
                                style={{ 
                                    fontSize: '0.625rem', 
                                    background: 'rgba(139, 92, 246, 0.15)', 
                                    color: '#a78bfa', 
                                    padding: '2px 6px', 
                                    borderRadius: 'var(--radius-sm)', 
                                    fontWeight: 700, 
                                    lineHeight: 1.4, 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    borderLeft: '2px solid #8b5cf6',
                                    transition: 'all 0.15s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'
                                    e.currentTarget.style.transform = 'translateX(2px)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'
                                    e.currentTarget.style.transform = ''
                                }}
                            >
                                {timeStr && <span style={{ marginRight: 3, opacity: 0.8, color: '#c084fc' }}>{timeStr}</span>}
                                {c.class?.name}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderWeekly = () => {
        const todayDow = getDow(today)
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - todayDow)
        const weekDays = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart)
            d.setDate(weekStart.getDate() + i)
            weekDays.push(d)
        }
        const shortLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-xs)' }}>
                {weekDays.map((dt, i) => renderDayCell({
                    key: `w-${i}`, dayLabel: shortLabels[i], dayNum: dt.getDate(),
                    isToday: dt.toDateString() === today.toDateString(), isWeekend: i >= 5, weekDayName: WEEK_DAYS[i]
                }))}
            </div>
        )
    }

    const renderMonthly = () => {
        const firstDay = new Date(year, month, 1)
        const totalDays = new Date(year, month + 1, 0).getDate()
        const startOffset = getDow(firstDay)
        const prevMonthLast = new Date(year, month, 0).getDate()
        const cells = []
        for (let p = startOffset - 1; p >= 0; p--) cells.push({ day: prevMonthLast - p, inMonth: false })
        for (let d = 1; d <= totalDays; d++) cells.push({ day: d, inMonth: true })
        const rem = cells.length % 7
        if (rem > 0) for (let n = 1; n <= 7 - rem; n++) cells.push({ day: n, inMonth: false })

        return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 'var(--space-xs)' }}>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dh => (
                        <div 
                            key={dh} 
                            style={{ 
                                textAlign: 'center', 
                                fontWeight: 800, 
                                fontSize: '0.7rem', 
                                color: dh === 'Dom' || dh === 'Sáb' ? 'var(--primary-400)' : 'var(--text-secondary)', 
                                padding: 'var(--space-xs) 0', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em' 
                            }}
                        >
                            {dh}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {cells.map((cell, idx) => {
                        if (!cell.inMonth) return renderDayCell({ isPad: true, dayNum: cell.day, key: `pad-${idx}` })
                        const dt = new Date(year, month, cell.day)
                        const dow = getDow(dt)
                        return renderDayCell({
                            key: `m-${cell.day}`, dayLabel: '', dayNum: cell.day,
                            isToday: cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
                            isWeekend: dow >= 5, weekDayName: WEEK_DAYS[dow]
                        })
                    })}
                </div>
            </>
        )
    }

    return (
        <div className="glass card" style={{ marginBottom: 'var(--space-xl)', background: 'var(--surface-glass)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', margin: 0 }}>
                    <FiCalendar color="var(--primary-400)" size={22} /> 
                    <span>Mi Horario</span>
                    {calView === 'weekly' && (
                        <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            color: 'var(--text-muted)', 
                            background: 'var(--dark-700)', 
                            padding: '2px 8px', 
                            borderRadius: 'var(--radius-sm)',
                            marginLeft: 'var(--space-xs)',
                            border: '1px solid var(--border-subtle)'
                        }}>
                            Semana Actual
                        </span>
                    )}
                </h3>
                
                {/* Switch view controller */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', background: 'var(--dark-800)', borderRadius: 'var(--radius-lg)', padding: 3, border: '1px solid var(--border-subtle)' }}>
                        <button 
                            onClick={() => setCalendarView('weekly')} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '0.375rem 0.875rem', borderRadius: 'calc(var(--radius-lg) - 2px)', 
                                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', 
                                background: calView === 'weekly' ? 'var(--gradient-primary)' : 'transparent', 
                                color: calView === 'weekly' ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                                boxShadow: calView === 'weekly' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            <FiList size={13} /> Semanal
                        </button>
                        <button 
                            onClick={() => setCalendarView('monthly')} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '0.375rem 0.875rem', borderRadius: 'calc(var(--radius-lg) - 2px)', 
                                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', 
                                background: calView === 'monthly' ? 'var(--gradient-primary)' : 'transparent', 
                                color: calView === 'monthly' ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                                boxShadow: calView === 'monthly' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            <FiGrid size={13} /> Mensual
                        </button>
                    </div>

                    {calView === 'monthly' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--dark-800)', borderRadius: 'var(--radius-lg)', padding: 2, border: '1px solid var(--border-subtle)' }}>
                            <button 
                                onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} 
                                className="btn btn-ghost btn-icon" 
                                style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)' }}
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <span style={{ 
                                fontWeight: 700, 
                                fontSize: '0.8125rem', 
                                minWidth: 100, 
                                textAlign: 'center', 
                                color: 'var(--text-primary)',
                                textTransform: 'capitalize' 
                            }}>
                                {monthNames[month]}
                            </span>
                            <button 
                                onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} 
                                className="btn btn-ghost btn-icon" 
                                style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)' }}
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ minHeight: calView === 'weekly' ? 140 : 280 }}>
                {calView === 'weekly' ? renderWeekly() : renderMonthly()}
            </div>

            {(!classes || classes.length === 0) && (
                <div style={{
                    textAlign: 'center', padding: 'var(--space-xl) 0',
                    color: 'var(--text-muted)', fontSize: '0.875rem',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px dashed var(--border-subtle)',
                    marginTop: 'var(--space-md)'
                }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: 'var(--space-sm)' }}>📅</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Sin clases agendadas</span>
                    No tienes clases matriculadas aún. Inscríbete en las clases grupales disponibles abajo.
                </div>
            )}

            {/* Footnote indicators */}
            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(139,92,246,0.15)', borderLeft: '2px solid #8b5cf6' }} /> 
                    <span>Clase grupal inscrita</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-sm)' }} /> 
                    <span>Día de Hoy</span>
                </div>
            </div>
        </div>
    )
}