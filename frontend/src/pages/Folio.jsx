import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, Mail, AlertTriangle, CreditCard, FileText, ArrowLeft, LogIn, LogOut, CheckCircle2 } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../components/Toast'

function Badge({ status }) {
  const s = {
    open: { bg: '#d1fae5', color: '#065f46', text: 'IN-HOUSE' },
    paid: { bg: '#dbeafe', color: '#1e40af', text: 'PAID' },
    closed: { bg: '#f3f4f6', color: '#6b7280', text: 'CLOSED' },
  }[status] || { bg: '#fef3c7', color: '#b45309', text: status?.toUpperCase() }
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.text}</span>
}

export default function FolioPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = ['admin', 'frontdesk'].includes(user?.role)
  const [folio, setFolio] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const [actioning, setActioning] = useState(false)
  const [error, setError] = useState('')

  function reload() {
    return api.get(`/folios/${id}`).then(r => setFolio(r.data))
  }

  useEffect(() => {
    if (!id) { setLoading(false); return }
    api.get(`/folios/${id}`).then(r => setFolio(r.data)).finally(() => setLoading(false))
  }, [id])

  async function stayAction(label, fn) {
    setActioning(true); setError('')
    try {
      await fn()
      await reload()
      toast(label)
    } catch (e) {
      setError(e.response?.data?.error || `Failed: ${label}`)
    } finally {
      setActioning(false)
    }
  }

  if (!id) return (
    <div className="flex flex-col items-center justify-center h-64">
      <FileText className="w-10 h-10 mb-3" style={{ color: '#9db87a' }} />
      <p className="text-sm" style={{ color: '#5a6b5c' }}>Select a folio from the calendar or reservation list.</p>
    </div>
  )

  if (loading) return <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1b3520', borderTopColor: 'transparent' }} /></div>

  if (!folio) return <div className="text-center py-12 text-sm" style={{ color: '#5a6b5c' }}>Folio not found.</div>

  const res = folio.reservation || {}
  const guestInitials = res.guestName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?'

  const resId = folio.reservationId || res.id

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/folios')}
        className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-80"
        style={{ color: '#5a6b5c' }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Folios
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>
            Guest Folio <span className="text-gold" style={{ color: '#c8a96e' }}>#{folio.id}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Reviewing charges and recording payments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Stay actions */}
          {canWrite && res.status === 'confirmed' && (
            <button onClick={() => stayAction('Guest checked in', () => api.post(`/reservations/${resId}/checkin`))} disabled={actioning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#16a34a' }}>
              <LogIn className="w-4 h-4" /> Check In
            </button>
          )}
          {canWrite && res.status === 'checked_in' && (
            <button onClick={() => stayAction('Guest checked out', () => api.post(`/reservations/${resId}/checkout`))} disabled={actioning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#d97706' }}>
              <LogOut className="w-4 h-4" /> Check Out
            </button>
          )}
          {canWrite && folio.status !== 'paid' && folio.status !== 'closed' && (
            <button onClick={() => stayAction('Folio marked paid', () => api.patch(`/folios/${folio.id}/status`, { status: 'paid' }))} disabled={actioning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border disabled:opacity-50" style={{ borderColor: '#1b3520', color: '#1b3520' }}>
              <CheckCircle2 className="w-4 h-4" /> Mark Paid
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm transition-colors hover:bg-sage-50" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm transition-colors hover:bg-sage-50" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Mail className="w-4 h-4" /> Email Folio
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 stagger-2">
        {/* Left — Guest card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: '#dde7c8' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ background: '#1b3520' }}>{guestInitials}</div>
              <div>
                <p className="font-semibold" style={{ color: '#1c2b1e' }}>{res.guestName || '—'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs" style={{ color: '#5a6b5c' }}>Folio #{folio.id}</span>
                  <Badge status={folio.status} />
                </div>
              </div>
            </div>

            {res.guestContact && (
              <div className="flex items-start gap-2 p-3 rounded-xl mb-3" style={{ background: '#fef3c7' }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#92400e' }}>Contact</p>
                  <p className="text-xs mt-0.5" style={{ color: '#78350f' }}>{res.guestContact}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a6b5c' }}>Itinerary Summary</p>
              <div className="space-y-2">
                {res.checkinDate && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#1b3520' }} />
                    <div>
                      <p className="font-medium" style={{ color: '#1c2b1e' }}>{new Date(res.checkinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, Check-in</p>
                    </div>
                  </div>
                )}
                {folio.items?.filter(i => i.type === 'activity').map(i => (
                  <div key={i.id} className="flex items-start gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#c8a96e' }} />
                    <p style={{ color: '#1c2b1e' }}>{i.description}</p>
                  </div>
                ))}
                {res.checkoutDate && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#5a6b5c' }} />
                    <div>
                      <p style={{ color: '#1c2b1e' }}>{new Date(res.checkoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, Scheduled Check-out</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — line items + payment */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#dde7c8' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: '#dde7c8', color: '#5a6b5c', background: '#f5f7ee' }}>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Item / Description</th>
                  <th className="text-center px-4 py-3">Qty</th>
                  <th className="text-right px-4 py-3">Rate ({folio.currency})</th>
                  <th className="text-right px-5 py-3">Total ({folio.currency})</th>
                </tr>
              </thead>
              <tbody>
                {folio.items?.map(item => (
                  <tr key={item.id} className="border-b" style={{ borderColor: '#f0f4e8' }}>
                    <td className="px-5 py-3 text-sm" style={{ color: '#5a6b5c' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: '#1c2b1e' }}>{item.description}</td>
                    <td className="px-4 py-3 text-sm text-center" style={{ color: '#5a6b5c' }}>1</td>
                    <td className="px-4 py-3 text-sm text-right" style={{ color: '#5a6b5c' }}>{Number(item.amount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium" style={{ color: '#1c2b1e' }}>{Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
                {(!folio.items?.length) && (
                  <tr><td colSpan={5} className="px-5 py-6 text-sm text-center" style={{ color: '#5a6b5c' }}>No charges yet.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t" style={{ borderColor: '#dde7c8' }}>
                  <td colSpan={4} className="px-5 py-2 text-sm text-right" style={{ color: '#5a6b5c' }}>Subtotal</td>
                  <td className="px-5 py-2 text-sm text-right font-medium" style={{ color: '#1c2b1e' }}>${Number(folio.subtotal || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-5 py-1 text-sm text-right" style={{ color: '#5a6b5c' }}>Tourism Tax (5%)</td>
                  <td className="px-5 py-1 text-sm text-right" style={{ color: '#5a6b5c' }}>${Number(folio.tourismTax || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-5 py-1 text-sm text-right" style={{ color: '#5a6b5c' }}>VAT (18%)</td>
                  <td className="px-5 py-1 text-sm text-right" style={{ color: '#5a6b5c' }}>${Number(folio.vat || 0).toFixed(2)}</td>
                </tr>
                <tr className="border-t" style={{ borderColor: '#dde7c8' }}>
                  <td colSpan={4} className="px-5 py-3 text-sm font-bold text-right uppercase tracking-wider" style={{ color: '#1c2b1e' }}>Grand Total</td>
                  <td className="px-5 py-3 text-right">
                    <div className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>
                      ${Number(folio.grandTotal || 0).toFixed(2)}
                    </div>
                    {folio.ugxEquivalent && (
                      <div className="text-xs" style={{ color: '#5a6b5c' }}>
                        ~ UGX {Math.round(folio.ugxEquivalent).toLocaleString()}
                      </div>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {error && <div className="p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

          <p className="text-xs" style={{ color: '#9db87a' }}>
            Payments are recorded from the Folios list (Edit) and at activity booking. Use the header actions above to check in/out or mark this folio paid.
          </p>
        </div>
      </div>
    </div>
  )
}
