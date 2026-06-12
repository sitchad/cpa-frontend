import { useState, useEffect } from 'react'
import {
  Users, DollarSign, AlertTriangle, BarChart3,
  Activity, ShieldCheck, ArrowDownToLine, Zap,
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import { adminAPI } from '../../services/api'

function formatAmount(val) {
  if (val === undefined || val === null) return '0.00'
  return parseFloat(val).toFixed(2)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [postbacks, setPostbacks] = useState([])
  const [fraudLogs, setFraudLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminAPI.stats(),
      adminAPI.getPostbacks(),
      adminAPI.getFraudLogs(),
    ])
      .then(([statsRes, postbacksRes, fraudRes]) => {
        setStats(statsRes.data.stats ?? statsRes.data)
        const pb = postbacksRes.data.data ?? postbacksRes.data.postbacks ?? postbacksRes.data ?? []
        setPostbacks(Array.isArray(pb) ? pb.slice(0, 8) : [])
        const fl = fraudRes.data.data ?? fraudRes.data.logs ?? fraudRes.data ?? []
        setFraudLogs(Array.isArray(fl) ? fl.slice(0, 8) : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="loading-overlay" style={{ minHeight: '100vh' }}>
            <div className="spinner" />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-glow)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="page-title">Administration</h1>
              <p className="page-subtitle">Vue d'ensemble de la plateforme</p>
            </div>
          </div>
        </div>

        <div className="page-content">
          {/* Stats Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Utilisateurs</span>
                <div className="stat-card-icon accent"><Users size={16} /></div>
              </div>
              <div className="stat-card-value">{stats?.total_users ?? stats?.users ?? '—'}</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Revenus totaux</span>
                <div className="stat-card-icon success"><DollarSign size={16} /></div>
              </div>
              <div className="stat-card-value">
                {formatAmount(stats?.total_revenue ?? stats?.revenue)} €
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Retraits en attente</span>
                <div className="stat-card-icon warning"><ArrowDownToLine size={16} /></div>
              </div>
              <div className="stat-card-value">
                {stats?.pending_withdrawals ?? stats?.withdrawals_pending ?? '—'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Alertes fraude</span>
                <div className="stat-card-icon danger"><AlertTriangle size={16} /></div>
              </div>
              <div className="stat-card-value">
                {stats?.fraud_alerts ?? stats?.fraud ?? '—'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Offres actives</span>
                <div className="stat-card-icon accent"><Zap size={16} /></div>
              </div>
              <div className="stat-card-value">
                {stats?.active_offers ?? stats?.offers ?? '—'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Conversions</span>
                <div className="stat-card-icon success"><BarChart3 size={16} /></div>
              </div>
              <div className="stat-card-value">
                {stats?.total_conversions ?? stats?.conversions ?? '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Postbacks */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Derniers Postbacks</span>
                <Activity size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              {postbacks.length === 0 ? (
                <div className="empty-state"><p>Aucun postback enregistré.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Offre</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postbacks.map((pb, i) => (
                        <tr key={pb.id ?? i}>
                          <td>{pb.offer_id ? `Offre #${pb.offer_id}` : (pb.offer ?? '—')}</td>
                          <td>
                            <span className={`badge ${pb.status === 'success' ? 'badge-success' : 'badge-warning'}`}>
                              {pb.status ?? 'received'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                            {formatDate(pb.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Fraud logs */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Logs de Fraude</span>
                <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
              </div>
              {fraudLogs.length === 0 ? (
                <div className="empty-state"><p>Aucune alerte fraude.</p></div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Raison</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fraudLogs.map((log, i) => (
                        <tr key={log.id ?? i}>
                          <td>{log.user?.name ?? log.user_id ?? '—'}</td>
                          <td>
                            <span style={{ color: 'var(--danger)', fontSize: 12 }}>
                              {log.reason ?? log.type ?? '—'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                            {formatDate(log.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
