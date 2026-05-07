import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Attendance from '../pages/admin/Attendance'

vi.mock('react-icons/fi', () => ({
  FiSearch: () => <span>search-icon</span>,
  FiFilter: () => <span>filter-icon</span>,
  FiPlus: () => <span>plus-icon</span>,
}))

vi.mock('../components/Attendances/AttendancesTabs', () => ({
  default: () => <div data-testid="attendance-tabs" />
}))

vi.mock('../components/Attendances/AttendancesTable', () => ({
  default: ({ attendances }) => (
    <div data-testid="attendance-table">
      {attendances.map(a => <div key={a.id}>{a.client_name}</div>)}
    </div>
  )
}))

vi.mock('../components/Attendances/AttendancesFromModal', () => ({
  default: ({ onClose }) => (
    <div data-testid="attendance-modal">
      <button onClick={onClose}>cerrar-modal</button>
    </div>
  )
}))

vi.mock('../lib/services', () => ({
  getAttendances: vi.fn(),
  getClients: vi.fn(),
  getLocations: vi.fn(),
}))

import { getAttendances, getClients, getLocations } from '../lib/services'

const mockAttendances = [
  { id: '1', client_name: 'Juan Pérez',  location_id: 'loc1' },
  { id: '2', client_name: 'Ana García',  location_id: 'loc2' },
]

beforeEach(() => {
  getAttendances.mockResolvedValue(mockAttendances)
  getClients.mockResolvedValue([])
  getLocations.mockResolvedValue([])
})

describe('Attendance', () => {

  it('muestra las asistencias después de cargar', async () => {
    render(<Attendance />)
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('Ana García')).toBeInTheDocument()
    })
  })

  it('filtra asistencias por nombre al buscar', async () => {
    render(<Attendance />)
    await waitFor(() => screen.getByText('Juan Pérez'))

    await userEvent.type(screen.getByPlaceholderText(/filtrar por nombre/i), 'Ana')

    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument()
  })

})