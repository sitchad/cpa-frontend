import { useState, useEffect } from 'react'
import { ArrowDownToLine, CheckCircle, XCircle } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { adminAPI } from '../../services/api'

function formatAmount(val) {
  if (val === undefined || val === null) return '0.00'
  return parseFloat(val).toFixed(2)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function statusBadge(status) {
  if (!status) return <span className="badge badge-neutral">—</span>
  const s = status.toLowerCase()
  if (s === 'approved' || s === 'paid') return <span className="badge badge-success">Approuvé</span>
  if (s === 'pending') return <span className="badge badge-warning">En attente</span>
  if (s === 'rejected') return <span className="badge badge-danger">Rejeté</span>
  return <span className="badge badge-neutral">{status}</span>
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    adminAPI.getWithdrawals()
      .then(({ data }) => {
        const rows = data.data ?? data.withdrawals ?? data ?? []
        setWithdrawals(Array.isArray(rows) ? rows : [])
      })
      .catch(() => setError('Impossible de charger les retraits.'))
      .finally(() => setLoading(false))
  }, [])

  const handleAction = async (id, action) => {
    if (actioningId) return
    setActioningId(`${id}-${action}`)
    try {
      if (action === 'approve') {
        await adminAPI.approveWithdrawal(id)
        setWithdrawals((prev) =>
          prev.map((w) => w.id === id ? { ...w, status: 'approved' } : w)
        )
      } else {
        await adminAPI.rejectWithdrawal(id)
        setWithdrawals((prev) =>
          prev.map((w) => w.id === id ? { ...w, status: 'rejected' } : w)
        )
      }
    } catch (err) {
      alert(err.response?.data?.message ?? `Erreur lors de l'action.`)
    } finally {
      setActioningId(null)
    }
  }

  const filtered = withdrawals.filter((w) => {
    if (filter === 'all') return true
    return (w.status ?? '').toLowerCase() === filter
  })

  const pendingCount = withdrawals.filter((w) =>
    (w.status ?? '').toLowerCase() === 'pending'
  ).length

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Gestion des retraits</h1>
          <p className="page-subtitle">
            {pendingCount > 0
              ? `${pendingCount} retrait(s) en attente d'approbation`
              : 'Aucun retrait en attente'}
          </p>
        </div>

        <div className="page-content">
          {error && <div className="error-alert">{error}</div>}

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { value: 'all', label: 'Tous' },
              { value: 'pending', label: 'En attente' },
              { value: 'approved', label: 'Approuvés' },
              { value: 'rejected', label: 'Rejetés' },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`btn btn-sm ${filter === tab.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
                {tab.value === 'pending' && pendingCount > 0 && (
                  <span style={{
                    background: 'white', color: 'var(--accent)',
                    borderRadius: '99px', padding: '1px 6px',
                    fontSize: 10, fontWeight: 700, marginLeft: 4,
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Retraits ({filtered.length})</span>
              <ArrowDownToLine size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            {loading ? (
              <div className="loading-overlay"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <ArrowDownToLine size={36} />
                <p>Aucun retrait dans cette catégorie.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Détails</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((w) => {
                      const isPending = (w.status ?? '').toLowerCase() === 'pending'
                      const approvingThis = actioningId === `${w.id}-approve`
                      const rejectingThis = actioningId === `${w.id}-reject`
                      return (
                        <tr key={w.id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {w.user?.name ?? w.user_name ?? `User #${w.user_id ?? '—'}`}
                            </div>
                            {w.user?.email && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {w.user.email}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--warning)' }}>
                            {formatAmount(w.amount)} €
                          </td>
                          <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {(w.method ?? '—').replace('_', ' ')}
                          </td>
                          <td style={{ maxWidth: 160 }}>
                            <div style={{
                              fontSize: 11, color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }} title={w.account_details ?? ''}>
                              {w.account_details ?? '—'}
                            </div>
                          </td>
                          <td>{statusBadge(w.status)}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                            {formatDate(w.created_at)}
                          </td>
                          <td>
                            {isPending ? (
                              <div className="actions-row">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleAction(w.id, 'approve')}
                                  disabled={!!actioningId}
                                  title="Approuver"
                                >
                                  {approvingThis ? (
                                    <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                  ) : (
                                    <><CheckCircle size={12} /> Approuver</>
                                  )}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleAction(w.id, 'reject')}
                                  disabled={!!actioningId}
                                  title="Rejeter"
                                >
                                  {rejectingThis ? (
                                    <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                  ) : (
                                    <><XCircle size={12} /> Rejeter</>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
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
