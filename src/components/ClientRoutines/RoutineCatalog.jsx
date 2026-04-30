import { FiSearch, FiCheckCircle } from 'react-icons/fi'

const levelColor = { 'Principiante': '#10b981', 'Intermedio': '#f59e0b', 'Avanzado': '#ef4444' }

export default function RoutineCatalog({
    templates, subscribedIds, selectedTemplate,
    search, setSearch, filterLevel, setFilterLevel, onSelect
}) {
    return (
        <div className="card" style={{ width: 340, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--dark-800)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiSearch color="var(--primary-400)" /> Explorar Programas
                </h3>
                <div className="search-bar" style={{ marginBottom: '0.75rem' }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar rutina..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {['all', 'Principiante', 'Intermedio', 'Avanzado'].map(l => (
                        <button key={l}
                            className={`btn btn-sm ${filterLevel === l ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilterLevel(l)}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                            {l === 'all' ? 'Todos' : l}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
                {templates.map((tmpl) => {
                    const isSubscribed = subscribedIds.includes(tmpl.id)
                    const isSelected = selectedTemplate?.id === tmpl.id
                    const lc = levelColor[tmpl.level] || '#94a3b8'

                    return (
                        <div key={tmpl.id}
                            onClick={() => onSelect(tmpl)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.875rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-md)',
                                background: isSelected ? `${tmpl.color}15` : 'transparent',
                                borderLeft: isSelected ? `4px solid ${tmpl.color}` : '4px solid transparent',
                                transition: 'all 0.15s',
                                marginBottom: '0.25rem'
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--dark-700)' }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                        >
                            <span style={{ fontSize: '1.5rem', filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' : 'none' }}>{tmpl.emoji}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    {tmpl.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: lc, fontWeight: 600 }}>{tmpl.level}</div>
                            </div>
                            {isSubscribed && <FiCheckCircle size={18} color="#10b981" />}
                        </div>
                    )
                })}
                {templates.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No se encontraron rutinas
                    </div>
                )}
            </div>
        </div>
    )
}