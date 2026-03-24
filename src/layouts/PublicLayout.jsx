import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'
import './PublicLayout.css'

export default function PublicLayout() {
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    const navLinks = [
        { label: 'Inicio', href: '#hero' },
        { label: 'Servicios', href: '#servicios' },
        { label: 'Membresías', href: '#membresias' },
        { label: 'Sedes', href: '#sedes' },
        { label: 'Contacto', href: '#contacto' }
    ]

    // Theme toggle
    const [theme, setTheme] = useState(localStorage.getItem('rafagym-theme') || 'dark')
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('rafagym-theme', theme)
    }, [theme])
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

    const isHome = location.pathname === '/'

    return (
        <div className="public-layout">
            <nav className="public-nav glass">
                <div className="container public-nav-inner">
                    <Link to="/" className="public-logo">
                        <span className="logo-icon">💪</span>
                        <span className="logo-text">Rafa<span className="gradient-text">Gym</span></span>
                    </Link>

                    <div className={`public-nav-links ${menuOpen ? 'open' : ''}`}>
                        {isHome ? navLinks.map(l => (
                            <a key={l.href} href={l.href} className="nav-link" onClick={() => setMenuOpen(false)}>
                                {l.label}
                            </a>
                        )) : (
                            <Link to="/" className="nav-link">Inicio</Link>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Cambiar tema" style={{ color: 'var(--text-primary)' }}>
                                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
                            </button>
                            <Link to="/login" className="btn btn-primary btn-sm nav-cta" onClick={() => setMenuOpen(false)}>
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>

            <footer className="public-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="public-logo">
                                <span className="logo-icon">💪</span>
                                <span className="logo-text">Rafa<span className="gradient-text">Gym</span></span>
                            </div>
                            <p className="footer-desc">
                                Tu gimnasio de confianza con 3 sedes. Transforma tu cuerpo y tu vida con nosotros.
                            </p>
                        </div>
                        <div className="footer-col">
                            <h4>Horarios</h4>
                            <p>Lun - Sab: 5:00am - 10:00pm</p>
                            <p>Domingos: Cerrado</p>
                        </div>
                        <div className="footer-col">
                            <h4>Contacto</h4>
                            <p>info@rafagym.com</p>
                            <p>+51 987 654 321</p>
                        </div>
                        <div className="footer-col">
                            <h4>Síguenos</h4>
                            <div className="footer-social">
                                <a href="#" aria-label="Facebook">📘</a>
                                <a href="#" aria-label="Instagram">📸</a>
                                <a href="#" aria-label="TikTok">🎵</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 RafaGym. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
