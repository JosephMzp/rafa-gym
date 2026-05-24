
const DAY_LABELS = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mié',
    thursday: 'Jue',
    friday: 'Vie',
    saturday: 'Sáb',
    sunday: 'Dom',
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const DAY_FULL = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
}


export function fmtTime(t) {
    if (!t) return ''
    return t.slice(0, 5) // "09:00:00" → "09:00"
}


export function sortDays(days = []) {
    return [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
}


export function formatDays(days = []) {
    return sortDays(days)
        .map(d => DAY_LABELS[d] ?? d)
        .join(', ')
}


export function formatSchedule(days = [], start_time = '', end_time = '') {
    const daysStr = formatDays(days)
    const startStr = fmtTime(start_time)
    const endStr = fmtTime(end_time)

    if (!daysStr && !startStr) return '—'
    if (!startStr) return daysStr
    if (!endStr) return `${daysStr} ${startStr}`
    return `${daysStr} de ${startStr} a ${endStr}`
}

export function getDayFullNames(days = []) {
    return days.map(d => DAY_FULL[d] ?? d)
}

export { DAY_ORDER, DAY_LABELS, DAY_FULL }
