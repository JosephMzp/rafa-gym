import { FiCalendar } from 'react-icons/fi'

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function parseClassDays(scheduleStr) {
    if (!scheduleStr) return []
    const str = scheduleStr.toLowerCase()
    const res = []
    if (str.includes('lun-vie')) return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
    if (str.includes('lun')) res.push('Lunes')
    if (str.includes('mar')) res.push('Martes')
    if (str.includes('mié') || str.includes('mie')) res.push('Miércoles')
    if (str.includes('jue')) res.push('Jueves')
    if (str.includes('vie')) res.push('Viernes')
    if (str.includes('sab') || str.includes('sáb')) res.push('Sábado')
    if (str.includes('dom')) res.push('Domingo')
    return res
}

export default function ClientCalendar({ classes, calView, setCalendarView, calendarMonth, setCalendarMonth }) {
    const today = new Date()
    const calDate = calendarMonth || new Date(today.getFullYear(), today.getMonth(), 1)
    const year = calDate.getFullYear()
    const month = calDate.getMonth()
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    const getDow = (dt) => { const js = dt.getDay(); return js === 0 ? 6 : js - 1 }

    const getTimeMinutes = (scheduleStr) => {
        if (!scheduleStr) return 9999
        const m = scheduleStr.match(/(\d{1,2}):(\d{2})/)
        return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 9999
    }

    const sortedDayClasses = (dayName) => {
        return classes
            .filter(c => parseClassDays(c.class?.schedule).includes(dayName))
            .slice()
            .sort((a, b) => getTimeMinutes(a.class?.schedule) - getTimeMinutes(b.class?.schedule))
    }

    const renderDayCell = (opts) => {
        if (opts.isPad) return (
            <div key={opts.key} style={{ minHeight: calView === 'weekly' ? 110 : 72, padding: '0.375rem', borderRadius: 'var(--radius-sm)', background: 'var(--dark-700)', opacity: 0.25 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opts.dayNum}</span>
            </div>
        )

        const dayClasses2 = sortedDayClasses(opts.weekDayName)
        const hasEvents = dayClasses2.length > 0

        return (
            <div key={opts.key} style={{ minHeight: calView === 'weekly' ? 110 : 72, padding: '0.375rem', borderRadius: 'var(--radius-sm)', background: opts.isToday ? 'rgba(249,115,22,0.12)' : hasEvents ? 'var(--dark-800)' : 'var(--dark-700)', border: opts.isToday ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)', transition: 'background 0.15s, border-color 0.15s', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    {calView === 'weekly' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontSize: '0.625rem', color: opts.isWeekend ? 'var(--primary-400)' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{opts.dayLabel}</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: opts.isToday ? 900 : 700, lineHeight: 1, width: opts.isToday ? 30 : 'auto', height: opts.isToday ? 30 : 'auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: opts.isToday ? 'var(--primary-500)' : 'transparent', color: opts.isToday ? 'white' : opts.isWeekend ? 'var(--primary-400)' : 'var(--text-primary)' }}>{opts.dayNum}</span>
                        </div>
                    ) : (
                        <span style={{ fontSize: opts.isToday ? '0.8125rem' : '0.75rem', fontWeight: opts.isToday ? 800 : 600, width: opts.isToday ? 24 : 'auto', height: opts.isToday ? 24 : 'auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: opts.isToday ? 'var(--primary-500)' : 'transparent', color: opts.isToday ? 'white' : 'var(--text-primary)' }}>{opts.dayNum}</span>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayClasses2.map(c => {
                        const timeMatch = c.class?.schedule ? c.class.schedule.match(/\d{1,2}:\d{2}/) : null
                        const timeStr = timeMatch ? timeMatch[0] : ''
                        return (
                            <div key={c.id} style={{ fontSize: '0.625rem', background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', padding: '1px 4px', borderRadius: 3, fontWeight: 700, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {timeStr && <span style={{ marginRight: 2, opacity: 0.8 }}>{timeStr}</span>}{c.class?.name}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dh => (
                        <div key={dh} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.7rem', color: dh === 'Dom' || dh === 'Sáb' ? 'var(--primary-400)' : 'var(--text-secondary)', padding: '0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dh}</div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
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

    const btnBase = { padding: '0.25rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', border: '1px solid var(--border-default)', transition: 'all 0.15s' }
    const btnActive = { ...btnBase, background: 'var(--primary-500)', color: 'white', borderColor: 'var(--primary-500)' }
    const btnInactive = { ...btnBase, background: 'none', color: 'var(--text-secondary)' }

    return (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <FiCalendar color="var(--primary-400)" /> Mi Calendario
                    {calView === 'weekly' && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>— Semana actual</span>}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => setCalendarView('weekly')} style={calView === 'weekly' ? btnActive : btnInactive}>Semanal</button>
                    <button onClick={() => setCalendarView('monthly')} style={calView === 'monthly' ? btnActive : btnInactive}>Mensual</button>
                    {calView === 'monthly' && (
                        <>
                            <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>‹</button>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 140, textAlign: 'center', color: 'var(--text-primary)' }}>{monthNames[month]} {year}</span>
                            <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>›</button>
                        </>
                    )}
                </div>
            </div>

            {calView === 'weekly' ? renderWeekly() : renderMonthly()}

            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(139,92,246,0.3)' }} /> Clase grupal
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-500)' }} /> Hoy
                </div>
            </div>
        </div>
    )
}