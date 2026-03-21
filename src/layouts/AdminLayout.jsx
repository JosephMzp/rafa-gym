import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    FiHome, FiUsers, FiCalendar, FiDollarSign, FiAward, FiMapPin,
    FiUserPlus, FiBookOpen, FiActivity, FiBarChart2, FiMenu, FiX,
    FiLogOut, FiChevronLeft, FiUser
} from 'react-icons/fi'
import './AdminLayout.css'

const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/clients', label: 'Clientes', icon: FiUsers },
    { path: '/admin/attendance', label: 'Asistencias', icon: FiCalendar },
    { path: '/admin/payments', label: 'Pagos', icon: FiDollarSign },
    { path: '/admin/memberships', label: 'Membresías', icon: FiAward },
    { path: '/admin/locations', label: 'Sedes', icon: FiMapPin },
    { path: '/admin/guests', label: 'Invitados', icon: FiUserPlus },
    { path: '/admin/classes', label: 'Clases', icon: FiBookOpen },
    { path: '/admin/routines', label: 'Rutinas', icon: FiActivity },
    { path: '/admin/reports', label: 'Reportes', icon: FiBarChart2 },
    { path: '/admin/staff', label: 'Empleados', icon: FiUser }
]

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
            {/* Mobile overlay */}
            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/admin/dashboard" className="sidebar-logo">
                        <span className="logo-icon">💪</span>
                        {!collapsed && <span className="logo-text">Rafa<span className="gradient-text">Gym</span></span>}
                    </Link>
                    <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
                        <FiChevronLeft />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={20} />
                                {!collapsed && <span>{item.label}</span>}
                                {isActive && <div className="sidebar-active-indicator" />}
                            </Link>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="avatar">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        {!collapsed && (
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{user?.name}</span>
                                <span className="sidebar-user-role">{user?.role === 'admin' ? 'Administrador' : user?.role === 'receptionist' ? 'Recepcionista' : 'Entrenador'}</span>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Cerrar sesión">
                        <FiLogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Menu">
                        <FiMenu size={22} />
                    </button>
                    <div className="topbar-right">
                        <div className="topbar-user">
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <span className="topbar-user-name">{user?.name}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content animate-fade-in">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
