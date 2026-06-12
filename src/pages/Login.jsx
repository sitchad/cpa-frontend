import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form)
      // Redirection selon le rôle
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        'Identifiants incorrects. Veuillez réessayer.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">C</div>
          <span className="auth-logo-text">CPA Platform</span>
        </div>

        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Accédez à votre espace membre</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Connexion…
              </>
            ) : (
              <>
                <LogIn size={16} />
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Pas encore de compte ?{' '}
          <Link to="/register">Créer un compte</Link>
        </div>
      </div>
    </div>
  )
}
