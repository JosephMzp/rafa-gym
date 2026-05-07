import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'

// Public pages
import Home from './pages/public/Home'
import Login from './pages/public/Login'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import Clients from './pages/admin/Clients'
import Attendance from './pages/admin/Attendance'
// Client pages
import ClientDashboard from './pages/client/ClientDashboard'
const ClientDiets = lazy(() => import('./pages/client/Diets'))
const ClientRoutines = lazy(() => import('./pages/client/Routines'))

export default function App() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner spinner-lg"></div>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>Cargando RafaGym...</p>
            </div>
        )
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
            </Route>
            <Route path="/login" element={<Login />} />

            {/* Admin routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'receptionist', 'trainer']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="attendance" element={<Attendance />} />
                </Route>

            {/* Client portal route */}
            <Route
                path="/portal/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <ClientDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/portal/diets"
                element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner spinner-lg"></div></div>}>
                            <ClientDiets />
                        </Suspense>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/portal/routines"
                element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--dark-900)' }}><div className="spinner spinner-lg" style={{ color: 'var(--primary-500)' }}></div></div>}>
                            <ClientRoutines />
                        </Suspense>
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
