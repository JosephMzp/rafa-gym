import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../pages/public/Login'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin })
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

vi.mock('../pages/public/Login.css', () => ({}))

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

beforeEach(() => {
  mockLogin.mockReset()
  mockNavigate.mockReset()
})

describe('Login', () => {

  it('muestra error si las credenciales son incorrectas', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Credenciales inválidas' })

    render(<Login />)
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'malo@email.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await userEvent.click(screen.getByText('Ingresar'))

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })

  it('redirige al admin dashboard si el login es exitoso como admin', async () => {
    mockLogin.mockResolvedValue({ success: true, user: { role: 'admin' } })

    render(<Login />)
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'admin@rafagym.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'admin123')
    await userEvent.click(screen.getByText('Ingresar'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard')
    })
  })

})