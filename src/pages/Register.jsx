import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Les mots de passe ne correspondent pas.' })
      return
    }

    setLoading(true)
    try {
      const user = await register(form)
      if (user?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors)
      } else {
        setError(
          err.response?.data?.message ??
          err.response?.data?.error ??
          'Une erreur est survenue lors de l\'inscription.'
        )
      }
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

        <h1 className="auth-title">Créer un compte</h1>
        <p className="auth-subtitle">Rejoignez la plateforme et commencez à gagner</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nom complet</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Jean Dupont"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>
                {Array.isArray(fieldErrors.name) ? fieldErrors.name[0] : fieldErrors.name}
              </p>
            )}
          </div>

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
            {fieldErrors.email && (
              <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>
                {Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
              </p>
            )}
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
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>
                {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password_confirmation">
              Confirmer le mot de passe
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {fieldErrors.password_confirmation && (
              <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>
                {fieldErrors.password_confirmation}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Inscription…
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Créer mon compte
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Déjà inscrit ?{' '}
          <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  )
}
