export default function GoldClientsCards({ goldClients, getGuestCount }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {goldClients.map(c => {
                const count = getGuestCount(c.id)
                return (
                    <div key={c.id} className="card" style={{ padding: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>{c.name.charAt(0)}</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🥇 Gold</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: count >= 5 ? 'var(--danger)' : 'var(--success)' }}>
                                    {count}/5
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>este mes</div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}