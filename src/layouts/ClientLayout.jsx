import { useState, useEffect, Suspense } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ClientNavbar from '../components/ClientDashboard/ClientNavbar'
import FloatingChat from '../components/ClientDashboard/FloatingChat'

/** Skeleton mínimo mientras carga la sub-ruta */
function PageSkeleton() {
    return (
        <div style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: 1100, margin: '0 auto' }}>
            <div className="skeleton" style={{ height: 'var(--space-2xl)', width: '40%', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-lg)' }} />
            <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-md)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
            </div>
        </div>
    )
}

export default function ClientLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [theme, setTheme] = useState(
        () => localStorage.getItem('rafagym-theme') || 'dark'
    )

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('rafagym-theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-900)' }}>
            <ClientNavbar
                user={user}
                theme={theme}
                toggleTheme={toggleTheme}
                handleLogout={handleLogout}
                // onEditClick ya no hace scroll; navega a /portal/profile
                onEditClick={() => navigate('/portal/profile')}
            />

            <main>
                <Suspense fallback={<PageSkeleton />}>
                    <Outlet />
                </Suspense>
            </main>

            <FloatingChat />
        </div>
    )
}
