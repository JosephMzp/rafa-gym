import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import ImageUpload from '../ImageUpload'

export default function ClientFormModal({ client, membershipTypes, locations, onSave, onClose }) {
    const [form, setForm] = useState({
        name: client?.name || '', document: client?.document || '', email: client?.email || '',
        phone: client?.phone || '', birth_date: client?.birth_date || '', address: client?.address || '',
        emergency_contact: client?.emergency_contact || '', location_id: client?.location_id || locations[0]?.id || '',
        photo_url: client?.photo_url || '', gender: client?.gender || ''
    })

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                        <ImageUpload
                            currentUrl={form.photo_url}
                            onUpload={({ url }) => handleChange('photo_url', url || '')}
                            folder="rafagym/clients"
                            size={110}
                            fallbackText={form.name?.charAt(0) || '?'}
                        />
                    </div>
                    <div className="form-grid">
                        <div className="form-group"><label className="form-label">Nombre Completo *</label><input className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nombre completo" /></div>
                        <div className="form-group"><label className="form-label">Documento *</label><input className="form-input" value={form.document} onChange={e => handleChange('document', e.target.value)} placeholder="DNI" /></div>
                        <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@ejemplo.com" /></div>
                        <div className="form-group"><label className="form-label">Teléfono *</label><input className="form-input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="987654321" /></div>
                        <div className="form-group"><label className="form-label">Fecha de Nacimiento</label><input className="form-input" type="date" value={form.birth_date} onChange={e => handleChange('birth_date', e.target.value)} /></div>
                        <div className="form-group">
                            <label className="form-label">Género <span style={{ color: 'var(--primary-400)', fontSize: '0.8rem' }}>(requerido para dietas)</span></label>
                            <select className="form-input" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                                <option value="">Seleccionar...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label">Dirección</label><input className="form-input" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Dirección" /></div>
                        <div className="form-group"><label className="form-label">Contacto de Emergencia</label><input className="form-input" value={form.emergency_contact} onChange={e => handleChange('emergency_contact', e.target.value)} placeholder="Nombre - Teléfono" /></div>
                        <div className="form-group">
                            <label className="form-label">Sede *</label>
                            <select className="form-input" value={form.location_id} onChange={e => handleChange('location_id', e.target.value)}>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={() => onSave(form)}>{client ? 'Guardar Cambios' : 'Crear Cliente'}</button>
                </div>
            </div>
        </div>
    )
}