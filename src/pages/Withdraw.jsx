import { useState, useEffect } from 'react'
import { ArrowDownToLine, Send } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { withdrawAPI, walletAPI } from '../services/api'

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

function statusBadge(status) {
  if (!status) return <span className="badge badge-neutral">—</span>
  const s = status.toLowerCase()
  if (s === 'approved' || s === 'paid') return <span className="badge badge-success">Approuvé</span>
  if (s === 'pending') return <span className="badge badge-warning">En attente</span>
  if (s === 'rejected') return <span className="badge badge-danger">Rejeté</span>
  return <span className="badge badge-neutral">{status}</span>
}

export default function Withdraw() {
  const [withdrawals, setWithdrawals] = useState([])
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    amount: '',
    method: 'bank_transfer',
    account_details: '',
  })

  useEffect(() => {
    Promise.all([
      walletAPI.get(),
      withdrawAPI.getAll(),
    ])
      .then(([walletRes, withdrawRes]) => {
        setWallet(walletRes.data.wallet ?? walletRes.data)
        const rows = withdrawRes.data.data ?? withdrawRes.data.withdrawals ?? withdrawRes.data ?? []
        setWithdrawals(Array.isArray(rows) ? rows : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const amount = parseFloat(form.amount)
    const balance = parseFloat(wallet?.balance ?? 0)

    if (!amount || amount <= 0) {
      setError('Veuillez entrer un montant valide.')
      return
    }
    if (amount > balance) {
      setError(`Solde insuffisant. Solde disponible : ${formatAmount(balance)} €`)
      return
    }

    setSubmitting(true)
    try {
      const { data } = await withdrawAPI.create(form)
      const newEntry = data.withdrawal ?? data
      setWithdrawals((prev) => [newEntry, ...prev])
      setSuccess('Votre demande de retrait a été soumise avec succès.')
      setForm({ amount: '', method: 'bank_transfer', account_details: '' })
      // Refresh wallet balance
      const walletRes = await walletAPI.get()
      setWallet(walletRes.data.wallet ?? walletRes.data)
    } catch (err) {
      setError(
        err.response?.data?.message ??
        err.response?.data?.error ??
        'Erreur lors de la soumission du retrait.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Retrait</h1>
          <p className="page-subtitle">Demandez un retrait de vos gains.</p>
        </div>

        <div className="page-content">
          <div className="withdraw-grid">
            {/* Form */}
            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{
                  padding: '16px 20px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Solde disponible</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>
                    {formatAmount(wallet?.balance)} €
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Nouvelle demande</span>
                </div>
                <div className="card-body">
                  {success && (
                    <div style={{
                      background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,.25)',
                      color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                      fontSize: 13, marginBottom: 18,
                    }}>
                      {success}
                    </div>
                  )}
                  {error && <div className="error-alert">{error}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Montant (€)</label>
                      <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="1"
                        className="form-input"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Méthode de paiement</label>
                      <select
                        name="method"
                        className="form-input"
                        value={form.method}
                        onChange={handleChange}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="bank_transfer">Virement bancaire</option>
                        <option value="paypal">PayPal</option>
                        <option value="crypto">Cryptomonnaie</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Détails du compte</label>
                      <textarea
                        name="account_details"
                        className="form-input"
                        rows={4}
                        placeholder={
                          form.method === 'bank_transfer'
                            ? 'IBAN, BIC, Nom du titulaire…'
                            : form.method === 'paypal'
                            ? 'Adresse PayPal…'
                            : form.method === 'crypto'
                            ? 'Adresse du wallet, réseau…'
                            : 'Informations de paiement…'
                        }
                        value={form.account_details}
                        onChange={handleChange}
                        required
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          Envoi…
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Soumettre la demande
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Historique des retraits</span>
              </div>

              {loading ? (
                <div className="loading-overlay"><div className="spinner" /></div>
              ) : withdrawals.length === 0 ? (
                <div className="empty-state">
                  <ArrowDownToLine size={36} />
                  <p>Aucun retrait effectué.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Montant</th>
                        <th>Méthode</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w, i) => (
                        <tr key={w.id ?? i}>
                          <td style={{ fontWeight: 600 }}>{formatAmount(w.amount)} €</td>
                          <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                            {(w.method ?? '—').replace('_', ' ')}
                          </td>
                          <td>{statusBadge(w.status)}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                            {formatDate(w.created_at)}
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
