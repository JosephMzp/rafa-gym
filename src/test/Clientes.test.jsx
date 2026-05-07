import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Clients from '../pages/admin/Clients'

vi.mock('react-icons/fi', () => ({
  FiSearch: () => <span>search-icon</span>,
  FiPlus: () => <span>plus-icon</span>,
}))

vi.mock('../components/clients/ClientsTable', () => ({
  default: ({ clients, onToggleStatus }) => (
    <div data-testid="clients-table">
      {clients.map(c => (
        <div key={c.id}>
          <span>{c.name}</span>
          <button onClick={() => onToggleStatus(c)}>toggle-{c.id}</button>
        </div>
      ))}
    </div>
  )
}))

vi.mock('../components/clients/ClientFormModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="client-form-modal">
      <button onClick={onClose}>cerrar-modal</button>
    </div>
  )
}))

vi.mock('../components/clients/ClientDetailModal', () => ({
  default: () => <div data-testid="client-detail-modal" />
}))

vi.mock('../lib/services', () => ({
  getClients: vi.fn(),
  getMembershipTypes: vi.fn(),
  getLocations: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
}))

import { getClients, getMembershipTypes, getLocations, updateClient } from '../lib/services'

const mockClients = [
  { id: '1', name: 'Juan Pérez',  document: '12345678', status: 'active'   },
  { id: '2', name: 'Ana García',  document: '87654321', status: 'inactive' },
]

beforeEach(() => {
  getClients.mockResolvedValue(mockClients)
  getMembershipTypes.mockResolvedValue([])
  getLocations.mockResolvedValue([])
  updateClient.mockResolvedValue({})
})

describe('Clients', () => {

  it('muestra los clientes después de cargar', async () => {
    render(<Clients />)
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    })
  })

  it('cambia el estado del cliente al hacer toggle', async () => {
    render(<Clients />)
    await waitFor(() => screen.getByText('Juan Pérez'))
    await userEvent.click(screen.getByText('toggle-1'))
    expect(updateClient).toHaveBeenCalledWith('1', { status: 'inactive' })
  })

})