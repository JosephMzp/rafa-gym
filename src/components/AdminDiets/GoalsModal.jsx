import { FiActivity, FiTarget } from 'react-icons/fi'

export default function GoalsModal({ show, onClose, objetivo, setObjetivo, calculating, calcError, onCalculate }) {
    if (!show) return null

    return (
        <div className="modal-overlay" onClick={() => !calculating && onClose()} style={{ backdropFilter: 'blur(12px)', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal" style={{ maxWidth: 500, width: '95%', padding: 0, background: 'var(--dark-800)', border: '1px solid var(--dark-700)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div style={{ background: 'linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <FiActivity size={24} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', margin: 0, color: '#fff' }}>Calculadora Metabólica</h2>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>Fórmula de Mifflin-St Jeor</p>
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ background: 'var(--dark-900)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', border: '1px dashed var(--dark-700)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 600 }}>Requisitos para el cálculo:</p>
                        <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, paddingLeft: 10, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Rutina activa</strong> asignada</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Medición corporal</strong> con peso y altura</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'var(--success)' }}>✓</span> <strong>Género y Fecha Nac.</strong> en perfil</li>
                        </ul>
                    </div>

                    {calcError && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px 16px', color: '#f87171', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: 10, alignItems: 'center' }}>
                            <FiActivity size={16} style={{ flexShrink: 0 }} /><span>{calcError}</span>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Objetivo del Cliente</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                className="form-input"
                                value={objetivo}
                                onChange={e => setObjetivo(e.target.value)}
                                style={{ background: 'var(--dark-900)', border: '2px solid var(--dark-700)', height: 50, fontSize: '1rem', color: 'var(--text-primary)', padding: '0 16px', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                onFocus={e => e.target.style.borderColor = 'var(--danger)'}
                                onBlur={e => e.target.style.borderColor = 'var(--dark-700)'}
                            >
                                <option value="Mantener peso">⚖️ Mantener peso actual</option>
                                <option value="Bajar de peso">🔥 Bajar de peso (Déficit -500 kcal)</option>
                                <option value="Subir masa muscular">💪 Subir masa muscular (+300 kcal)</option>
                            </select>
                            <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▼</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--dark-700)' }}>
                        <button className="btn btn-ghost" onClick={onClose} disabled={calculating} style={{ padding: '0.75rem 1.5rem' }}>Cancelar</button>
                        <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.75rem 1.5rem', minWidth: 160, display: 'flex', justifyContent: 'center', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }} onClick={onCalculate} disabled={calculating}>
                            {calculating ? <><div className="spinner spinner-sm" style={{ marginRight: 8, borderColor: '#fff', borderTopColor: 'transparent' }} /> Procesando...</> : <><FiTarget style={{ marginRight: 8 }} /> Generar Metas</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}