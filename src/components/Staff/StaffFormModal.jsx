import { useState } from 'react'
import { FiX, FiEdit2 } from 'react-icons/fi'
import ImageUpload from '../ImageUpload'

export default function StaffFormModal({ staff, roles, onSave, onClose }) {
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