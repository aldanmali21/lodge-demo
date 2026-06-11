import { useState } from 'react'
import { X, Check, Search } from 'lucide-react'
import api from '../lib/api'

export default function NewBookingModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [rooms, setRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomSearch, setRoomSearch] = useState('')
  const [form, setForm] = useState({
    guestName: '', guestContact: '',
    checkinDate: '', checkoutDate: '',
    roomIds: [], currency: 'USD',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  // Fetch only rooms that are free for the chosen dates (excludes pending/confirmed/checked_in
  // reservations that overlap), so we can't double-book. Called when advancing to the rooms step.
  function loadAvailableRooms() {
    setRoomsLoading(true)
    const params = new URLSearchParams({ from: form.checkinDate, to: form.checkoutDate })
    api.get(`/rooms/available?${params}`)
      .then(r => setRooms(r.data))
      .catch(() => setRooms([]))
      .finally(() => setRoomsLoading(false))
  }

  function goToRooms() {
    loadAvailableRooms()
    setStep(2)
  }

  const toggle = id => setForm(f => ({
    ...f,
    roomIds: f.roomIds.includes(id) ? f.roomIds.filter(r => r !== id) : [...f.roomIds, id],
  }))

  const visibleRooms = rooms.filter(r => {
    const q = roomSearch.trim().toLowerCase()
    if (!q) return true
    return r.number.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
  })

  async function submit() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/reservations', form)
      setSuccess(data)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create reservation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#dde7c8', background: '#1b3520' }}>
          <h2 className="font-display text-xl font-semibold text-white">New Booking</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-1" style={{ color: '#1c2b1e' }}>Booking Confirmed</h3>
              <p className="text-sm mb-1" style={{ color: '#5a6b5c' }}>
                {success.reservation?.guestName} — Folio #{success.folio?.id}
              </p>
              <button onClick={onClose} className="mt-4 px-6 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: '#1b3520' }}>
                Close
              </button>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Guest Details</h3>
                  <input
                    placeholder="Guest name *"
                    value={form.guestName}
                    onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2"
                    style={{ borderColor: '#dde7c8', focusRingColor: '#1b3520' }}
                  />
                  <input
                    placeholder="Contact (phone / email)"
                    value={form.guestContact}
                    onChange={e => setForm(f => ({ ...f, guestContact: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none"
                    style={{ borderColor: '#dde7c8' }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#5a6b5c' }}>Check-in</label>
                      <input type="date" value={form.checkinDate}
                        onChange={e => setForm(f => ({ ...f, checkinDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#dde7c8' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#5a6b5c' }}>Check-out</label>
                      <input type="date" value={form.checkoutDate}
                        onChange={e => setForm(f => ({ ...f, checkoutDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#dde7c8' }} />
                    </div>
                  </div>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#dde7c8' }}>
                    <option value="USD">USD – US Dollar</option>
                    <option value="UGX">UGX – Ugandan Shilling</option>
                  </select>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: '#1c2b1e' }}>
                    Select Rooms
                    <span className="font-normal" style={{ color: '#9db87a' }}> · free for {form.checkinDate} → {form.checkoutDate}</span>
                  </h3>
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9db87a' }} />
                    <input
                      placeholder="Search rooms by number or type…"
                      value={roomSearch}
                      onChange={e => setRoomSearch(e.target.value)}
                      className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#dde7c8' }}
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {roomsLoading ? (
                      <div className="py-6 flex justify-center">
                        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#1b3520', borderTopColor: 'transparent' }} />
                      </div>
                    ) : (
                      <>
                        {visibleRooms.map(room => (
                          <label key={room.id} className="flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all"
                            style={{ borderColor: form.roomIds.includes(room.id) ? '#1b3520' : '#dde7c8', background: '#f5f7ee' }}>
                            <div>
                              <p className="font-medium text-sm" style={{ color: '#1c2b1e' }}>Room {room.number}</p>
                              <p className="text-xs" style={{ color: '#5a6b5c' }}>{room.type} · ${Number(room.defaultRate).toFixed(0)}/night</p>
                            </div>
                            <input type="checkbox" checked={form.roomIds.includes(room.id)} onChange={() => toggle(room.id)}
                              style={{ accentColor: '#1b3520' }} />
                          </label>
                        ))}
                        {visibleRooms.length === 0 && (
                          <p className="text-sm text-center py-4" style={{ color: '#5a6b5c' }}>
                            {rooms.length === 0 ? 'No rooms available for these dates.' : 'No rooms match your search.'}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                {step > 1
                  ? <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm rounded-lg border" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Back</button>
                  : <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Cancel</button>
                }
                {step < 2
                  ? <button onClick={goToRooms} disabled={!form.guestName || !form.checkinDate || !form.checkoutDate}
                      className="px-6 py-2 text-sm rounded-lg text-white font-semibold disabled:opacity-50" style={{ background: '#1b3520' }}>
                      Next: Rooms
                    </button>
                  : <button onClick={submit} disabled={loading}
                      className="px-6 py-2 text-sm rounded-lg text-white font-semibold disabled:opacity-50" style={{ background: '#1b3520' }}>
                      {loading ? 'Creating…' : 'Confirm Booking'}
                    </button>
                }
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
