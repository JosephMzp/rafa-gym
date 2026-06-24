import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import ClientCalendar from '../../components/ClientDashboard/ClientCalendar'
import ClassesEnrollment from '../../components/ClientDashboard/ClassesEnrollment'

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonBlock({ height }) {
    return <div className="skeleton" style={{ height, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }} />
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientClasses() {
    const { user } = useAuth()

    const [loading, setLoading]             = useState(true)
    const [classes, setClasses]             = useState([])
    const [allClasses, setAllClasses]       = useState([])
    const [membership, setMembership]       = useState(null)
    const [enrolling, setEnrolling]         = useState(false)
    const [enrollMsg, setEnrollMsg]         = useState(null)
    const [calendarView, setCalendarView]   = useState('weekly')
    const [calendarMonth, setCalendarMonth] = useState(
        () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    )

    useEffect(() => {
        if (!user?.id) return
        loadData()

        const channel = supabase
            .channel('client_classes_changes')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'class_enrollments',
                filter: `client_id=eq.${user.id}`,
            }, () => loadData())
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user?.id])

    async function loadData() {
        try {
            const clientId = user.id

            const { data: mem } = await supabase
                .from('client_memberships')
                .select('*, membership_type:membership_types(*)')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .order('end_date', { ascending: false })
                .limit(1)
            setMembership(mem?.[0] || null)

            const { data: enrolled } = await supabase
                .from('class_enrollments')
                .select('*, class:classes(name, instructor, days_of_week, start_time, end_time)')
                .eq('client_id', clientId)
                .eq('status', 'active')
            setClasses(enrolled || [])

            const { data: all } = await supabase
                .from('classes')
                .select('*, location:locations(name), class_enrollments(id, client_id), days_of_week, start_time, end_time')
                .eq('status', 'active')
                .order('name')
            setAllClasses(all || [])
        } catch (err) {
            console.error('[ClientClasses] loadData:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleEnroll = async (cls) => {
        if (enrolling) return
        const alreadyEnrolled = (cls.class_enrollments || []).some(e => e.client_id === user.id)
        setEnrolling(true)
        try {
            if (alreadyEnrolled) {
                const myEnrollment = (cls.class_enrollments || []).find(e => e.client_id === user.id)
                if (myEnrollment) await supabase.from('class_enrollments').delete().eq('id', myEnrollment.id)
                setEnrollMsg('✓ Matrícula cancelada de ' + cls.name)
            } else {
                const currentCount = (cls.class_enrollments || []).length
                if (currentCount >= cls.capacity) {
                    setEnrollMsg(`⚠ Esta clase está llena (capacidad: ${cls.capacity})`)
                    setTimeout(() => setEnrollMsg(null), 3000)
                    setEnrolling(false)
                    return
                }
                await supabase.from('class_enrollments').insert({ class_id: cls.id, client_id: user.id, status: 'active' })
                setEnrollMsg('✓ ¡Matriculado en ' + cls.name + '!')
            }
            setTimeout(() => setEnrollMsg(null), 3000)
            loadData()
        } catch {
            setEnrollMsg('Error al procesar la solicitud')
            setTimeout(() => setEnrollMsg(null), 3000)
        } finally {
            setEnrolling(false)
        }
    }

    return (
        <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, marginBottom: 'var(--space-xs)' }}>
                    🗓 Reservar <span className="gradient-text">Clases</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Visualiza tus horarios de entrenamiento y matricúlate en clases grupales de manera fácil.
                </p>
            </div>

            {loading ? (
                <>
                    <SkeletonBlock height={220} />
                    <SkeletonBlock height={320} />
                </>
            ) : (
                <>
                    <ClientCalendar
                        classes={classes}
                        calView={calendarView}
                        setCalendarView={setCalendarView}
                        calendarMonth={calendarMonth}
                        setCalendarMonth={setCalendarMonth}
                    />
                    <ClassesEnrollment
                        membershipName={membership?.membership_type?.name}
                        allClasses={allClasses}
                        user={user}
                        enrollMsg={enrollMsg}
                        enrolling={enrolling}
                        handleEnroll={handleEnroll}
                    />
                </>
            )}
        </div>
    )
}
