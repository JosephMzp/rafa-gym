import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import { getGuests, getClients, getLocations, createGuest } from '../../lib/services'

import GoldClientsCards from '../../components/Guests/GoldClientsCards'
import GuestsTable from '../../components/Guests/GuestsTable'
import GuestFormModal from '../../components/Guests/GuestFormModal'

export default function Guests() {
    const [guests, setGuests] = useState([])
    const [allClients, setAllClients] = useState([])
    const [locations, setLocations] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            const [g, c, l] = await Promise.all([getGuests(), getClients(), getLocations()])
            setGuests(g); setAllClients(c); setLocations(l)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const goldClients = allClients.filter(c => c.membership_type?.name === 'Gold' && c.status === 'active')
    const getGuestCount = (clientId) => guests.filter(g => g.host_client_id === clientId).length

    const handleSave = async (form) => {
        try {
            await createGuest({
                name: form.name,
                document: form.document,
                host_client_id: form.host_client_id,
                location_id: form.location_id || locations[0]?.id,
                visit_date: form.date
            })
            await loadData()
            setShowModal(false)
        } catch (err) { console.error(err) }
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner spinner-lg"></div></div>

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Invitados</h1>
                    <p className="page-subtitle">Registro de invitados de membresía Gold (máx. 5/mes)</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus /> Registrar Invitado
                </button>
            </div>

            <GoldClientsCards
                goldClients={goldClients}
                getGuestCount={getGuestCount}
            />

            <GuestsTable
                guests={guests}
            />

            {showModal && (
                <GuestFormModal
                    goldClients={goldClients}
                    locations={locations}
                    getGuestCount={getGuestCount}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    )
}