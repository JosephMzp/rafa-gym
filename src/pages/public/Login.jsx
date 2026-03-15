import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(email, password)
        setLoading(false)

        if (result.success) {
            const role = result.user.role
            if (role === 'client') {
                navigate('/portal/dashboard')
            } else {
                navigate('/admin/dashboard')
            }
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-glow" />
            </div>
            <div className="login-card glass animate-slide-up">
                <div className="login-header">
                    <div className="login-logo">
                        <span>💪</span>
                        <span className="logo-text">Rafa<span className="gradient-text">Gym</span></span>
                    </div>
                    <h1 className="login-title">Iniciar Sesión</h1>
                    <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Ingresar'}
                    </button>
                </form>

                <div className="login-demo">
                    <p className="login-demo-title">Cuentas demo:</p>
                    <div className="login-demo-accounts">
                        <button className="login-demo-btn" onClick={() => { setEmail('admin@rafagym.com'); setPassword('admin123') }}>
                            👨‍💼 Admin
                        </button>
                        <button className="login-demo-btn" onClick={() => { setEmail('recepcion@rafagym.com'); setPassword('recepcion123') }}>
                            🧑‍💻 Recepción
                        </button>
                        <button className="login-demo-btn" onClick={() => { setEmail('entrenador@rafagym.com'); setPassword('entrenador123') }}>
                            🏋️ Entrenador
                        </button>
                        <button className="login-demo-btn" onClick={() => { setEmail('carlos@email.com'); setPassword('carlos123') }}>
                            👤 Cliente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
