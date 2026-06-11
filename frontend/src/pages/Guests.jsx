import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, LogIn, LogOut, Search, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../components/Toast'

function iso(d) {
  return d.toISOString().slice(0, 10)
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_META = {
  all: { label: 'All', bg: '#1b3520', color: 'white' },
  pending: { label: 'Booked', bg: '#fef3c7', color: '#92400e' },
  confirmed: { label: 'Confirmed', bg: '#dbeafe', color: '#1e40af' },
  checked_in: { label: 'Checked In', bg: '#d1fae5', color: '#065f46' },
  checked_out: { label: 'Checked Out', bg: '#e5e7eb', color: '#374151' },
}

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'checked_in', 'checked_out']
const PRESETS = ['today', 'week', 'custom']

function startOfDay(date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function presetRange(preset) {
  const today = new Date()
  if (preset === 'week') {
    return { from: iso(startOfDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6))), to: iso(endOfDay(today)) }
  }
  return { from: iso(startOfDay(today)), to: iso(endOfDay(today)) }
}

export default function Guests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canWrite = ['admin', 'frontdesk'].includes(user?.role)
  const [preset, setPreset] = useState('today')
  const [range, setRange] = useState(() => presetRange('today'))
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (range.from) params.set('from', range.from)
    if (range.to) params.set('to', range.to)
    if (status !== 'all') params.set('status', status)
    api.get(`/reservations?${params.toString()}`)
      .then(r => setReservations(r.data))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [preset, range.from, range.to, status])

  function changePreset(next) {
    setPreset(next)
    if (next === 'custom') return
    setRange(presetRange(next))
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return reservations.filter(r => {
      if (!q) return true
      const rooms = r.reservationRooms?.map(rr => rr.room?.number || rr.room?.type || '').join(' ').toLowerCase()
      return [r.guestName, r.status, rooms].some(v => String(v || '').toLowerCase().includes(q))
    })
  }, [reservations, search])

  async function doAction(id, action) {
    setBusyId(id)
    try {
      await api.post(`/reservations/${id}/${action}`)
      toast(action === 'checkin' ? 'Guest checked in.' : 'Guest checked out.')
      load()
    } catch (err) {
      toast(err.response?.data?.error || 'Action failed.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Guests</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Booked, checked-in, and checked-out guests across the lodge.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/folios')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            Go to Folios <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9db87a' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guest, room, or status..."
            className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none bg-white"
            style={{ borderColor: '#dde7c8' }}
          />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border bg-white px-2 py-1" style={{ borderColor: '#dde7c8' }}>
          <CalendarDays className="w-4 h-4" style={{ color: '#5a6b5c' }} />
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => changePreset(p)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: preset === p ? '#1b3520' : 'transparent', color: preset === p ? 'white' : '#5a6b5c' }}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {preset === 'custom' && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <label className="bg-white border rounded-xl px-3 py-2.5 flex items-center justify-between gap-3" style={{ borderColor: '#dde7c8' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>From</span>
            <input type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} className="outline-none text-sm" />
          </label>
          <label className="bg-white border rounded-xl px-3 py-2.5 flex items-center justify-between gap-3" style={{ borderColor: '#dde7c8' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>To</span>
            <input type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} className="outline-none text-sm" />
          </label>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
        {STATUS_FILTERS.map(key => {
          const meta = STATUS_META[key]
          return (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border"
              style={{
                background: status === key ? meta.bg : '#f5f7ee',
                color: status === key ? meta.color : '#5a6b5c',
                borderColor: status === key ? meta.bg : '#dde7c8',
              }}
            >
              {meta.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border p-8 animate-pulse" style={{ borderColor: '#dde7c8' }}>
          <div className="h-64 rounded-xl bg-sage-50" />
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#dde7c8' }}>
          <p className="font-semibold" style={{ color: '#1c2b1e' }}>No guests found.</p>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Try a broader date range or a different status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#dde7c8' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-sage-50">
                <tr>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Guest</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden md:table-cell" style={{ color: '#5a6b5c' }}>Rooms</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Check-in</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden lg:table-cell" style={{ color: '#5a6b5c' }}>Check-out</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Status</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-right" style={{ color: '#5a6b5c' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(reservation => {
                  const meta = STATUS_META[reservation.status] || STATUS_META.confirmed
                  const rooms = reservation.reservationRooms?.map(rr => rr.room?.number).filter(Boolean).join(', ') || '—'
                  return (
                    <tr key={reservation.id} className="border-t" style={{ borderColor: '#eef2e4' }}>
                      <td className="px-4 py-4">
                        <div className="font-semibold" style={{ color: '#1c2b1e' }}>{reservation.guestName}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#5a6b5c' }}>{reservation.guestContact || 'No contact'}</div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell" style={{ color: '#5a6b5c' }}>{rooms}</td>
                      <td className="px-4 py-4 text-sm" style={{ color: '#5a6b5c' }}>{formatDate(reservation.checkinDate)}</td>
                      <td className="px-4 py-4 text-sm hidden lg:table-cell" style={{ color: '#5a6b5c' }}>{formatDate(reservation.checkoutDate)}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {reservation.folio?.id && (
                            <button onClick={() => navigate(`/folios/${reservation.folio.id}`)} className="px-3 py-1.5 rounded-lg border text-xs font-semibold" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
                              Open Folio
                            </button>
                          )}
                          {canWrite && reservation.status === 'confirmed' && (
                            <button
                              onClick={() => doAction(reservation.id, 'checkin')}
                              disabled={busyId === reservation.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ background: '#1b3520' }}
                            >
                              {busyId === reservation.id ? '...' : <span className="inline-flex items-center gap-1"><LogIn className="w-3.5 h-3.5" /> Check In</span>}
                            </button>
                          )}
                          {canWrite && reservation.status === 'checked_in' && (
                            <button
                              onClick={() => doAction(reservation.id, 'checkout')}
                              disabled={busyId === reservation.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ background: '#9d174d' }}
                            >
                              {busyId === reservation.id ? '...' : <span className="inline-flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Check Out</span>}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
