import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/cloudinary'
import {
    FiZap, FiAward, FiCalendar, FiActivity, FiBookOpen, FiCoffee,
    FiClock, FiUser, FiMapPin, FiChevronRight, FiDollarSign
} from 'react-icons/fi'
import ProfileHeader from '../../components/ClientDashboard/ProfileHeader'

// ── Helpers ──────────────────────────────────────────────────────────────────
const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function todayEnrollments(enrolledClasses) {
    const todayIdx = new Date().getDay() // 0 = domingo
    const todayName = DAY_NAMES_ES[todayIdx]
    return enrolledClasses.filter(e => {
        const days = e.class?.days_of_week || []
        return days.includes(todayName)
    })
}

// ── Skeleton cards ────────────────────────────────────────────────────────────
function SkeletonCard({ height = 120 }) {
    return (
        <div className="skeleton" style={{ height, borderRadius: 'var(--radius-lg)', width: '100%' }} />
    )
}

// ── Next Class Card ───────────────────────────────────────────────────────────
function NextClassCard({ todayClasses }) {
    if (todayClasses.length === 0) {
        return (
            <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                <FiCalendar size={32} color="var(--text-muted)" style={{ marginBottom: 'var(--space-sm)' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No tienes clases hoy</p>
                <Link to="/portal/classes" style={{ color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                    Ver todas las clases →
                </Link>
            </div>
        )
    }

    const next = todayClasses[0]
    const cls  = next.class

    return (
        <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <FiCalendar size={16} color="#8b5cf6" />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem' }}>
                    Clase de hoy
                </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 'var(--space-xs)' }}>
                {cls?.name}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                {cls?.instructor && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiUser size={12} /> {cls.instructor}
                    </span>
                )}
                {cls?.start_time && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiClock size={12} /> {cls.start_time}
                    </span>
                )}
            </div>
            {todayClasses.length > 1 && (
                <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    +{todayClasses.length - 1} clase{todayClasses.length > 2 ? 's' : ''} más hoy
                </div>
            )}
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientHome() {
    const { user, updateUser } = useAuth()

    const [loadingData, setLoadingData] = useState(true)
    const [membership, setMembership]   = useState(null)
    const [todayClasses, setTodayClasses] = useState([])
    const [location, setLocation]       = useState(null)
    const [attendances, setAttendances] = useState([])
    const [payments, setPayments]       = useState([])
    const [classesCount, setClassesCount] = useState(0)

    // Photo upload states
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview]     = useState(null)
    const [message, setMessage]     = useState(null)

    useEffect(() => {
        if (!user?.id) return
        loadHomeData()
    }, [user?.id])

    async function loadHomeData() {
        try {
            const clientId = user.id

            // Membresía activa
            const { data: mem } = await supabase
                .from('client_memberships')
                .select('*, membership_type:membership_types(*)')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .order('end_date', { ascending: false })
                .limit(1)
            setMembership(mem?.[0] || null)

            // Sede
            if (user.location_id) {
                const { data: loc } = await supabase
                    .from('locations').select('*').eq('id', user.location_id).single()
                setLocation(loc || null)
            }

            // Clases activas del cliente, filtradas para hoy
            const { data: enrolled } = await supabase
                .from('class_enrollments')
                .select('*, class:classes(name, instructor, days_of_week, start_time, end_time)')
                .eq('client_id', clientId)
                .eq('status', 'active')

            setTodayClasses(todayEnrollments(enrolled || []))
            setClassesCount(enrolled?.length || 0)

            // Asistencias
            const { data: att } = await supabase
                .from('attendances')
                .select('*, location:locations(name)')
                .eq('client_id', clientId)
                .order('check_in', { ascending: false })
                .limit(8)
            setAttendances(att || [])

            // Pagos
            const { data: pay } = await supabase
                .from('payments')
                .select('*')
                .eq('client_id', clientId)
                .order('date', { ascending: false })
                .limit(5)
            setPayments(pay || [])
        } catch (err) {
            console.error('[ClientHome] loadHomeData:', err)
        } finally {
            setLoadingData(false)
        }
    }

    const handlePhoto = async (file) => {
        if (!file || !file.type.startsWith('image/')) return
        if (file.size > 5 * 1024 * 1024) return

        const reader = new FileReader()
        reader.onload = ev => setPreview(ev.target.result)
        reader.readAsDataURL(file)

        setUploading(true)
        try {
            const { url } = await uploadImage(file, 'rafagym/clients')
            await supabase.from('clients').update({ photo_url: url }).eq('id', user.id)
            updateUser({ photo_url: url })
            setPreview(null)
            setMessage('Foto de perfil actualizada con éxito')
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            console.error('[ClientHome] handlePhoto:', err)
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
            {message && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)',
                    background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
                    fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--space-lg)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                    ✓ {message}
                </div>
            )}

            {/* ── Profile Header (Unified) ── */}
            {loadingData ? (
                <div style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)', alignItems: 'center' }}>
                    <div className="skeleton" style={{ width: 96, height: 96, borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: 28, width: '50%', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-sm)' }} />
                        <div className="skeleton" style={{ height: 18, width: '35%', borderRadius: 'var(--radius-md)' }} />
                    </div>
                </div>
            ) : (
                <ProfileHeader 
                    user={user} 
                    location={location} 
                    membership={membership} 
                    preview={preview} 
                    uploading={uploading} 
                    handlePhoto={handlePhoto} 
                />
            )}

            {/* ── Próxima clase hoy ── */}
            <div style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mi Actividad de Hoy
                </h2>
                {loadingData ? <SkeletonCard height={110} /> : (
                    <NextClassCard todayClasses={todayClasses} />
                )}
            </div>

            {/* ── Resumen y Estadísticas ── */}
            <div style={{ marginTop: 'var(--space-xl)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mi Resumen
                </h2>
                {loadingData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        <SkeletonCard height={80} />
                        <SkeletonCard height={80} />
                        <SkeletonCard height={80} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--primary-400)' }}><FiCalendar /></div>
                            <div className="stat-card-content">
                                <div className="stat-card-label">Asistencias</div>
                                <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{attendances.length}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
                            <div className="stat-card-content">
                                <div className="stat-card-label">Último Pago</div>
                                <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                                    S/ {payments[0] ? Number(payments[0].amount).toFixed(0) : '0'}
                                </div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><FiBookOpen /></div>
                            <div className="stat-card-content">
                                <div className="stat-card-label">Clases Activas</div>
                                <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{classesCount}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Asistencias y Pagos Recientes ── */}
                {loadingData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
                        <SkeletonCard height={200} />
                        <SkeletonCard height={200} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                        <div className="card">
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiCalendar color="var(--primary-400)" /> Últimas Asistencias
                            </h3>
                            {attendances.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay asistencias registradas</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {attendances.slice(0, 5).map(a => {
                                        const date = new Date(a.check_in)
                                        return (
                                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
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

                        <div className="card">
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiDollarSign color="var(--success)" /> Últimos Pagos
                            </h3>
                            {payments.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay pagos registrados</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {payments.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-600)' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.concept}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date} • {p.method}</div>
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9375rem' }}>
                                                S/ {Number(p.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
