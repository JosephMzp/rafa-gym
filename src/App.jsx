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
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Clients = lazy(() => import('./pages/admin/Clients'))
const Attendance = lazy(() => import('./pages/admin/Attendance'))
const Payments = lazy(() => import('./pages/admin/Payments'))
const Memberships = lazy(() => import('./pages/admin/Memberships'))
const Locations = lazy(() => import('./pages/admin/Locations'))
const Guests = lazy(() => import('./pages/admin/Guests'))
const Classes = lazy(() => import('./pages/admin/Classes'))
const Routines = lazy(() => import('./pages/admin/Routines'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const Staff = lazy(() => import('./pages/admin/Staff'))
const Exercises = lazy(() => import('./pages/admin/Exercises'))
const Profile = lazy(() => import('./pages/admin/Profile'))
const Measurements = lazy(() => import('./pages/admin/Measurements'))
const AdminDiets = lazy(() => import('./pages/admin/Diets'))

// Client pages
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'))
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
                <Route path="payments" element={<Payments />} />
                <Route path="memberships" element={<Memberships />} />
                <Route path="locations" element={<Locations />} />
                <Route path="guests" element={<Guests />} />
                <Route path="classes" element={<Classes />} />
                <Route path="routines" element={<Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>}><Routines /></Suspense>} />
                <Route path="reports" element={<Reports />} />
                <Route path="staff" element={<Staff />} />
                <Route path="measurements" element={<Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>}><Measurements /></Suspense>} />
                <Route path="diets" element={<Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>}><AdminDiets /></Suspense>} />
                <Route path="exercises" element={<Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>}><Exercises /></Suspense>} />
                <Route path="profile" element={<Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>}><Profile /></Suspense>} />
            </Route>

            {/* Client portal route */}
            <Route
                path="/portal/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['client']}>
                        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--dark-900)' }}><div className="spinner spinner-lg" style={{ color: 'var(--primary-500)' }}></div></div>}>
                            <ClientDashboard />
                        </Suspense>
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
