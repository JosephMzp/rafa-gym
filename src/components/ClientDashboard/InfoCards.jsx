import { FiCalendar, FiDollarSign, FiBookOpen, FiUser, FiClock, FiMapPin, FiMail, FiPhone, FiEdit2 } from 'react-icons/fi'

export default function InfoCards({
    user, attendances, payments, classes, classesCount, totalAttendances,
    lastPayment, editing, setEditing, startEditing,
    editName, setEditName, editPhone, setEditPhone,
    editAddress, setEditAddress, editEmergency, setEditEmergency,
    saving, saveProfile
}) {
    return (
        <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--primary-400)' }}><FiCalendar /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Asistencias</div>
                        <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{totalAttendances}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><FiDollarSign /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Ultimo Pago</div>
                        <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                            S/ {lastPayment ? Number(lastPayment.amount).toFixed(0) : '0'}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><FiBookOpen /></div>
                    <div className="stat-card-content">
                        <div className="stat-card-label">Clases</div>
                        <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{classesCount}</div>
                    </div>
                </div>
            </div>

            {/* Asistencias y Pagos Recientes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiCalendar color="var(--primary-400)" /> Ultimas Asistencias
                    </h3>
                    {attendances.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay asistencias registradas</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {attendances.map(a => {
                                const date = new Date(a.check_in)
                                return (
                                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiClock size={12} color="var(--text-muted)" />
                                            <span>{date.toLocaleDateString('es-PE')}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                            {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                            {a.location ? ' • ' + a.location.name : ''}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiDollarSign color="var(--success)" /> Ultimos Pagos
                    </h3>
                    {payments.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>No hay pagos registrados</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {payments.map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--dark-600)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.concept}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.date} • {p.method}</div>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9375rem' }}>
                                        S/ {Number(p.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mis Datos Personales */}
            <div className="card" id="mis-datos">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUser color="var(--primary-400)" /> Mis Datos
                    </h3>
                    {!editing && (
                        <button className="btn btn-sm btn-secondary" onClick={startEditing}>
                            <FiEdit2 size={14} /> Editar
                        </button>
                    )}
                </div>

                {editing ? (
                    <div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label"><FiUser size={12} /> Nombre</label>
                                <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiMail size={12} /> Email</label>
                                <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiPhone size={12} /> Telefono</label>
                                <input className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Direccion</label>
                                <input className="form-input" value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contacto de Emergencia</label>
                                <input className="form-input" value={editEmergency} onChange={e => setEditEmergency(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Documento</label>
                                <input className="form-input" value={user?.document || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', marginTop: 'var(--space-lg)' }}>
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={saveProfile} disabled={saving || !editName}>
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="form-grid">
                        {[
                            ['Nombre', user?.name], ['Documento', user?.document], ['Email', user?.email],
                            ['Telefono', user?.phone], ['Fecha de Nacimiento', user?.birth_date],
                            ['Direccion', user?.address], ['Contacto de Emergencia', user?.emergency_contact]
                        ].map(item => (
                            <div key={item[0]} className="form-group">
                                <span className="form-label">{item[0]}</span>
                                <span style={{ fontSize: '0.9375rem' }}>{item[1] || '-'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}