import { FiSearch, FiActivity, FiPlus, FiX } from 'react-icons/fi'

export default function DietSearchModal({
    showModal, selectedMeal, searchQuery, searchResults,
    searching, onClose, onSearchChange, onAddFood
}) {
    if (!showModal || !selectedMeal) return null

    const SelectedIcon = selectedMeal.icon

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(12px)', background: 'rgba(0,0,0,0.6)', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
            <div className="modal glass" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', borderRadius: '1.5rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: selectedMeal.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedMeal.color }}>
                            <SelectedIcon size={18} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{selectedMeal.label}</h2>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
                </div>

                {/* Input Búsqueda */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-400)', fontSize: '1.1rem' }} />
                    <input
                        className="form-input"
                        style={{ paddingLeft: 48, height: 52, fontSize: '1rem', background: 'var(--dark-800)', borderRadius: '12px' }}
                        placeholder="Ej. Pechuga de pollo, Arroz..."
                        value={searchQuery}
                        onChange={onSearchChange}
                        autoFocus
                    />
                </div>

                {/* Resultados */}
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                    {searching && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem' }}>
                            <div className="spinner spinner-md" style={{ color: 'var(--primary-500)', marginBottom: '1rem' }} />
                            <span style={{ color: 'var(--text-muted)' }}>Buscando...</span>
                        </div>
                    )}

                    {!searching && searchQuery && searchResults.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Sin resultados</p>
                        </div>
                    )}

                    {!searching && searchResults.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {searchResults.map((food) => (
                                <div key={food.id} onClick={() => onAddFood(food)} style={{ padding: '1rem', background: 'var(--dark-800)', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{food.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: 6 }}>
                                            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{food.calories} kcal</span>
                                            <span>{food.proteins}g P</span>
                                        </div>
                                    </div>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiPlus size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}