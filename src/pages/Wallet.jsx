import { useState, useEffect } from 'react'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { walletAPI } from '../services/api'

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

function TxIcon({ amount }) {
  if (amount >= 0) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--success-bg)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--success)', flexShrink: 0,
      }}>
        <ArrowDownLeft size={14} />
      </div>
    )
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--danger-bg)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--danger)', flexShrink: 0,
    }}>
      <ArrowUpRight size={14} />
    </div>
  )
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    walletAPI.get()
      .then(({ data }) => setWallet(data.wallet ?? data))
      .catch(console.error)
      .finally(() => setLoadingWallet(false))
  }, [])

  useEffect(() => {
    setLoadingHistory(true)
    walletAPI.history({ page, per_page: 15 })
      .then(({ data }) => {
        const rows = data.data ?? data.history ?? data ?? []
        setHistory(Array.isArray(rows) ? rows : [])
        setMeta(data.meta ?? null)
      })
      .catch(console.error)
      .finally(() => setLoadingHistory(false))
  }, [page])

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Wallet</h1>
          <p className="page-subtitle">Vos gains et l'historique de vos transactions.</p>
        </div>

        <div className="page-content">
          {/* Balance card */}
          <div className="wallet-balance-card" style={{ marginBottom: 24 }}>
            <div className="wallet-balance-label">Solde disponible</div>
            {loadingWallet ? (
              <div className="spinner" style={{ marginTop: 8 }} />
            ) : (
              <div className="wallet-balance-amount">
                {formatAmount(wallet?.balance)}
                <span className="wallet-balance-currency">€</span>
              </div>
            )}
          </div>

          {/* Extra stats */}
          {!loadingWallet && wallet && (
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Total gagné</span>
                  <div className="stat-card-icon success"><TrendingUp size={16} /></div>
                </div>
                <div className="stat-card-value">{formatAmount(wallet.total_earned ?? wallet.total)} €</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Total retiré</span>
                  <div className="stat-card-icon accent"><ArrowUpRight size={16} /></div>
                </div>
                <div className="stat-card-value">{formatAmount(wallet.total_withdrawn ?? wallet.withdrawn)} €</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">En attente</span>
                  <div className="stat-card-icon warning"><WalletIcon size={16} /></div>
                </div>
                <div className="stat-card-value">{formatAmount(wallet.pending_withdraw ?? wallet.pending)} €</div>
              </div>
            </div>
          )}

          {/* History */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Historique des transactions</span>
            </div>

            {loadingHistory ? (
              <div className="loading-overlay"><div className="spinner" /></div>
            ) : history.length === 0 ? (
              <div className="empty-state">
                <WalletIcon size={36} />
                <p>Aucune transaction pour le moment.</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Type / Description</th>
                        <th>Montant</th>
                        <th>Solde après</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((tx, i) => (
                        <tr key={tx.id ?? i}>
                          <td style={{ color: 'var(--text-muted)' }}>
                            <TxIcon amount={tx.amount} />
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>
                              {tx.description ?? tx.type ?? 'Transaction'}
                            </div>
                            {tx.reference && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Réf: {tx.reference}
                              </div>
                            )}
                          </td>
                          <td style={{
                            color: tx.amount >= 0 ? 'var(--success)' : 'var(--danger)',
                            fontWeight: 600,
                          }}>
                            {tx.amount >= 0 ? '+' : ''}{formatAmount(tx.amount)} €
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {tx.balance_after !== undefined
                              ? `${formatAmount(tx.balance_after)} €`
                              : '—'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                            {formatDate(tx.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Précédent
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      Page {meta.current_page} / {meta.last_page}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={page === meta.last_page}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
