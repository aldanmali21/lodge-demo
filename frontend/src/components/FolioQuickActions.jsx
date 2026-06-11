import { useState } from 'react'
import { X, LogIn, LogOut, CheckCircle2, CreditCard } from 'lucide-react'
import api from '../lib/api'
import { toast } from './Toast'

const METHODS = ['Cash', 'Card Terminal', 'Airtel Money', 'MTN MoMo', 'Bank Transfer']

// Quick-manage modal for a folio row: check-in/out the linked reservation, mark paid,
// or record a manual payment — all without leaving the Folios list.
export default function FolioQuickActions({ folio, onClose, onChanged }) {
  const reservation = folio.reservation
  const resId = folio.reservationId || reservation?.id
  const status = reservation?.status
  const [busy, setBusy] = useState(false)
  const [pay, setPay] = useState({ amount: '', method: 'Cash', currency: folio.currency || 'USD', reference: '' })
  const [error, setError] = useState('')

  async function run(label, fn) {
    setBusy(true); setError('')
    try {
      await fn()
      toast(label)
      onChanged()
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || `Failed: ${label}`)
    } finally {
      setBusy(false)
    }
  }

  const checkIn = () => run('Guest checked in', () => api.post(`/reservations/${resId}/checkin`))
  const checkOut = () => run('Guest checked out', () => api.post(`/reservations/${resId}/checkout`))
  const markPaid = () => run('Folio marked paid', () => api.patch(`/folios/${folio.id}/status`, { status: 'paid' }))

  async function recordPayment(e) {
    e.preventDefault()
    if (!pay.amount || Number(pay.amount) <= 0) return setError('Enter a payment amount.')
    run('Payment recorded', () => api.post(`/folios/${folio.id}/payments`, {
      amount: Number(pay.amount), method: pay.method, currency: pay.currency, reference: pay.reference || null,
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,26,15,0.6)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: '#1b3520' }}>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Manage Folio #{folio.id}</h2>
            <p className="text-xs text-white/60">{reservation?.guestName} · {status?.replace('_', ' ') || 'no reservation'}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

          {/* Stay actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a6b5c' }}>Guest Stay</p>
            <div className="flex flex-wrap gap-2">
              {status === 'confirmed' && (
                <button onClick={checkIn} disabled={busy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#16a34a' }}>
                  <LogIn className="w-4 h-4" /> Check In
                </button>
              )}
              {status === 'checked_in' && (
                <button onClick={checkOut} disabled={busy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#d97706' }}>
                  <LogOut className="w-4 h-4" /> Check Out
                </button>
              )}
              {status === 'checked_out' && (
                <span className="text-sm" style={{ color: '#5a6b5c' }}>Guest has checked out.</span>
              )}
              {!status && <span className="text-sm" style={{ color: '#5a6b5c' }}>No linked reservation.</span>}
            </div>
          </div>

          {/* Billing actions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a6b5c' }}>Billing</p>
            {folio.status !== 'paid' && folio.status !== 'closed' ? (
              <button onClick={markPaid} disabled={busy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-50" style={{ borderColor: '#1b3520', color: '#1b3520' }}>
                <CheckCircle2 className="w-4 h-4" /> Mark as Paid
              </button>
            ) : (
              <p className="text-sm" style={{ color: '#5a6b5c' }}>Folio is {folio.status}.</p>
            )}
          </div>

          {/* Record payment */}
          {folio.status !== 'closed' && (
            <form onSubmit={recordPayment} className="rounded-xl border p-3 space-y-3" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}>
              <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#5a6b5c' }}>
                <CreditCard className="w-3.5 h-3.5" /> Record Payment
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min="0" step="0.01" placeholder="Amount" value={pay.amount}
                  onChange={e => setPay(p => ({ ...p, amount: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: '#dde7c8' }} />
                <select value={pay.currency} onChange={e => setPay(p => ({ ...p, currency: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: '#dde7c8' }}>
                  <option value="USD">USD</option>
                  <option value="UGX">UGX</option>
                </select>
                <select value={pay.method} onChange={e => setPay(p => ({ ...p, method: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: '#dde7c8' }}>
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input placeholder="Reference #" value={pay.reference}
                  onChange={e => setPay(p => ({ ...p, reference: e.target.value }))}
                  className="border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: '#dde7c8' }} />
              </div>
              <button type="submit" disabled={busy} className="w-full py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#1b3520' }}>
                {busy ? 'Saving…' : 'Apply Payment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
