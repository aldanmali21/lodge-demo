import { useEffect, useState } from 'react'
import { PlaneTakeoff, PlaneLanding, Home, Banknote, Zap, Bed, TrendingUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import NewBookingModal from '../components/NewBookingModal'

// Tile colour = availability; small corner dot = cleanliness.
const ROOM_STATUS_COLORS = {
  available: { bg: '#d1fae5', color: '#065f46', label: 'Available' },
  occupied:  { bg: '#fce7f3', color: '#9d174d', label: 'Occupied' },
}
const CLEAN_DOT = {
  dirty:    { color: '#dc2626', label: 'Dirty' },
  cleaning: { color: '#d97706', label: 'In Progress' },
  clean:    { color: '#16a34a', label: 'Clean' },
}

const ACTION_LABELS = {
  create_reservation: 'created a reservation', check_in: 'checked in a guest',
  check_out: 'checked out a guest', record_payment: 'recorded a payment',
  add_folio_item: 'added a folio charge', complete_task: 'completed a task',
  book_activity: 'booked an activity', online_booking: 'made an online booking', website_enquiry: 'sent a website enquiry',
  update_room_status: 'updated room status', pos_charge_to_room: 'added a POS charge',
}

function relativeTime(d) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

function DonutChart({ pct }) {
  const r = 38, c = 2 * Math.PI * r, dash = (pct / 100) * c
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#eef2e4" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1b3520" strokeWidth="10"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [rooms, setRooms] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/rooms'),
      api.get('/notifications?limit=5'),
    ]).then(([s, r, n]) => {
      setData(s.data)
      setRooms(r.data)
      setActivity(n.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-64 bg-white/60 animate-pulse rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-white/60 animate-pulse rounded-2xl" />)}
      </div>
    </div>
  )

  const arrivals = data?.arrivals?.list || []
  const departures = data?.departures || {}
  const occupancy = data?.occupancy || {}
  const collections = data?.collections || {}

  return (
    <div>
      <div className="mb-6 stagger-1">
        <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: '#1c2b1e' }}>Today's Operations</h1>
        <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>{today}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Arrivals */}
        <div className="bg-white rounded-2xl p-5 border shadow-sm stagger-1" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-start justify-between mb-3">
            <p className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Arrivals Today</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eef2e4' }}>
              <PlaneLanding className="w-5 h-5" style={{ color: '#2d5a22' }} />
            </div>
          </div>
          <span className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>{arrivals.length}</span>
          <p className="text-sm mb-3" style={{ color: '#5a6b5c' }}>Guests checking in</p>
          <div className="space-y-2">
            {arrivals.slice(0, 2).map(r => (
              <div key={r.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#2d5a22' }}>
                    {r.guestName[0]}
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#1c2b1e' }}>{r.guestName}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: r.status === 'checked_in' ? '#fef3c7' : '#dbeafe', color: r.status === 'checked_in' ? '#92400e' : '#1e40af' }}>
                  {r.status === 'checked_in' ? 'ARRIVED' : 'EXPECTED'}
                </span>
              </div>
            ))}
            {arrivals.length === 0 && <p className="text-xs" style={{ color: '#5a6b5c' }}>No arrivals today</p>}
          </div>
        </div>

        {/* Departures */}
        <div className="bg-white rounded-2xl p-5 border shadow-sm stagger-2" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-start justify-between mb-3">
            <p className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Departures</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eef2e4' }}>
              <PlaneTakeoff className="w-5 h-5" style={{ color: '#2d5a22' }} />
            </div>
          </div>
          <p className="text-sm mb-2" style={{ color: '#5a6b5c' }}>Checking out</p>
          <span className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>{departures.count || 0}</span>
          {departures.count > 0 && (
            <p className="text-sm mt-2" style={{ color: '#5a6b5c' }}>{departures.count} departing today</p>
          )}
          {!departures.count && <p className="text-sm mt-2" style={{ color: '#5a6b5c' }}>No departures today</p>}
        </div>

        {/* Occupancy */}
        <div className="bg-white rounded-2xl p-5 border shadow-sm stagger-3 sm:col-span-2 lg:col-span-1" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-start justify-between mb-2">
            <p className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Occupancy</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eef2e4' }}>
              <Home className="w-5 h-5" style={{ color: '#2d5a22' }} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <DonutChart pct={occupancy.percent || 0} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl font-bold" style={{ color: '#1c2b1e' }}>{occupancy.percent || 0}%</span>
              </div>
            </div>
            <p className="text-sm" style={{ color: '#5a6b5c' }}>{occupancy.occupied || 0} of {occupancy.total || 0} rooms occupied</p>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="bg-white rounded-2xl p-5 border shadow-sm mb-4 stagger-4" style={{ borderColor: '#dde7c8' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Today's Collections</p>
          <Banknote className="w-5 h-5" style={{ color: '#2d5a22' }} />
        </div>
        <p className="text-xs mb-3" style={{ color: '#5a6b5c' }}>Manual POS &amp; front desk cash</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl" style={{ background: '#f5f7ee' }}>
            <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: '#5a6b5c' }}>USD Total</p>
            <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>
              ${(collections.usd || 0).toLocaleString('en', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: '#f5f7ee' }}>
            <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: '#5a6b5c' }}>UGX Total</p>
            <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>
              {(collections.ugx || 0) >= 1000 ? `${((collections.ugx || 0)/1000).toFixed(0)}K` : (collections.ugx || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Room Status Grid + Recent Activity */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-4 mb-4">
        {/* Room Status Grid */}
        <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Room Status</p>
            <button onClick={() => navigate('/calendar')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#1b3520' }}>
              View Calendar <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            {Object.entries(ROOM_STATUS_COLORS).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1 text-xs" style={{ color: '#5a6b5c' }}>
                <span className="w-2 h-2 rounded-sm" style={{ background: v.color }} />{v.label}
              </span>
            ))}
            <span className="w-px h-3 self-center" style={{ background: '#dde7c8' }} />
            {Object.entries(CLEAN_DOT).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1 text-xs" style={{ color: '#5a6b5c' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />{v.label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {rooms.map(room => {
              const s = ROOM_STATUS_COLORS[room.status] || ROOM_STATUS_COLORS.available
              const dot = CLEAN_DOT[room.housekeepingStatus] || CLEAN_DOT.clean
              return (
                <div key={room.id} title={`Room ${room.number} — ${s.label} · ${dot.label}`}
                  className="relative rounded-lg p-2 text-center cursor-pointer transition-transform hover:scale-105"
                  style={{ background: s.bg }}
                  onClick={() => navigate('/calendar')}
                >
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: dot.color }} />
                  <p className="text-xs font-bold" style={{ color: s.color }}>{room.number}</p>
                </div>
              )
            })}
            {rooms.length === 0 && <p className="col-span-5 text-xs text-center py-2" style={{ color: '#9db87a' }}>No rooms loaded</p>}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>Recent Activity</p>
            <button onClick={() => navigate('/users?tab=activity')} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: '#1b3520' }}>
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {activity.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#f5f7ee' }}>
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: '#1b3520' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-tight" style={{ color: '#1c2b1e' }}>
                    <span style={{ fontWeight: 600 }}>{a.actor?.name || 'System'}</span>{' '}
                    {ACTION_LABELS[a.action] || a.action}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9db87a' }}>{relativeTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: '#5a6b5c' }}>No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: '#dde7c8' }}>
        <p className="font-semibold text-sm mb-3" style={{ color: '#1c2b1e' }}>Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {['admin', 'frontdesk'].includes(user?.role) && (
            <button onClick={() => setShowBooking(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ background: '#1b3520' }}>
              + New Booking
            </button>
          )}
          <button onClick={() => navigate('/housekeeping')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Bed className="w-4 h-4" /> Housekeeping
          </button>
          <button onClick={() => navigate('/finance')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Zap className="w-4 h-4" /> Finance Ledger
          </button>
          <button onClick={() => navigate('/calendar')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            View Calendar →
          </button>
        </div>
      </div>

      {showBooking && <NewBookingModal onClose={() => setShowBooking(false)} />}
    </div>
  )
}
