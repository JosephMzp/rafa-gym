import { Link } from 'react-router-dom'
import { FiZap, FiEdit2, FiSun, FiMoon, FiLogOut } from 'react-icons/fi'

function optimizeUrl(url, w, h) {
    if (!url || !url.includes('cloudinary.com')) return url
    return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_face,q_auto,f_auto/`)
}

export default function ClientNavbar({ user, theme, toggleTheme, handleLogout, onEditClick }) {
    return (
        <nav className="glass" style={{
            padding: '0.75rem var(--space-xl)', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 50
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)' }}>
                <span style={{ fontSize: '1.5rem' }}><FiZap /></span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                    Rafa<span className="gradient-text">Gym</span>
                </span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Link to="/portal/routines"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', transition: 'background 0.2s, border-color 0.2s' }}
                    title="Mis Rutinas"
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'var(--dark-700)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--dark-800)' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mis Rutinas</span>
                </Link>

                <Link to="/portal/diets"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', transition: 'background 0.2s, border-color 0.2s' }}
                    title="Mi Dieta"
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'var(--dark-700)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--dark-800)' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Mi Dieta</span>
                </Link>

                <a href="#mis-datos" onClick={onEditClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer', padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-800)', border: '1px solid var(--border-subtle)', transition: 'background 0.2s, border-color 0.2s' }}
                    title="Editar mis datos"
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'var(--dark-700)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--dark-800)' }}>
                    {user?.photo_url ? (
                        <img src={optimizeUrl(user.photo_url, 64, 64)} alt={user?.name}
                            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }} />
                    ) : (
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.7rem', border: '2px solid var(--primary-500)' }}>
                            {(user?.name || 'C').charAt(0)}
                        </div>
                    )}
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name}</span>
                    <FiEdit2 size={12} color="var(--primary-400)" style={{ marginLeft: '0.25rem' }} />
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Cambiar tema">
                        {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}><FiLogOut size={14} /> Salir</button>
                </div>
            </div>
        </nav>
    )
}