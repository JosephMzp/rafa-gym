import { FiDownload, FiFileText } from 'react-icons/fi'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ExportButtons({ filename, sheetName, columns, rows }) {

    /** .xlsx */
    function handleExcel() {
        const headers = columns.map(c => c.header)
        const data = rows.map(row => columns.map(c => row[c.key] ?? ''))
        const ws = XLSX.utils.aoa_to_sheet([headers, ...data])


        ws['!cols'] = columns.map(() => ({ wch: 22 }))

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
        XLSX.writeFile(wb, `${filename}.xlsx`)
    }

    /** .pdf */
    function handlePDF() {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

        doc.setFontSize(16)
        doc.setTextColor(40, 40, 40)
        doc.text(sheetName, 40, 40)

        doc.setFontSize(9)
        doc.setTextColor(120, 120, 120)
        doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 40, 58)

        autoTable(doc, {
            startY: 70,
            head: [columns.map(c => c.header)],
            body: rows.map(row => columns.map(c => row[c.key] ?? '')),
            styles: { fontSize: 8, cellPadding: 5 },
            headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 40, right: 40 },
        })

        doc.save(`${filename}.pdf`)
    }

    return (
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
                className="btn btn-ghost"
                onClick={handleExcel}
                title="Exportar a Excel"
                style={{ fontSize: '0.8125rem' }}
            >
                <FiDownload size={14} /> Excel
            </button>
            <button
                className="btn btn-ghost"
                onClick={handlePDF}
                title="Exportar a PDF"
                style={{ fontSize: '0.8125rem' }}
            >
                <FiFileText size={14} /> PDF
            </button>
        </div>
    )
}
