import { useState, useEffect } from 'react'
import { FiSearch, FiPlus } from 'react-icons/fi'
import { getClients, getMembershipTypes, getLocations, createClient, updateClient } from '../../lib/services'

import ClientsTable from '../../components/clients/ClientsTable'
import ClientFormModal from '../../components/clients/ClientFormModal'
import ClientDetailModal from '../../components/clients/ClientDetailModal'

export default function Clients() {
    const [clients, setClients] = useState([])
    const [membershipTypes, setMembershipTypes] = useState([])
    const [locations, setLocations] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [loading, setLoading] = useState(true)

    const [showFormModal, setShowFormModal] = useState(false)
    const [editingClient, setEditingClient] = useState(null)
    const [selectedClient, setSelectedClient] = useState(null)

    useEffect(() => { loadData() }, [])
    async function loadData() {
        try {
            const [c, m, l] = await Promise.all([getClients(), getMembershipTypes(), getLocations()])
            setClients(c); setMembershipTypes(m); setLocations(l)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const filteredClients = clients.filter(c => {
        const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.document?.includes(search)
        const matchStatus = filterStatus === 'all' || c.status === filterStatus
        return matchSearch && matchStatus
    })

    const handleToggleStatus = async (client) => {
        try {
            const newStatus = client.status === 'active' ? 'inactive' : 'active'
            await updateClient(client.id, { status: newStatus })
            setClients(prev => prev.map(c => c.id === client.id ? { ...c, status: newStatus } : c))
        } catch (err) { console.error(err) }
    }

    const handleSaveClient = async (formData) => {
        try {
            if (editingClient) await updateClient(editingClient.id, formData)
            else await createClient(formData)
            await loadData()
            setShowFormModal(false)
            setEditingClient(null)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">Gestiona los clientes del gimnasio</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingClient(null); setShowFormModal(true) }}>
                    <FiPlus /> Nuevo Cliente
                </button>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ flex: 1 }}>
                    <span className="search-bar-icon"><FiSearch /></span>
                    <input placeholder="Buscar por nombre, documento o email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                    {['all', 'active', 'inactive'].map(s => (
                        <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
                            {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
                        </button>
                    ))}
                </div>
            </div>

            <ClientsTable
                clients={filteredClients}
                onViewDetail={setSelectedClient}
                onEditClient={(c) => { setEditingClient(c); setShowFormModal(true) }}
                onToggleStatus={handleToggleStatus}
            />

            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onEdit={() => { setEditingClient(selectedClient); setSelectedClient(null); setShowFormModal(true) }}
                />
            )}

            {showFormModal && (
                <ClientFormModal
                    client={editingClient}
                    membershipTypes={membershipTypes}
                    locations={locations}
                    onSave={handleSaveClient}
                    onClose={() => { setShowFormModal(false); setEditingClient(null) }}
                />
            )}
        </div>
    )
}