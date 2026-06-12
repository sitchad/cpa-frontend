import { useState, useEffect } from 'react'
import { Zap, ExternalLink, CheckCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { offersAPI } from '../services/api'

function formatAmount(val) {
  if (!val && val !== 0) return '0.00'
  return parseFloat(val).toFixed(2)
}

export default function Offers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [clickingId, setClickingId] = useState(null)
  const [clickedIds, setClickedIds] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    offersAPI.getAll()
      .then(({ data }) => {
        const rows = data.data ?? data.offers ?? data ?? []
        setOffers(Array.isArray(rows) ? rows : [])
      })
      .catch(() => setError('Impossible de charger les offres.'))
      .finally(() => setLoading(false))
  }, [])

  const handleClick = async (offerId) => {
    if (clickingId || clickedIds.has(offerId)) return
    setClickingId(offerId)
    try {
      const { data } = await offersAPI.click(offerId)
      setClickedIds((prev) => new Set([...prev, offerId]))
      // Open redirect URL if returned
      const url = data.redirect_url ?? data.url
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Erreur click offre:', err)
    } finally {
      setClickingId(null)
    }
  }

  const getStatusBadge = (offer) => {
    const status = offer.status ?? 'active'
    if (status === 'active') return <span className="badge badge-success">Actif</span>
    if (status === 'paused') return <span className="badge badge-warning">En pause</span>
    return <span className="badge badge-neutral">{status}</span>
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Offres disponibles</h1>
          <p className="page-subtitle">Cliquez sur une offre pour la compléter et gagner votre commission.</p>
        </div>

        <div className="page-content">
          {error && <div className="error-alert">{error}</div>}

          {loading ? (
            <div className="loading-overlay"><div className="spinner" /></div>
          ) : offers.length === 0 ? (
            <div className="empty-state">
              <Zap size={40} style={{ marginBottom: 12 }} />
              <p>Aucune offre disponible pour le moment.</p>
            </div>
          ) : (
            <div className="offers-grid">
              {offers.map((offer) => {
                const isClicked = clickedIds.has(offer.id)
                const isClicking = clickingId === offer.id
                return (
                  <div key={offer.id} className="offer-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className="offer-title">
                        {offer.title ?? offer.name ?? `Offre #${offer.id}`}
                      </h3>
                      {getStatusBadge(offer)}
                    </div>

                    {offer.description && (
                      <p className="offer-description">{offer.description}</p>
                    )}

                    {offer.category && (
                      <span className="badge badge-info">{offer.category}</span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div className="offer-payout">
                        {formatAmount(offer.payout ?? offer.amount)} €
                        <span> / conversion</span>
                      </div>
                    </div>

                    <button
                      className={`btn ${isClicked ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleClick(offer.id)}
                      disabled={isClicking || isClicked}
                    >
                      {isClicking ? (
                        <>
                          <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                          Chargement…
                        </>
                      ) : isClicked ? (
                        <>
                          <CheckCircle size={14} />
                          Complété
                        </>
                      ) : (
                        <>
                          <ExternalLink size={14} />
                          Accéder à l'offre
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
