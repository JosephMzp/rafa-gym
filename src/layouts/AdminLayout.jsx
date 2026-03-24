import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    FiHome, FiUsers, FiCalendar, FiDollarSign, FiSettings, FiLogOut, FiMenu, FiX, FiMapPin, FiActivity, FiTarget, FiSun, FiMoon, FiAward, FiUserPlus, FiBookOpen, FiBarChart2, FiChevronLeft, FiUser
} from 'react-icons/fi'
import { getOptimizedUrl } from '../lib/cloudinary'
import './AdminLayout.css'

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const auth = useAuth()
    const { logout } = auth
    const user = auth.user
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    // Theme toggle
    const [theme, setTheme] = useState(localStorage.getItem('rafagym-theme') || 'dark')
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('rafagym-theme', theme)
    }, [theme])
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

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
        { path: '/admin/exercises', label: 'Ejercicios', icon: FiTarget },
        { path: '/admin/reports', label: 'Reportes', icon: FiBarChart2 },
        { path: '/admin/staff', label: 'Empleados', icon: FiUser }
    ]

    return (
        <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
            {/* Mobile overlay */}
            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/admin/dashboard" className="sidebar-logo">
                        <span className="logo-icon">💪</span>
                        {!collapsed && <span className="logo-text">Rafa<span className="gradient-text">Gym</span></span>}
                    </NavLink>
                    <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
                        <FiChevronLeft />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon size={20} />
                                {!collapsed && <span>{item.label}</span>}
                                {isActive && <div className="sidebar-active-indicator" />}
                            </NavLink>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    <NavLink to="/admin/profile" className="sidebar-user" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                        {user?.photo_url ? (
                            <img src={getOptimizedUrl(user.photo_url, { width: 80, height: 80 })} alt={user?.name}
                                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div className="avatar">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        )}
                        {!collapsed && (
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">{user?.name}</span>
                                <span className="sidebar-user-role">{user?.role === 'admin' ? 'Administrador' : user?.role === 'receptionist' ? 'Recepcionista' : 'Entrenador'}</span>
                            </div>
                        )}
                    </NavLink>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Cambiar tema">
                                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
                            </button>

                            <NavLink to="/admin/profile" className="topbar-user" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                {user?.photo_url ? (
                                    <img src={getOptimizedUrl(user.photo_url, { width: 64, height: 64 })} alt={user?.name}
                                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                        {user?.name?.charAt(0) || 'A'}
                                    </div>
                                )}
                                <span className="topbar-user-name">{user?.name}</span>
                            </NavLink>
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
