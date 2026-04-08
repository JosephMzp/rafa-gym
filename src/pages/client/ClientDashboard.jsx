import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
    FiUser, FiAward, FiCalendar, FiDollarSign, FiActivity,
    FiBookOpen, FiCamera, FiMapPin, FiClock, FiPhone, FiMail,
    FiEdit2, FiSave, FiX, FiLogOut, FiSun, FiMoon, FiPlus, FiCheck, FiUsers
} from 'react-icons/fi'

var CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
var UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
var WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function parseClassDays(scheduleStr) {
    if (!scheduleStr) return []
    var str = scheduleStr.toLowerCase()
    var res = []
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

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', '/upload/w_' + w + ',h_' + h + ',c_fill,g_face,q_auto,f_auto/')
}

async function uploadToCloudinary(file) {
    var fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder', 'rafagym/clients')
    var res = await fetch('https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/image/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    var data = await res.json()
    return data.secure_url
}

export default function ClientDashboard() {
    var auth = useAuth()
    var user = auth.user
    var updateUser = auth.updateUser
    var logout = auth.logout
    const navigate = useNavigate()

    // Theme toggle
    const [theme, setTheme] = useState(localStorage.getItem('rafagym-theme') || 'dark')
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('rafagym-theme', theme)
    }, [theme])
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    var _loading = useState(true)
    var _membership = useState(null)
    var _attendances = useState([])
    var _payments = useState([])
    var _routine = useState(null)
    var _classes = useState([])
    var _location = useState(null)
    var _editing = useState(false)
    var _editName = useState('')
    var _editPhone = useState('')
    var _editAddress = useState('')
    var _editEmergency = useState('')
    var _saving = useState(false)
    var _uploading = useState(false)
    var _preview = useState(null)
    var _message = useState(null)
    var _calendarMonth = useState(function () { var now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
    var _calendarView = useState('weekly')
    var _allClasses = useState([])
    var _enrolling = useState(false)
    var _enrollMsg = useState(null)

    var loading = _loading[0], setLoading = _loading[1]
    var membership = _membership[0], setMembership = _membership[1]
    var attendances = _attendances[0], setAttendances = _attendances[1]
    var payments = _payments[0], setPayments = _payments[1]
    var routine = _routine[0], setRoutine = _routine[1]
    var classes = _classes[0], setClasses = _classes[1]
    var location = _location[0], setLocation = _location[1]
    var editing = _editing[0], setEditing = _editing[1]
    var editName = _editName[0], setEditName = _editName[1]
    var editPhone = _editPhone[0], setEditPhone = _editPhone[1]
    var editAddress = _editAddress[0], setEditAddress = _editAddress[1]
    var editEmergency = _editEmergency[0], setEditEmergency = _editEmergency[1]
    var saving = _saving[0], setSaving = _saving[1]
    var uploading = _uploading[0], setUploading = _uploading[1]
    var preview = _preview[0], setPreview = _preview[1]
    var message = _message[0], setMessage = _message[1]
    var calendarMonth = _calendarMonth[0], setCalendarMonth = _calendarMonth[1]
    var calendarView = _calendarView[0], setCalendarView = _calendarView[1]
    var allClasses = _allClasses[0], setAllClasses = _allClasses[1]
    var enrolling = _enrolling[0], setEnrolling = _enrolling[1]
    var enrollMsg = _enrollMsg[0], setEnrollMsg = _enrollMsg[1]
    var fileRef = useRef(null)

    useEffect(function () {
        if (!user || !user.id) return

        loadClientData()

        var channel = supabase.channel('client_dashboard_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'class_enrollments', filter: 'client_id=eq.' + user.id }, function () { loadClientData() })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'routines', filter: 'client_id=eq.' + user.id }, function () { loadClientData() })
            .subscribe()

        return function () { supabase.removeChannel(channel) }
    }, [user?.id])

    async function loadClientData() {
        try {
            var clientId = user.id

            // membresia
            var memRes = await supabase
                .from('client_memberships')
                .select('*, membership_type:membership_types(id, name, price)')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .single()
            if (memRes.data) setMembership(memRes.data)

            // sede
            if (user.location_id) {
                var locRes = await supabase.from('locations').select('*').eq('id', user.location_id).single()
                if (locRes.data) setLocation(locRes.data)
            }

            // asistencias
            var attRes = await supabase
                .from('attendances')
                .select('*, location:locations(name)')
                .eq('client_id', clientId)
                .order('check_in', { ascending: false })
                .limit(8)
            setAttendances(attRes.data || [])

            // pagos
            var payRes = await supabase
                .from('payments')
                .select('*')
                .eq('client_id', clientId)
                .order('date', { ascending: false })
                .limit(5)
            setPayments(payRes.data || [])

            // rutina
            var routRes = await supabase
                .from('routines')
                .select('*, routine_exercises(*, exercises(name, muscle_group))')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .single()
            if (routRes.data) setRoutine(routRes.data)

            // clases inscritas
            var clsRes = await supabase
                .from('class_enrollments')
                .select('*, class:classes(name, instructor, schedule)')
                .eq('client_id', clientId)
                .eq('status', 'active')
            setClasses(clsRes.data || [])

            // todas las clases activas
            var allClsRes = await supabase
                .from('classes')
                .select('*, location:locations(name), class_enrollments(id, client_id)')
                .eq('status', 'active')
                .order('name')
            setAllClasses(allClsRes.data || [])

        } catch (err) { console.error('loadClientData error:', err) }
        finally { setLoading(false) }
    }

    function handleLogout() { logout(); navigate('/login') }

    function startEditing() {
        setEditName(user?.name || '')
        setEditPhone(user?.phone || '')
        setEditAddress(user?.address || '')
        setEditEmergency(user?.emergency_contact || '')
        setEditing(true)
    }

    async function saveProfile() {
        setSaving(true)
        try {
            var updates = { name: editName, phone: editPhone, address: editAddress, emergency_contact: editEmergency }
            var res = await supabase.from('clients').update(updates).eq('id', user.id)
            if (res.error) throw res.error
            updateUser(updates)
            setEditing(false)
            setMessage('Datos actualizados correctamente')
            setTimeout(function () { setMessage(null) }, 3000)
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    async function handlePhoto(file) {
        if (!file || !file.type.startsWith('image/')) return
        if (file.size > 5 * 1024 * 1024) return

        var reader = new FileReader()
        reader.onload = function (ev) { setPreview(ev.target.result) }
        reader.readAsDataURL(file)

        setUploading(true)
        try {
            var url = await uploadToCloudinary(file)
            await supabase.from('clients').update({ photo_url: url }).eq('id', user.id)
            updateUser({ photo_url: url })
            setPreview(null)
            setMessage('Foto actualizada')
            setTimeout(function () { setMessage(null) }, 3000)
        } catch (err) { console.error(err); setPreview(null) }
        finally { setUploading(false) }
    }

    var daysLeft = 0
    if (membership && membership.end_date) {
        daysLeft = Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    }
    var membershipName = membership?.membership_type?.name || 'Sin membresia'
    var membershipColor = membershipName === 'Gold' ? '#f59e0b' : membershipName === 'Fit' ? '#8b5cf6' : '#10b981'
    var photoDisplay = preview || (user?.photo_url ? optimizeUrl(user.photo_url, 200, 200) : null)
    var totalAttendances = attendances.length
    var lastPayment = payments[0]

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner spinner-lg"></div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)' }}>
            <nav className="glass" style={{
                padding: '0.75rem var(--space-xl)', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 50
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{'💪'}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                        Rafa<span className="gradient-text">Gym</span>
                    </span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <a href="#mis-datos" onClick={function (e) { e.preventDefault(); document.getElementById('mis-datos').scrollIntoView({ behavior: 'smooth' }); startEditing() }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', transition: 'background 0.2s, border-color 0.2s' }}
                        title="Editar mis datos"
                        onMouseEnter={function (e) { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'var(--dark-700)' }}
                        onMouseLeave={function (e) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--dark-800)' }}>
                        {user?.photo_url ? (
                            <img src={optimizeUrl(user.photo_url, 64, 64)} alt={user?.name}
                                style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }} />
                        ) : (
                            <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem', border: '2px solid var(--primary-500)' }}>
                                {(user?.name || 'C').charAt(0)}
                            </div>
                        )}
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</span>
                        <FiEdit2 size={12} color="var(--primary-400)" style={{ marginLeft: '0.25rem' }} />
                    </a>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Cambiar tema">
                            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}><FiLogOut size={14} /> Salir</button>
                    </div>
                </div>
            </nav>

            <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
                {message && (
                    <div style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                        background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
                        fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-lg)',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}>
                        {'✓'} {message}
                    </div>
                )}


                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-xl)',
                    marginBottom: 'var(--space-2xl)', flexWrap: 'wrap'
                }}>
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                            style={{
                                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
                                cursor: uploading ? 'wait' : 'pointer',
                                background: photoDisplay
                                    ? 'url(' + photoDisplay + ') center/cover no-repeat'
                                    : 'linear-gradient(135deg, ' + membershipColor + ', var(--primary-700))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '3px solid ' + membershipColor,
                                boxShadow: '0 4px 20px ' + membershipColor + '40',
                                position: 'relative'
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
                            onClick={function () { if (!uploading && fileRef.current) fileRef.current.click() }}
                            style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 32, height: 32, borderRadius: '50%',
                                background: membershipColor, border: '2px solid var(--dark-700)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            <FiCamera size={14} />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={function (e) { handlePhoto(e.target.files[0]) }} />
                    </div>

                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
                            Hola,{' '}<span className="gradient-text">{user?.name}</span>{' '}{'👋'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
                            Aqui esta el resumen de tu cuenta
                        </p>
                        {location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                <FiMapPin size={12} /> {location.name}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{
                    marginBottom: 'var(--space-xl)',
                    background: 'linear-gradient(135deg, ' + membershipColor + '15, ' + membershipColor + '05)',
                    borderColor: membershipColor + '30',
                    borderLeft: '4px solid ' + membershipColor
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FiAward color={membershipColor} size={22} />
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: membershipColor }}>
                                    {'Membresia ' + membershipName}
                                </span>
                            </div>
                            {membership && (
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    {'Desde: ' + membership.start_date + ' • Hasta: ' + membership.end_date}
                                </div>
                            )}
                            {!membership && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No tienes una membresia activa</p>
                            )}
                        </div>
                        {membership && (
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900,
                                    color: daysLeft <= 7 ? 'var(--danger)' : daysLeft <= 15 ? 'var(--warning)' : 'var(--success)',
                                    lineHeight: 1
                                }}>
                                    {daysLeft}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>dias restantes</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ CALENDARIO (Semanal / Mensual) ═══ */}
                {(function () {
                    var today = new Date()
                    var calMonth = calendarMonth || new Date(today.getFullYear(), today.getMonth(), 1)
                    var year = calMonth.getFullYear()
                    var month = calMonth.getMonth()
                    var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                    var calView = calendarView || 'weekly'


                    function getDow(dt) { var js = dt.getDay(); return js === 0 ? 6 : js - 1 } // Mon=0…Sun=6

                    function getTimeMinutes(scheduleStr) {
                        if (!scheduleStr) return 9999
                        var m = scheduleStr.match(/(\d{1,2}):(\d{2})/)
                        return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 9999
                    }

                    function sortedDayClasses(dayName) {
                        return classes
                            .filter(function (c) { return parseClassDays(c.class?.schedule).includes(dayName) })
                            .slice()
                            .sort(function (a, b) { return getTimeMinutes(a.class?.schedule) - getTimeMinutes(b.class?.schedule) })
                    }

                    function renderDayCell(opts) {
                        if (opts.isPad) return (
                            <div style={{ minHeight: calView === 'weekly' ? 110 : 72, padding: '0.375rem', borderRadius: 'var(--radius-sm)', background: 'var(--dark-700)', opacity: 0.25 }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opts.dayNum}</span>
                            </div>
                        )
                        var isRoutine = routine && routine.days && routine.days.includes(opts.weekDayName)
                        var dayClasses2 = sortedDayClasses(opts.weekDayName)
                        var hasEvents = isRoutine || dayClasses2.length > 0
                        return (
                            <div style={{
                                minHeight: calView === 'weekly' ? 110 : 72, padding: '0.375rem', borderRadius: 'var(--radius-sm)',
                                background: opts.isToday ? 'rgba(249,115,22,0.12)' : hasEvents ? 'var(--dark-800)' : 'var(--dark-700)',
                                border: opts.isToday ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                                transition: 'background 0.15s, border-color 0.15s', overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                    {calView === 'weekly' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                            <span style={{ fontSize: '0.625rem', color: opts.isWeekend ? 'var(--primary-400)' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {opts.dayLabel}
                                            </span>
                                            <span style={{
                                                fontSize: '1.1rem', fontWeight: opts.isToday ? 900 : 700, lineHeight: 1,
                                                width: opts.isToday ? 30 : 'auto', height: opts.isToday ? 30 : 'auto',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: opts.isToday ? 'var(--primary-500)' : 'transparent',
                                                color: opts.isToday ? 'white' : opts.isWeekend ? 'var(--primary-400)' : 'var(--text-primary)'
                                            }}>{opts.dayNum}</span>
                                        </div>
                                    ) : (
                                        <span style={{
                                            fontSize: opts.isToday ? '0.8125rem' : '0.75rem', fontWeight: opts.isToday ? 800 : 600,
                                            width: opts.isToday ? 24 : 'auto', height: opts.isToday ? 24 : 'auto', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: opts.isToday ? 'var(--primary-500)' : 'transparent',
                                            color: opts.isToday ? 'white' : 'var(--text-primary)'
                                        }}>{opts.dayNum}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {isRoutine && (
                                        <div style={{ fontSize: '0.625rem', background: 'rgba(249,115,22,0.2)', color: '#f97316', padding: '1px 4px', borderRadius: 3, fontWeight: 700, lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            💪 Rutina
                                        </div>
                                    )}
                                    {dayClasses2.map(function (c) {
                                        var timeMatch = c.class?.schedule ? c.class.schedule.match(/\d{1,2}:\d{2}/) : null
                                        var timeStr = timeMatch ? timeMatch[0] : ''
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

                    function renderWeekly() {
                        var todayDow = getDow(today) // 0=Mon
                        var weekStart = new Date(today)
                        weekStart.setDate(today.getDate() - todayDow)
                        var weekDays = []
                        for (var i = 0; i < 7; i++) {
                            var d = new Date(weekStart)
                            d.setDate(weekStart.getDate() + i)
                            weekDays.push(d)
                        }
                        var shortLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                        return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {weekDays.map(function (dt, i) {
                                    var isToday = dt.toDateString() === today.toDateString()
                                    var weekDayName = WEEK_DAYS[i]
                                    return renderDayCell({
                                        dayLabel: shortLabels[i],
                                        dayNum: dt.getDate(),
                                        isToday: isToday,
                                        isWeekend: i >= 5,
                                        weekDayName: weekDayName
                                    })
                                })}
                            </div>
                        )
                    }


                    function renderMonthly() {
                        var firstDay = new Date(year, month, 1)
                        var totalDays = new Date(year, month + 1, 0).getDate()
                        var startOffset = getDow(firstDay)
                        var prevMonthLast = new Date(year, month, 0).getDate()
                        var cells = []
                        for (var p = startOffset - 1; p >= 0; p--) cells.push({ day: prevMonthLast - p, inMonth: false })
                        for (var d = 1; d <= totalDays; d++) cells.push({ day: d, inMonth: true })
                        var rem = cells.length % 7
                        if (rem > 0) for (var n = 1; n <= 7 - rem; n++) cells.push({ day: n, inMonth: false })

                        return (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(function (dh) {
                                        return <div key={dh} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.7rem', color: dh === 'Dom' || dh === 'Sáb' ? 'var(--primary-400)' : 'var(--text-secondary)', padding: '0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dh}</div>
                                    })}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                                    {cells.map(function (cell, idx) {
                                        if (!cell.inMonth) return renderDayCell({ isPad: true, dayNum: cell.day, key: 'pad-' + idx })
                                        var dt = new Date(year, month, cell.day)
                                        var dow = getDow(dt)
                                        return <div key={'d-' + cell.day}>{renderDayCell({ dayLabel: '', dayNum: cell.day, isToday: cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear(), isWeekend: dow >= 5, weekDayName: WEEK_DAYS[dow] })}</div>
                                    })}
                                </div>
                            </>
                        )
                    }

                    var btnBase = { padding: '0.25rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', border: '1px solid var(--border-default)', transition: 'all 0.15s' }
                    var btnActive = Object.assign({}, btnBase, { background: 'var(--primary-500)', color: 'white', borderColor: 'var(--primary-500)' })
                    var btnInactive = Object.assign({}, btnBase, { background: 'none', color: 'var(--text-secondary)' })

                    return (
                        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    <FiCalendar color="var(--primary-400)" /> Mi Calendario
                                    {calView === 'weekly' && (
                                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                                            — Semana actual
                                        </span>
                                    )}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button onClick={function () { setCalendarView('weekly') }} style={calView === 'weekly' ? btnActive : btnInactive}>Semanal</button>
                                    <button onClick={function () { setCalendarView('monthly') }} style={calView === 'monthly' ? btnActive : btnInactive}>Mensual</button>
                                    {calView === 'monthly' && (
                                        <>
                                            <button onClick={function () { setCalendarMonth(new Date(year, month - 1, 1)) }} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>{'‹'}</button>
                                            <span style={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 140, textAlign: 'center', color: 'var(--text-primary)' }}>{monthNames[month] + ' ' + year}</span>
                                            <button onClick={function () { setCalendarMonth(new Date(year, month + 1, 1)) }} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }}>{'›'}</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {calView === 'weekly' ? renderWeekly() : renderMonthly()}


                            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(249,115,22,0.3)' }} /> Rutina programada
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(139,92,246,0.3)' }} /> Clase grupal
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-500)' }} /> Hoy
                                </div>
                            </div>
                        </div>
                    )
                })()}
                var today = new Date()
                var calMonth = calendarMonth || new Date(today.getFullYear(), today.getMonth(), 1)

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--primary-400)' }}><FiCalendar /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Asistencias</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{totalAttendances}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Ultimo Pago</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                                {'S/ ' + (lastPayment ? Number(lastPayment.amount).toFixed(0) : '0')}
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}><FiActivity /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Rutina</div>
                            <div className="stat-card-value" style={{ fontSize: '1rem' }}>{routine ? routine.objective : 'Sin asignar'}</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><FiBookOpen /></div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Clases</div>
                            <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{classes.length}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCalendar color="var(--primary-400)" /> Ultimas Asistencias
                        </h3>
                        {attendances.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay asistencias registradas</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {attendances.map(function (a) {
                                    var date = new Date(a.check_in)
                                    return (
                                        <div key={a.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FiClock size={12} color="var(--text-muted)" />
                                                <span>{date.toLocaleDateString('es-PE')}</span>
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                                {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                                {a.location ? ' • ' + a.location.name : ''}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Rutina */}
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiActivity color="var(--primary-400)" /> Mi Rutina
                        </h3>
                        {routine ? (
                            <div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Objetivo:</strong> {routine.objective}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Nivel:</strong>{' '}
                                        <span className={'badge ' + (routine.level === 'Principiante' ? 'badge-success' : routine.level === 'Intermedio' ? 'badge-warning' : 'badge-danger')}>
                                            {routine.level}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Entrenador:</strong> {routine.trainer_name}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <strong>Dias:</strong>{' '}
                                        {(routine.days || []).map(function (d) {
                                            return <span key={d} className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>{d}</span>
                                        })}
                                    </div>
                                </div>
                                {/* Ejercicios*/}
                                {routine.routine_exercises && routine.routine_exercises.length > 0 && (
                                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                            Ejercicios
                                        </div>
                                        {routine.routine_exercises.slice(0, 6).map(function (re, i) {
                                            return (
                                                <div key={re.id || i} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '0.375rem 0', fontSize: '0.8125rem'
                                                }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>{re.exercises?.name || 'Ejercicio'}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{re.sets} x {re.reps}</span>
                                                </div>
                                            )
                                        })}
                                        {routine.routine_exercises.length > 6 && (
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                +{routine.routine_exercises.length - 6} ejercicios mas
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'🏋️'}</div>
                                <p style={{ fontSize: '0.875rem' }}>No tienes rutina asignada</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiDollarSign color="var(--success)" /> Ultimos Pagos
                        </h3>
                        {payments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay pagos registrados</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {payments.map(function (p) {
                                    return (
                                        <div key={p.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-600)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.concept}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date} • {p.method}</div>
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9375rem' }}>
                                                {'S/ ' + Number(p.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiBookOpen color="#8b5cf6" /> Mis Clases
                        </h3>
                        {classes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{'📚'}</div>
                                <p style={{ fontSize: '0.875rem' }}>No estas inscrito en ninguna clase</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {classes.map(function (en) {
                                    return (
                                        <div key={en.id} style={{
                                            padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                                            background: 'var(--dark-600)', borderLeft: '3px solid #8b5cf6'
                                        }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{en.class?.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                                                {en.class?.instructor} • {en.class?.schedule}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {(membershipName === 'Fit' || membershipName === 'Gold') && (function () {
                    var isFitGold = true

                    async function handleEnroll(cls) {
                        if (enrolling) return
                        var alreadyEnrolled = (cls.class_enrollments || []).some(function (e) { return e.client_id === user.id })
                        setEnrolling(true)
                        try {
                            if (alreadyEnrolled) {
                                var myEnrollment = (cls.class_enrollments || []).find(function (e) { return e.client_id === user.id })
                                if (myEnrollment) {
                                    await supabase.from('class_enrollments').delete().eq('id', myEnrollment.id)
                                }
                                setEnrollMsg('✓ Matricula cancelada de ' + cls.name)
                            } else {
                                var currentCount = (cls.class_enrollments || []).length
                                if (currentCount >= cls.capacity) {
                                    setEnrollMsg('⚠ Esta clase está llena (capacidad: ' + cls.capacity + ')')
                                    setTimeout(function () { setEnrollMsg(null) }, 3000)
                                    setEnrolling(false)
                                    return
                                }
                                await supabase.from('class_enrollments').insert({ class_id: cls.id, client_id: user.id, status: 'active' })
                                setEnrollMsg('✓ ¡Matriculado en ' + cls.name + '!')
                            }
                            setTimeout(function () { setEnrollMsg(null) }, 3000)
                            loadClientData()
                        } catch (err) {
                            console.error(err)
                            setEnrollMsg('Error al procesar la solicitud')
                            setTimeout(function () { setEnrollMsg(null) }, 3000)
                        }
                        finally { setEnrolling(false) }
                    }

                    return (
                        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    <FiUsers color="#8b5cf6" /> Clases Grupales Disponibles
                                </h3>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.625rem',
                                    borderRadius: 'var(--radius-full)',
                                    background: membershipName === 'Gold' ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)',
                                    color: membershipName === 'Gold' ? '#f59e0b' : '#8b5cf6',
                                    border: '1px solid currentColor'
                                }}>
                                    {membershipName === 'Gold' ? '🥇' : '🥈'} {membershipName} — Acceso Gratis
                                </span>
                            </div>

                            {enrollMsg && (
                                <div style={{
                                    padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)',
                                    background: enrollMsg.startsWith('⚠') ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                                    color: enrollMsg.startsWith('⚠') ? '#f59e0b' : '#10b981',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    border: '1px solid ' + (enrollMsg.startsWith('⚠') ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)')
                                }}>{enrollMsg}</div>
                            )}

                            {allClasses.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No hay clases activas disponibles</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                    {allClasses.map(function (cls) {
                                        var enrolledCount = (cls.class_enrollments || []).length
                                        var alreadyEnrolled = (cls.class_enrollments || []).some(function (e) { return e.client_id === user.id })
                                        var isFull = enrolledCount >= cls.capacity && !alreadyEnrolled
                                        var pct = Math.min(100, Math.round((enrolledCount / cls.capacity) * 100))
                                        var barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981'

                                        return (
                                            <div key={cls.id} style={{
                                                borderRadius: 'var(--radius-md)', padding: '1rem',
                                                background: alreadyEnrolled ? 'rgba(139,92,246,0.08)' : 'var(--dark-700)',
                                                border: '1px solid ' + (alreadyEnrolled ? '#8b5cf6' : 'var(--border-subtle)'),
                                                transition: 'border-color 0.2s, background 0.2s',
                                                opacity: isFull ? 0.6 : 1
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{cls.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {cls.instructor && <span>👤 {cls.instructor} · </span>}
                                                            {cls.location?.name}
                                                        </div>
                                                    </div>
                                                    {alreadyEnrolled && (
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'rgba(139,92,246,0.25)', color: '#8b5cf6', whiteSpace: 'nowrap' }}>
                                                            ✓ Inscrito
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
                                                    🕐 {cls.schedule}
                                                </div>

                                                {/* Capacity bar */}
                                                <div style={{ marginBottom: '0.625rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                                        <span>Ocupación</span>
                                                        <span style={{ color: barColor, fontWeight: 700 }}>{enrolledCount}/{cls.capacity}</span>
                                                    </div>
                                                    <div style={{ height: 4, borderRadius: 2, background: 'var(--dark-500)', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={function () { handleEnroll(cls) }}
                                                    disabled={isFull || enrolling}
                                                    style={{
                                                        width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)',
                                                        fontWeight: 700, fontSize: '0.8125rem', cursor: isFull ? 'not-allowed' : 'pointer',
                                                        border: 'none', transition: 'all 0.2s',
                                                        background: isFull ? 'var(--dark-500)' : alreadyEnrolled ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.2)',
                                                        color: isFull ? 'var(--text-muted)' : alreadyEnrolled ? '#ef4444' : '#8b5cf6'
                                                    }}
                                                >
                                                    {isFull ? 'Clase Llena'
                                                        : alreadyEnrolled ? '✕ Cancelar Matrícula'
                                                            : '+ Matricularme'}
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })()}

                {/* Personal Info */}
                <div className="card" id="mis-datos">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiUser color="var(--primary-400)" /> Mis Datos
                        </h3>
                        {!editing && (
                            <button className="btn btn-sm btn-secondary" onClick={startEditing}>
                                <FiEdit2 size={14} /> Editar
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label"><FiUser size={12} /> Nombre</label>
                                    <input className="form-input" value={editName}
                                        onChange={function (e) { setEditName(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiMail size={12} /> Email</label>
                                    <input className="form-input" value={user?.email || ''} disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label"><FiPhone size={12} /> Telefono</label>
                                    <input className="form-input" value={editPhone}
                                        onChange={function (e) { setEditPhone(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Direccion</label>
                                    <input className="form-input" value={editAddress}
                                        onChange={function (e) { setEditAddress(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Contacto de Emergencia</label>
                                    <input className="form-input" value={editEmergency}
                                        onChange={function (e) { setEditEmergency(e.target.value) }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Documento</label>
                                    <input className="form-input" value={user?.document || ''} disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                                <button className="btn btn-secondary" onClick={function () { setEditing(false) }}><FiX size={14} /> Cancelar</button>
                                <button className="btn btn-primary" onClick={saveProfile} disabled={saving || !editName}>
                                    {saving ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Guardando...</> : <><FiSave size={14} /> Guardar</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-grid">
                            {[
                                ['Nombre', user?.name],
                                ['Documento', user?.document],
                                ['Email', user?.email],
                                ['Telefono', user?.phone],
                                ['Fecha de Nacimiento', user?.birth_date],
                                ['Direccion', user?.address],
                                ['Contacto de Emergencia', user?.emergency_contact]
                            ].map(function (item) {
                                return (
                                    <div key={item[0]} className="form-group">
                                        <span className="form-label">{item[0]}</span>
                                        <span style={{ fontSize: '0.9375rem' }}>{item[1] || '-'}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}