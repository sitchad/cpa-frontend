import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, Zap, ArrowDownToLine, TrendingUp, ChevronRight, Clock } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { walletAPI, offersAPI } from '../services/api'
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

export default function Dashboard() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState(null)
  const [history, setHistory] = useState([])
  const [offers, setOffers] = useState([])
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [loadingOffers, setLoadingOffers] = useState(true)

  useEffect(() => {
    walletAPI.get()
      .then(({ data }) => setWallet(data.wallet ?? data))
      .catch(console.error)
      .finally(() => setLoadingWallet(false))

    walletAPI.history({ per_page: 5 })
      .then(({ data }) => {
        const rows = data.data ?? data.history ?? data ?? []
        setHistory(Array.isArray(rows) ? rows : [])
      })
      .catch(console.error)

    offersAPI.getAll({ per_page: 6 })
      .then(({ data }) => {
        const rows = data.data ?? data.offers ?? data ?? []
        setOffers(Array.isArray(rows) ? rows.slice(0, 6) : [])
      })
      .catch(console.error)
      .finally(() => setLoadingOffers(false))
  }, [])

  const balance = wallet?.balance ?? 0
  const totalEarned = wallet?.total_earned ?? wallet?.total ?? 0
  const pendingWithdraw = wallet?.pending_withdraw ?? wallet?.pending ?? 0

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            Bonjour, {user?.name?.split(' ')[0] ?? 'Membre'} 👋
          </h1>
          <p className="page-subtitle">
            Voici un aperçu de votre activité sur la plateforme.
          </p>
        </div>

        <div className="page-content">
          {/* Wallet balance hero */}
          <div className="wallet-balance-card">
            <div className="wallet-balance-label">Solde disponible</div>
            <div className="wallet-balance-amount">
              {formatAmount(balance)}
              <span className="wallet-balance-currency">€</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Link to="/wallet" className="btn btn-secondary btn-sm">
                <Wallet size={14} /> Voir le wallet
              </Link>
              <Link to="/withdraw" className="btn btn-primary btn-sm">
                <ArrowDownToLine size={14} /> Retirer
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Total gagné</span>
                <div className="stat-card-icon success"><TrendingUp size={16} /></div>
              </div>
              <div className="stat-card-value">
                {loadingWallet ? '…' : `${formatAmount(totalEarned)} €`}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Retrait en cours</span>
                <div className="stat-card-icon warning"><Clock size={16} /></div>
              </div>
              <div className="stat-card-value">
                {loadingWallet ? '…' : `${formatAmount(pendingWithdraw)} €`}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Offres disponibles</span>
                <div className="stat-card-icon accent"><Zap size={16} /></div>
              </div>
              <div className="stat-card-value">
                {loadingOffers ? '…' : offers.length}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Recent transactions */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Transactions récentes</span>
                <Link
                  to="/wallet"
                  style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  Tout voir <ChevronRight size={14} />
                </Link>
              </div>
              {history.length === 0 ? (
                <div className="empty-state">
                  <p>Aucune transaction pour le moment.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Montant</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((tx, i) => (
                      <tr key={tx.id ?? i}>
                        <td>{tx.description ?? tx.type ?? '—'}</td>
                        <td style={{ color: tx.amount >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {tx.amount >= 0 ? '+' : ''}{formatAmount(tx.amount)} €
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Offers preview */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Offres récentes</span>
                <Link
                  to="/offers"
                  style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  Voir toutes <ChevronRight size={14} />
                </Link>
              </div>
              {loadingOffers ? (
                <div className="loading-overlay"><div className="spinner" /></div>
              ) : offers.length === 0 ? (
                <div className="empty-state"><p>Aucune offre disponible.</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Offre</th>
                      <th>Paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => (
                      <tr key={offer.id}>
                        <td>{offer.title ?? offer.name ?? `Offre #${offer.id}`}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                          {formatAmount(offer.payout ?? offer.amount)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
