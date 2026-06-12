import { useState, useEffect } from 'react'
import { Users, Search, Ban, ShieldCheck } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { adminAPI } from '../../services/api'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actioningId, setActioningId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminAPI.getUsers()
      .then(({ data }) => {
        const rows = data.data ?? data.users ?? data ?? []
        const arr = Array.isArray(rows) ? rows : []
        setUsers(arr)
        setFiltered(arr)
      })
      .catch(() => setError('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      users.filter(
        (u) =>
          (u.name ?? '').toLowerCase().includes(q) ||
          (u.email ?? '').toLowerCase().includes(q)
      )
    )
  }, [search, users])

  const handleBan = async (userId, isBanned) => {
    if (actioningId) return
    setActioningId(userId)
    try {
      await adminAPI.banUser(userId)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: !isBanned, banned: !isBanned } : u
        )
      )
    } catch (err) {
      alert(err.response?.data?.message ?? 'Erreur lors de l\'action.')
    } finally {
      setActioningId(null)
    }
  }

  const isBanned = (u) => u.is_banned || u.banned || u.status === 'banned'
  const getRole = (u) => u.role ?? 'user'

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">{users.length} utilisateurs inscrits</p>
        </div>

        <div className="page-content">
          {error && <div className="error-alert">{error}</div>}

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
            <Search
              size={15}
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par nom ou email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Utilisateurs ({filtered.length})</span>
              <Users size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            {loading ? (
              <div className="loading-overlay"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Users size={36} />
                <p>{search ? 'Aucun résultat pour cette recherche.' : 'Aucun utilisateur trouvé.'}</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Inscrit le</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const banned = isBanned(u)
                      const role = getRole(u)
                      const isActioning = actioningId === u.id
                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                              }}>
                                {(u.name ?? '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <span style={{ fontWeight: 500 }}>{u.name ?? '—'}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{u.email ?? '—'}</td>
                          <td>
                            <span className={`badge ${role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
                              {role}
                            </span>
                          </td>
                          <td>
                            {banned
                              ? <span className="badge badge-danger">Banni</span>
                              : <span className="badge badge-success">Actif</span>}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                            {formatDate(u.created_at)}
                          </td>
                          <td>
                            {role !== 'admin' && (
                              <button
                                className={`btn btn-sm ${banned ? 'btn-success' : 'btn-danger'}`}
                                onClick={() => handleBan(u.id, banned)}
                                disabled={isActioning}
                              >
                                {isActioning ? (
                                  <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                ) : banned ? (
                                  <><ShieldCheck size={12} /> Débannir</>
                                ) : (
                                  <><Ban size={12} /> Bannir</>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
