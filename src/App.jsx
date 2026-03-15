import { Routes, Route, Navigate } from 'react-router-dom'
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
import Routines from './pages/admin/Routines'
import Reports from './pages/admin/Reports'

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
                <Route path="routines" element={<Routines />} />
                <Route path="reports" element={<Reports />} />
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
