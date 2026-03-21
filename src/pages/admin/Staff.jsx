import { useState, useEffect } from 'react'
import { FiSearch, FiPlus, FiX, FiEdit2, FiUserX, FiUserCheck, FiUser, FiMail, FiPhone, FiShield } from 'react-icons/fi'
import { getStaff, getRoles, updateStaff } from '../../lib/services'
import { getOptimizedUrl } from '../../lib/cloudinary'
import ImageUpload from '../../components/ImageUpload'

export default function Staff() {
    const [staff, setStaff] = useState([])
    const [roles, setRoles] = useState([])
    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [editingStaff, setEditingStaff] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [s, r] = await Promise.all([getStaff(), getRoles()])
            setStaff(s); setRoles(r)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filtered = staff.filter(s => {
        const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
        const matchRole = filterRole === 'all' || s.role_id === filterRole
        const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? s.active : !s.active)
        return matchSearch && matchRole && matchStatus
    })

    const totalActive = staff.filter(s => s.active).length
    const totalInactive = staff.filter(s => !s.active).length

    const handleEdit = (member) => {
        setEditingStaff(member)
        setShowModal(true)
    }

    const handleToggleStatus = async (member) => {
        try {
            await updateStaff(member.id, { active: !member.active })
            await loadData()
        } catch (err) { console.error(err) }
    }

    const handleSave = async (form) => {
        try {
            await updateStaff(editingStaff.id, {
                name: form.name,
                email: form.email,
                phone: form.phone,
                role_id: form.role_id,
                photo_url: form.photo_url || null
            })
            await loadData()
            setShowModal(false)
            setEditingStaff(null)
        } catch (err) { console.error(err) }
    }

    const getRoleColor = (roleName) => {
        switch (roleName) {
            case 'Administrador': return '#f59e0b'
            case 'Recepcionista': return '#3b82f6'
            case 'Entrenador': return '#10b981'
            default: return '#94a3b8'
        }
    }

    const getRoleIcon = (roleName) => {
        switch (roleName) {
            case 'Administrador': return '👑'
            case 'Recepcionista': return '🖥️'
            case 'Entrenador': return '🏋️'
            default: return '👤'
        }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Empleados</h1>
                    <p className="page-subtitle">Visualiza, edita y gestiona los empleados del gimnasio</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}><FiUser /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Total Personal</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{staff.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiUserCheck /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Activos</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{totalActive}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}><FiUserX /></div>
                    <div className="stat-card-content"><div className="stat-card-label">Inactivos</div><div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{totalInactive}</div></div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-input" style={{ maxWidth: 180 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                    <option value="all">Todos los roles</option>
                    {roles.filter(r => r.name !== 'Cliente').map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    {['all', 'active', 'inactive'].map(s => (
                        <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                            {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Staff Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-lg)' }}>
                {filtered.map(member => {
                    const roleName = member.roles?.name || 'N/A'
                    const roleColor = getRoleColor(roleName)
                    const roleIcon = getRoleIcon(roleName)

                    return (
                        <div key={member.id} className="card" style={{
                            position: 'relative',
                            opacity: member.active ? 1 : 0.6,
                            borderLeft: `3px solid ${roleColor}`,
                            transition: 'all 0.2s ease'
                        }}>
                            {!member.active && (
                                <div style={{
                                    position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)',
                                    background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)',
                                    padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.6875rem', fontWeight: 600
                                }}>INACTIVO</div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: 'var(--space-md)' }}>
                                {member.photo_url ? (
                                    <img src={getOptimizedUrl(member.photo_url, { width: 120, height: 120 })} alt={member.name}
                                        style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${roleColor}40` }} />
                                ) : (
                                    <div className="avatar" style={{
                                        width: 56, height: 56, fontSize: '1.25rem',
                                        background: `${roleColor}20`, color: roleColor,
                                        border: `2px solid ${roleColor}40`
                                    }}>
                                        {member.name?.charAt(0)}
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.125rem' }}>{member.name}</div>
                                    <span className="badge" style={{
                                        background: `${roleColor}18`, color: roleColor,
                                        fontWeight: 600, fontSize: '0.75rem'
                                    }}>
                                        {roleIcon} {roleName}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiMail size={14} color="var(--text-muted)" />
                                    <span>{member.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiPhone size={14} color="var(--text-muted)" />
                                    <span>{member.phone || 'Sin teléfono'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <FiShield size={14} color="var(--text-muted)" />
                                    <span>Desde: {new Date(member.created_at).toLocaleDateString('es-PE')}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
                                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => handleEdit(member)}>
                                    <FiEdit2 size={14} /> Editar
                                </button>
                                <button
                                    className={`btn btn-sm ${member.active ? 'btn-danger' : 'btn-primary'}`}
                                    style={{ flex: 1 }}
                                    onClick={() => handleToggleStatus(member)}
                                >
                                    {member.active ? <><FiUserX size={14} /> Desactivar</> : <><FiUserCheck size={14} /> Activar</>}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <div className="empty-state-title">No se encontraron empleados</div>
                </div>
            )}

            {/* Edit Modal */}
            {showModal && editingStaff && (
                <StaffEditModal
                    staff={editingStaff}
                    roles={roles}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingStaff(null) }}
                />
            )}
        </div>
    )
}

function StaffEditModal({ staff, roles, onSave, onClose }) {
    const [form, setForm] = useState({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role_id: staff.role_id || '',
        photo_url: staff.photo_url || ''
    })

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
    const staffRoles = roles.filter(r => r.name !== 'Cliente')

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">✏️ Editar Empleado</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        {/* Photo Upload */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ImageUpload
                                currentUrl={form.photo_url}
                                onUpload={({ url }) => handleChange('photo_url', url || '')}
                                folder="rafagym/staff"
                                size={100}
                                fallbackText={form.name.charAt(0) || '?'}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre Completo *</label>
                            <input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nombre del empleado" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="correo@ejemplo.com" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="999 999 999" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Rol *</label>
                            <select className="form-input" value={form.role_id} onChange={e => handleChange('role_id', e.target.value)}>
                                {staffRoles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => onSave(form)} disabled={!form.name || !form.email}>
                        <FiEdit2 /> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    )
}
