export default function ReportKPICards({ cards }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
        }}>
            {cards.map(({ label, value, sub, Icon, color, bg }) => (
                <div
                    key={label}
                    className="card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)',
                        padding: 'var(--space-lg)',
                        borderLeft: `3px solid ${color}`,
                    }}
                >
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color,
                    }}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            fontSize: '1.5rem',
                            lineHeight: 1.1,
                            color: 'var(--text-primary)',
                        }}>
                            {value}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {label}
                        </div>
                        {sub && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                {sub}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
