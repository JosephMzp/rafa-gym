import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi'
import { getClients, getAttendances, getLocations } from '../../lib/services'

import AttendanceTabs from '../../components/Attendances/AttendancesTabs'
import AttendanceTable from '../../components/Attendances/AttendancesTable'
import AttendanceFormModal from '../../components/Attendances/AttendancesFromModal'

export default function Attendance() {
    const [attendances, setAttendances] = useState([])
    const [allClients, setAllClients] = useState([])
    const [locations, setLocations] = useState([])
    const [filterSearch, setFilterSearch] = useState('')
    const [selectedLocation, setSelectedLocation] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [a, c, l] = await Promise.all([getAttendances(), getClients(), getLocations()])
            setAttendances(a); setAllClients(c); setLocations(l)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filtered = attendances.filter(a => {
        const matchSearch = !filterSearch || a.client_name?.toLowerCase().includes(filterSearch.toLowerCase())
        const matchLocation = selectedLocation === 'all' || a.location_id === selectedLocation
        return matchSearch && matchLocation
    })

    const handleRegisterSuccess = async () => {
        await loadData()
        setShowModal(false)
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Control de Asistencias</h1>
                    <p className="page-subtitle">Registra y consulta las asistencias de los clientes</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Registrar Asistencia
                </button>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input
                        placeholder="Filtrar por nombre de cliente..."
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <FiFilter color="var(--text-muted)" />
                    <select
                        className="form-input"
                        style={{ maxWidth: 220 }}
                        value={selectedLocation}
                        onChange={e => setSelectedLocation(e.target.value)}
                    >
                        <option value="all">Todas las sedes</option>
                        {locations.map(l => (
                            <option key={l.id} value={l.id}>{l.name.replace('RafaGym - ', '')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <AttendanceTabs attendances={attendances} />

            {/* Tabla */}
            <AttendanceTable attendances={filtered} />

            {/* Registro de asistencia */}
            {showModal && (
                <AttendanceFormModal
                    clients={allClients}
                    locations={locations}
                    attendances={attendances}
                    onSuccess={handleRegisterSuccess}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}