import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { getStaff, getRoles, updateStaff } from '../../lib/services'

import StaffStats from '../../components/Staff/StaffStats'
import StaffGrid from '../../components/Staff/StaffGrid'
import StaffFormModal from '../../components/Staff/StaffFormModal'

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

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Empleados</h1>
                    <p className="page-subtitle">Visualiza, edita y gestiona los empleados del gimnasio</p>
                </div>
            </div>

            <StaffStats staff={staff} />

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

            <StaffGrid
                staff={filtered}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
            />

            {showModal && editingStaff && (
                <StaffFormModal
                    staff={editingStaff}
                    roles={roles}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditingStaff(null) }}
                />
            )}
        </div>
    )
}