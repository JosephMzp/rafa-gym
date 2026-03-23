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
import Payments from './pages/admin/Payments'
import Memberships from './pages/admin/Memberships'
import Locations from './pages/admin/Locations'
import Guests from './pages/admin/Guests'
import Classes from './pages/admin/Classes'
const Routines = lazy(() => import('./pages/admin/Routines'))
import Reports from './pages/admin/Reports'
import Staff from './pages/admin/Staff'
const Exercises = lazy(() => import('./pages/admin/Exercises'))
const Profile = lazy(() => import('./pages/admin/Profile'))

// Client pages
import ClientDashboard from './pages/client/ClientDashboard'

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
                <Route path="payments" element={<Payments />} />
                <Route path="memberships" element={<Memberships />} />
                <Route path="locations" element={<Locations />} />
                <Route path="guests" element={<Guests />} />
                <Route path="classes" element={<Classes />} />
                <Route path="routines" element={<Suspense fallback={<div style={{textAlign:'center',padding:'4rem'}}><div className="spinner spinner-lg"></div></div>}><Routines /></Suspense>} />
                <Route path="reports" element={<Reports />} />
                <Route path="staff" element={<Staff />} />
                <Route path="exercises" element={<Suspense fallback={<div style={{textAlign:'center',padding:'4rem'}}><div className="spinner spinner-lg"></div></div>}><Exercises /></Suspense>} />
                <Route path="profile" element={<Suspense fallback={<div style={{textAlign:'center',padding:'4rem'}}><div className="spinner spinner-lg"></div></div>}><Profile /></Suspense>} />
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

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
