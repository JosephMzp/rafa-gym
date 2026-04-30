import { FiTarget, FiActivity } from 'react-icons/fi'

export default function GoalsSection({ goals, onOpenCalcModal }) {
    return (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <FiTarget color="var(--danger)" /> Metas Nutricionales
                </h2>
                <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={onOpenCalcModal}>
                    <FiActivity /> Calcular
                </button>
            </div>

            {!goals ? (
                <p style={{ color: 'var(--text-muted)' }}>El cliente no tiene metas asignadas. Usa la calculadora.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {[
                        { label: 'CALORÍAS', value: goals.calories, suffix: 'kcal', color: 'var(--danger)', size: '1.75rem' },
                        { label: 'PROTEÍNAS', value: goals.proteins, suffix: 'g', color: '#ef4444', size: '1.5rem' },
                        { label: 'CARBOHIDRATOS', value: goals.carbs, suffix: 'g', color: '#f59e0b', size: '1.5rem' },
                        { label: 'GRASAS', value: goals.fats, suffix: 'g', color: '#10b981', size: '1.5rem' },
                    ].map(item => (
                        <div key={item.label} style={{ background: 'var(--dark-800)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{item.label}</div>
                            <div style={{ fontSize: item.size, fontWeight: 800, color: item.color }}>
                                {item.value} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.suffix}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}