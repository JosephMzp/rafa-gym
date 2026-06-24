import { NavLink } from 'react-router-dom'
import { FiZap, FiSun, FiMoon, FiLogOut, FiHome, FiBookOpen, FiCalendar, FiActivity, FiTrendingUp } from 'react-icons/fi'

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_face,q_auto,f_auto/`)
}

const NAV_ITEMS = [
    { to: '/portal/home',         label: 'Inicio',      Icon: FiHome },
    { to: '/portal/classes',      label: 'Clases',      Icon: FiCalendar },
    { to: '/portal/routines',     label: 'Rutinas',     Icon: FiActivity },
    { to: '/portal/diets',        label: 'Dietas',      Icon: FiBookOpen },
    { to: '/portal/measurements', label: 'Medidas',     Icon: FiTrendingUp },
]

export default function ClientNavbar({ user, theme, toggleTheme, handleLogout, onEditClick }) {
    return (
        <header className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        }}>
            <nav style={{
                width: '100%',
                height: '100%',
                padding: '0 var(--space-lg)',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center', 
            }}>
                {/* Columna Izquierda: Logo */}
                <div style={{ display: 'flex', alignItems: 'center', flex: '1 0 0px', minWidth: 0 }}>
                    <NavLink 
                        to="/portal/home" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)', flexShrink: 0 }}
                        onMouseEnter={e => { e.currentTarget.querySelector('.logo-icon').style.transform = 'rotate(15deg) scale(1.1)' }}
                        onMouseLeave={e => { e.currentTarget.querySelector('.logo-icon').style.transform = '' }}
                    >
                        <span 
                            className="logo-icon" 
                            style={{ 
                                fontSize: '1.5rem', 
                                color: 'var(--primary-500)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.45))'
                            }}
                        >
                            <FiZap />
                        </span>
                        <span className="fb-logo-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.02em' }}>
                            Rafa<span className="gradient-text">Gym</span>
                        </span>
                    </NavLink>
                </div>

                {/* Columna Central: Navegación (Tabs) */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    flex: '2 0 0px',
                    maxWidth: '600px',
                }}>
                    {NAV_ITEMS.map(({ to, label, Icon }) => (
                        <NavLink key={to} to={to} className="fb-nav-link" title={label}>
                            <div className="fb-nav-link-bg" />
                            <Icon size={22} style={{ position: 'relative', zIndex: 2 }} />
                            <span className="fb-nav-indicator" />
                        </NavLink>
                    ))}
                </div>

                {/* Columna Derecha: Acciones */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end', 
                    gap: 'var(--space-xs)',
                    flex: '1 0 0px',
                }}>
                    {/* Botón de Perfil (Avatar Circular) */}
                    <button 
                        className="fb-avatar-btn" 
                        onClick={onEditClick} 
                        title={`Ver perfil de ${user?.name || ''}`}
                    >
                        {user?.photo_url ? (
                            <img 
                                src={optimizeUrl(user.photo_url, 72, 72)} 
                                alt={user?.name} 
                                className="fb-avatar-img" 
                            />
                        ) : (
                            <div className="fb-avatar-fallback">
                                {(user?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </button>

                    {/* Divisor vertical */}
                    <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />

                    {/* Botón de Tema (Sol/Luna) */}
                    <button 
                        className="fb-circle-btn" 
                        onClick={toggleTheme} 
                        title="Cambiar tema"
                    >
                        {theme === 'dark' ? <FiSun size={17} /> : <FiMoon size={17} />}
                    </button>

                    {/* Botón de Salir */}
                    <button 
                        className="fb-circle-btn btn-danger" 
                        onClick={handleLogout} 
                        title="Cerrar sesión"
                    >
                        <FiLogOut size={16} />
                    </button>
                </div>
            </nav>
        </header>
    )
}