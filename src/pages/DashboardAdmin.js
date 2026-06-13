// pages/AdminDashboard.js
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, TrendingUp, AlertTriangle, DollarSign, Eye, Ban, CheckCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { adminAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function formatAmount(val) {
  if (val === undefined || val === null) return '0.00'
  return parseFloat(val).toFixed(2)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Charger les statistiques
      const statsRes = await adminAPI.stats()
      console.log('Stats:', statsRes.data)
      setStats(statsRes.data.data)
      
      // Charger les utilisateurs
      const usersRes = await adminAPI.getUsers()
      console.log('Users:', usersRes.data)
      setUsers(usersRes.data.data.data || [])
      
      // Charger les retraits en attente
      const withdrawalsRes = await adminAPI.getWithdrawals({ status: 'pending' })
      setWithdrawals(withdrawalsRes.data.data.data || [])
      
    } catch (err) {
      console.error('Erreur chargement admin:', err)
      setError('Impossible de charger les données administrateur')
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId) => {
    if (!window.confirm('Bannir cet utilisateur ?')) return
    
    try {
      await adminAPI.banUser(userId, { reason: 'Banni par admin' })
      await loadAdminData()
      alert('Utilisateur banni avec succès')
    } catch (err) {
      alert('Erreur lors du bannissement')
    }
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="loading-overlay"><div className="spinner" /></div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadAdminData} className="btn btn-primary">Réessayer</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            Administration, {user?.name?.split(' ')[0] ?? 'Admin'} 👑
          </h1>
          <p className="page-subtitle">
            Vue d'ensemble de la plateforme CPA
          </p>
        </div>

        <div className="page-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Utilisateurs</span>
                <div className="stat-card-icon primary"><Users size={16} /></div>
              </div>
              <div className="stat-card-value">
                {stats?.users?.total ?? 0}
              </div>
              <div className="stat-card-sub">
                Actifs: {stats?.users?.active ?? 0} | Bannis: {stats?.users?.banned ?? 0}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Revenus totaux</span>
                <div className="stat-card-icon success"><TrendingUp size={16} /></div>
              </div>
              <div className="stat-card-value">
                {formatAmount(stats?.conversions?.revenue ?? 0)} €
              </div>
              <div className="stat-card-sub">
                {stats?.conversions?.total ?? 0} conversions
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Retraits en attente</span>
                <div className="stat-card-icon warning"><DollarSign size={16} /></div>
              </div>
              <div className="stat-card-value">
                {stats?.withdrawals?.pending ?? 0}
              </div>
              <div className="stat-card-sub">
                Total payé: {formatAmount(stats?.withdrawals?.total_paid ?? 0)} €
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Alertes fraude</span>
                <div className="stat-card-icon danger"><AlertTriangle size={16} /></div>
              </div>
              <div className="stat-card-value">
                {stats?.fraud?.blocked ?? 0}
              </div>
              <div className="stat-card-sub">
                Aujourd'hui: {stats?.fraud?.logs_today ?? 0}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <span className="card-title">Derniers utilisateurs</span>
              <Link to="/admin/users" style={{ fontSize: 12, color: 'var(--accent)' }}>
                Voir tous
              </Link>
            </div>
            {users.length === 0 ? (
              <div className="empty-state"><p>Aucun utilisateur</p></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Solde</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{formatAmount(u.balance)} €</td>
                        <td>
                          <span className={`badge badge-${u.status === 'active' ? 'success' : 'danger'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>{formatDate(u.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link to={`/admin/users/${u.id}`} className="btn-icon" title="Voir">
                              <Eye size={16} />
                            </Link>
                            {u.status !== 'banned' && (
                              <button onClick={() => handleBanUser(u.id)} className="btn-icon danger" title="Bannir">
                                <Ban size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Withdrawals */}
          {withdrawals.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-header">
                <span className="card-title">Retraits en attente</span>
                <Link to="/admin/withdrawals" style={{ fontSize: 12, color: 'var(--accent)' }}>
                  Voir tous
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Utilisateur</th>
                      <th>Montant</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.slice(0, 5).map((w) => (
                      <tr key={w.id}>
                        <td>{w.id}</td>
                        <td>{w.user?.name}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                          {formatAmount(w.amount)} €
                        </td>
                        <td>{formatDate(w.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link to={`/admin/withdrawals/${w.id}`} className="btn-icon" title="Approuver">
                              <CheckCircle size={16} color="var(--success)" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}