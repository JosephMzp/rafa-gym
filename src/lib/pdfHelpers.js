import jsPDF from 'jspdf'

// ─── Paleta de colores (Modo Claro / Profesional) ─────────────────────────────
const TEXT_MAIN = [15, 23, 42]    // slate-900 (Casi negro, muy legible)
const TEXT_MUTED = [100, 116, 139] // slate-500 (Para etiquetas secundarias)
const ACCENT = [99, 102, 241]  // indigo-500 (Toque de color para la marca)
const BORDER = [226, 232, 240] // slate-200 (Líneas sutiles)
const SUCCESS = [16, 185, 129]  // emerald-500 (Pagado)
const DANGER = [239, 68, 68]   // red-500 (Vencido)
const PENDING = [245, 158, 11]  // amber-500 (Registrado/Pendiente)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const setColor = (doc, rgb) => doc.setTextColor(...rgb)
const setFill = (doc, rgb) => doc.setFillColor(...rgb)
const setStroke = (doc, rgb) => doc.setDrawColor(...rgb)

function formatDate(rawDate) {
    if (!rawDate) return '—'
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return String(rawDate)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function wrapText(doc, text, maxWidth) {
    return doc.splitTextToSize(String(text ?? ''), maxWidth)
}

// ─────────────────────────────────────────────────────────────────────────────
//  FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export function generarVoucherPDF(pagoData) {
    // ── Normalizar campos ────────────────────────────────────────────────────
    const clientName = pagoData.client_name || pagoData.name || 'Cliente'
    const concept = pagoData.concept || 'Pago'
    const method = pagoData.method || '—'
    const amount = Number(pagoData.amount ?? 0).toFixed(2)
    const payDate = formatDate(pagoData.date)
    const nextDue = pagoData.next_due ? formatDate(pagoData.next_due) : null
    const receiptId = pagoData.id ? String(pagoData.id).slice(0, 8).toUpperCase() : '—'

    let statusText = 'REGISTRADO'
    let statusColor = PENDING
    if (pagoData.status === 'paid') { statusText = 'PAGADO'; statusColor = SUCCESS }
    if (pagoData.status === 'overdue') { statusText = 'VENCIDO'; statusColor = DANGER }

    const generatedAt = (() => {
        const now = new Date()
        const pad = n => String(n).padStart(2, '0')
        return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    })()

    // ── Crear documento (80mm ancho térmico) ─────────────────────────────────
    const W = 80
    const H = 150 // Altura reducida y ajustada al contenido
    const doc = new jsPDF({ unit: 'mm', format: [W, H], orientation: 'portrait' })

    const margin = 6
    const innerW = W - margin * 2
    const cx = W / 2
    let y = 12

    // Fondo blanco por defecto (no es necesario dibujarlo)

    // ── Cabecera / Marca ─────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    setColor(doc, TEXT_MAIN)
    doc.text('RAFA GYM', cx, y, { align: 'center' })

    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setColor(doc, ACCENT)
    doc.text('COMPROBANTE DE PAGO', cx, y, { align: 'center' })

    // ── Línea separadora superior ────────────────────────────────────────────
    y += 4
    doc.setLineWidth(0.3)
    setStroke(doc, BORDER)
    doc.line(margin, y, W - margin, y)

    // ── N.º de recibo + Fecha generación ─────────────────────────────────────
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setColor(doc, TEXT_MUTED)
    doc.text(`Recibo #${receiptId}`, margin, y)
    doc.text(generatedAt, W - margin, y, { align: 'right' })

    // ── Importe Principal ────────────────────────────────────────────────────
    y += 14
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    setColor(doc, TEXT_MAIN)
    doc.text(`S/ ${amount}`, cx, y, { align: 'center' })

    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setColor(doc, TEXT_MUTED)
    doc.text('Total Pagado', cx, y, { align: 'center' })

    // ── Badge de Estado Dinámico (Estilo Píldora) ────────────────────────────
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    const badgeW = doc.getTextWidth(statusText) + 10 // Padding dinámico
    setFill(doc, statusColor)
    // Coordenadas: X central - mitad del ancho, Y, Ancho, Alto, Radio bordes
    doc.roundedRect(cx - (badgeW / 2), y, badgeW, 5.5, 2.5, 2.5, 'F')

    setColor(doc, [255, 255, 255])
    doc.text(statusText, cx, y + 4, { align: 'center' })

    // ── Detalle del Pago (Tabla estructurada) ────────────────────────────────
    y += 14

    const drawRow = (label, value, highlight = false) => {
        // Etiqueta (Izquierda)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        setColor(doc, TEXT_MUTED)
        doc.text(label, margin, y)

        // Valor (Derecha)
        const lines = wrapText(doc, value, innerW - 25)
        doc.setFont('helvetica', highlight ? 'bold' : 'normal')
        setColor(doc, TEXT_MAIN)

        lines.forEach((line, i) => {
            doc.text(line, W - margin, y + (i * 3.5), { align: 'right' })
        })

        // Calcular salto de línea
        const rowH = Math.max(6, lines.length * 3.5 + 2)
        y += rowH

        // Línea divisoria muy fina
        doc.setLineWidth(0.1)
        setStroke(doc, BORDER)
        doc.line(margin, y - 2, W - margin, y - 2)
        y += 2.5
    }

    drawRow('Cliente', clientName, true)
    drawRow('Concepto', concept, false)
    drawRow('Método de pago', method, false)
    drawRow('Fecha de pago', payDate, false)
    if (nextDue) drawRow('Vencimiento', nextDue, true)

    // ── Separador estilo "Corte" ─────────────────────────────────────────────
    y += 5
    doc.setLineWidth(0.25)
    setStroke(doc, [203, 213, 225]) // slate-300
    doc.setLineDash([1.5, 1.5], 0)
    doc.line(margin, y, W - margin, y)
    doc.setLineDash([], 0) // Resetear dash

    // ── Mensaje de agradecimiento ────────────────────────────────────────────
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    setColor(doc, ACCENT)
    doc.text('¡Gracias por tu preferencia!', cx, y, { align: 'center' })

    y += 4.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setColor(doc, TEXT_MUTED)
    const thanksLines = wrapText(doc, 'Tu constancia es nuestra motivación. ¡Sigue entrenando duro!', innerW - 10)
    thanksLines.forEach((line, i) => {
        doc.text(line, cx, y + (i * 3.5), { align: 'center' })
    })

    // ── Pie de página ────────────────────────────────────────────────────────
    const footerY = H - 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setColor(doc, [148, 163, 184]) // slate-400
    doc.text('rafagym.app', cx, footerY, { align: 'center' })

    // ── Descarga ─────────────────────────────────────────────────────────────
    const safeName = clientName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').trim().replace(/\s+/g, '_')
    doc.save(`Voucher_RafaGym_${safeName}.pdf`)
}