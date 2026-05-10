export default function ReportDataGrid({ columns, rows, rowKey = 'id', emptyMessage = 'Sin datos para el período seleccionado.' }) {
    const thStyle = {
        padding: '0.75rem 1rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--dark-800)',
        whiteSpace: 'nowrap',
    }

    const tdStyle = (align = 'left') => ({
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        textAlign: align,
        verticalAlign: 'middle',
    })

    return (
        <div style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            background: 'var(--dark-800)',
        }}>
            {rows.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.9375rem',
                }}>
                    {emptyMessage}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} style={{ ...thStyle, textAlign: col.align || 'left' }}>
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr
                                    key={row[rowKey] ?? i}
                                    style={{ transition: 'background 0.12s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {columns.map(col => (
                                        <td key={col.key} style={tdStyle(col.align)}>
                                            {col.render ? col.render(row) : row[col.key] ?? '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
