import { useEffect, useState } from 'react'
import { ChevronDown, Calendar, Users, MapPin, Plus, Car, Sailboat, UserPlus, X, Pencil } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../components/Toast'

function formatDate(d) { return d.toISOString().split('T')[0] }

const DATE_PRESETS = [
  { id: 'today',  label: 'Today' },
  { id: 'week',   label: 'This Week' },
  { id: 'month',  label: 'This Month' },
  { id: 'custom', label: 'Custom' },
]

function getPresetRange(preset) {
  const today = new Date()
  const todayStr = formatDate(today)
  if (preset === 'today') return { from: todayStr, to: todayStr }
  if (preset === 'week') {
    const start = new Date(today)
    start.setDate(start.getDate() - today.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { from: formatDate(start), to: formatDate(end) }
  }
  if (preset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { from: formatDate(start), to: formatDate(end) }
  }
  return { from: todayStr, to: todayStr }
}

function ActivityIcon({ name }) {
  if (name?.toLowerCase().includes('drive') || name?.toLowerCase().includes('game')) return <Car className="w-5 h-5" style={{ color: '#c8a96e' }} />
  if (name?.toLowerCase().includes('boat') || name?.toLowerCase().includes('cruise')) return <Sailboat className="w-5 h-5" style={{ color: '#c8a96e' }} />
  return <Users className="w-5 h-5" style={{ color: '#c8a96e' }} />
}

const SCHEDULE_STATUS = {
  not_started: { label: 'Not started', bg: '#f3f4f6', color: '#6b7280' },
  in_progress: { label: 'In progress', bg: '#ffedd5', color: '#c2410c' },
  completed:   { label: 'Completed',   bg: '#d1fae5', color: '#065f46' },
}
const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'not_started', label: 'Not started' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
]

function ScheduleModal({ schedule, onClose, onSaved }) {
  const today = new Date().toISOString().split('T')[0]
  const [activities, setActivities] = useState([])
  const [form, setForm] = useState({
    activityId: schedule?.activityId ? String(schedule.activityId) : '',
    fromDate: schedule ? formatDate(schedule.scheduledAt) : today,
    fromTime: schedule ? new Date(schedule.scheduledAt).toISOString().slice(11, 16) : '08:00',
    toDate: schedule?.endAt ? formatDate(schedule.endAt) : today,
    toTime: schedule?.endAt ? new Date(schedule.endAt).toISOString().slice(11, 16) : '10:00',
    capacity: schedule?.capacity ?? '',
    location: schedule?.location || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedActivity = activities.find(a => String(a.id) === String(form.activityId))

  useEffect(() => {
    api.get('/activities').then(r => {
      setActivities(r.data)
      if (r.data.length) setForm(f => ({ ...f, activityId: f.activityId || String(r.data[0].id) }))
    }).catch(() => {})
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (!form.activityId || !form.fromDate || !form.fromTime) { setError('Activity and start date/time are required.'); return }
    setSaving(true)
    setError('')
    try {
      const scheduledAt = new Date(`${form.fromDate}T${form.fromTime}:00`).toISOString()
      const endAt = form.toDate && form.toTime ? new Date(`${form.toDate}T${form.toTime}:00`).toISOString() : null
      const payload = {
        activityId: Number(form.activityId),
        scheduledAt, endAt,
        capacity: form.capacity === '' ? null : Number(form.capacity),
        location: form.location,
      }
      if (schedule) {
        await api.patch(`/activities/schedules/${schedule.id}`, payload)
      } else {
        await api.post('/activities/schedules', payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create schedule.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b" style={{ borderColor: '#dde7c8' }}>
          <h2 className="font-display text-xl font-bold" style={{ color: '#1c2b1e' }}>{schedule ? 'Edit Schedule' : 'Schedule Activity'}</h2>
          <p className="text-sm mt-0.5" style={{ color: '#5a6b5c' }}>{schedule ? 'Update the slot details and timing.' : 'Add a new activity slot to the coordinator board.'}</p>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Activity *</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.activityId}
                onChange={e => setForm(f => ({ ...f, activityId: e.target.value }))}
              >
                {activities.length === 0 && <option>Loading…</option>}
                {activities.map(a => <option key={a.id} value={a.id}>{a.name} (${Number(a.price).toFixed(0)}/pax · max {a.maxCapacity})</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#5a6b5c' }} />
            </div>
          </div>

          {/* From */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>From *</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
              <input type="time" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.fromTime} onChange={e => setForm(f => ({ ...f, fromTime: e.target.value }))} />
            </div>
          </div>

          {/* To */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>To</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
              <input type="time" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.toTime} onChange={e => setForm(f => ({ ...f, toTime: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Capacity</label>
              <input type="number" min="1" className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                placeholder={selectedActivity ? `default ${selectedActivity.maxCapacity}` : 'max pax'}
                value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Location</label>
              <input className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                placeholder="e.g. Main Gate"
                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: saving ? '#9db87a' : '#1b3520' }}>
              {saving ? 'Saving…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BookGuestModal({ schedule, onClose, onSaved }) {
  const [reservations, setReservations] = useState([])
  const [form, setForm] = useState({ reservationId: '', paxCount: 1 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cap = schedule.effectiveCapacity ?? schedule.activity?.maxCapacity ?? 0
  const remaining = cap - (schedule.bookedPax || 0)
  const unitPrice = Number(schedule.price ?? schedule.activity?.price ?? 0)
  const total = unitPrice * Number(form.paxCount || 0)

  useEffect(() => {
    api.get('/reservations?status=checked_in').then(r => {
      setReservations(r.data)
      if (r.data.length) setForm(f => ({ ...f, reservationId: String(r.data[0].id) }))
    }).catch(() => {})
  }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    const pax = Number(form.paxCount)
    if (!pax || pax < 1) return setError('Pax count must be at least 1.')
    if (pax > remaining) return setError(`Only ${remaining} space(s) left.`)
    if (!form.reservationId) return setError('Select a guest.')

    setSaving(true)
    try {
      await api.post(`/activities/${schedule.id}/book`, { reservationId: Number(form.reservationId), paxCount: pax })
      toast(`Charged $${total.toFixed(2)} to room folio.`)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book guest.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: '#1b3520' }}>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Book Guest</h2>
            <p className="text-xs text-white/60">{schedule.activity?.name} · {remaining} space(s) left</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Guest *</label>
            <div className="relative">
              <select className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.reservationId} onChange={e => setForm(f => ({ ...f, reservationId: e.target.value }))}>
                {reservations.length === 0 && <option value="">No checked-in guests available</option>}
                {reservations.map(r => <option key={r.id} value={r.id}>{r.guestName} ({r.reservationRooms?.map(rr => rr.room?.number).filter(Boolean).join(', ') || 'No room'})</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#5a6b5c' }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Pax Count *</label>
            <input type="number" min={1} max={remaining} className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
              value={form.paxCount} onChange={e => setForm(f => ({ ...f, paxCount: e.target.value }))} />
          </div>

          {/* Price summary */}
          <div className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm" style={{ background: '#f5f7ee' }}>
            <span style={{ color: '#5a6b5c' }}>
              ${unitPrice.toFixed(2)} × {form.paxCount || 0} pax
            </span>
            <span className="font-bold" style={{ color: '#1c2b1e' }}>
              Charge $${total.toFixed(2)} to folio
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Cancel</button>
            <button type="submit" disabled={saving || remaining <= 0} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#1b3520' }}>
              {saving ? 'Booking…' : remaining <= 0 ? 'Full' : 'Book Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Activities() {
  const { user } = useAuth()
  const canWrite = ['admin', 'frontdesk'].includes(user?.role)
  const canChangeStatus = ['admin', 'frontdesk', 'guide'].includes(user?.role)
  const [preset, setPreset] = useState('today')
  const [range, setRange] = useState(() => getPresetRange('today'))
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [bookingFor, setBookingFor] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  function loadSchedules() {
    setLoading(true)
    const params = new URLSearchParams({ from: range.from, to: range.to })
    if (statusFilter !== 'all') params.set('status', statusFilter)
    api.get(`/activities/schedules?${params.toString()}`)
      .then(r => setSchedules(r.data))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadSchedules() }, [range.from, range.to, statusFilter])

  function changePreset(next) {
    setPreset(next)
    if (next !== 'custom') setRange(getPresetRange(next))
  }

  async function changeScheduleStatus(scheduleId, status) {
    setSchedules(ss => ss.map(s => s.id === scheduleId ? { ...s, status } : s))
    try {
      await api.patch(`/activities/schedules/${scheduleId}/status`, { status })
      toast(`Status → ${SCHEDULE_STATUS[status]?.label || status}`)
    } catch (e) {
      toast(e.response?.data?.error || 'Failed to update status.', 'error')
      loadSchedules()
    }
  }

  const visibleSchedules = statusFilter === 'all' ? schedules : schedules.filter(s => s.status === statusFilter)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Coordinator Board</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Manage activity schedules and guest manifests.</p>
        </div>
        {canWrite && (
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shrink-0"
            style={{ background: '#1b3520' }}
            onMouseEnter={e => e.currentTarget.style.background = '#2d5a22'}
            onMouseLeave={e => e.currentTarget.style.background = '#1b3520'}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Activity</span>
          </button>
        )}
      </div>

      {/* Date filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-3 stagger-2">
        {DATE_PRESETS.map(p => (
          <button key={p.id} onClick={() => changePreset(p.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
            style={{ background: preset === p.id ? '#1b3520' : '#f5f7ee', color: preset === p.id ? 'white' : '#5a6b5c', borderColor: preset === p.id ? '#1b3520' : '#dde7c8' }}>
            {p.label}
          </button>
        ))}
        {preset !== 'custom' && (
          <span className="text-sm ml-1" style={{ color: '#9db87a' }}>
            {range.from === range.to ? range.from : `${range.from} → ${range.to}`}
          </span>
        )}
      </div>

      {preset === 'custom' && (
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <label className="bg-white border rounded-xl px-3 py-2.5 flex items-center justify-between gap-3" style={{ borderColor: '#dde7c8' }}>
            <span className="text-xs font-semibold uppercase tracking-wider shrink-0" style={{ color: '#5a6b5c' }}>From</span>
            <input type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} className="outline-none text-sm" />
          </label>
          <label className="bg-white border rounded-xl px-3 py-2.5 flex items-center justify-between gap-3" style={{ borderColor: '#dde7c8' }}>
            <span className="text-xs font-semibold uppercase tracking-wider shrink-0" style={{ color: '#5a6b5c' }}>To</span>
            <input type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} className="outline-none text-sm" />
          </label>
        </div>
      )}

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 stagger-2">
        {STATUS_FILTERS.map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0"
            style={{
              background: statusFilter === f.id ? '#1b3520' : '#f5f7ee',
              color: statusFilter === f.id ? 'white' : '#5a6b5c',
              border: `2px solid ${statusFilter === f.id ? '#1b3520' : '#dde7c8'}`,
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : visibleSchedules.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#dde7c8' }}>
          <p className="font-semibold mb-1" style={{ color: '#1c2b1e' }}>No activities {statusFilter !== 'all' ? `(${SCHEDULE_STATUS[statusFilter]?.label.toLowerCase()})` : 'scheduled'}</p>
          <p className="text-sm" style={{ color: '#5a6b5c' }}>Nothing on the books for this date/filter.</p>
          {canWrite && (
            <button onClick={() => setShowSchedule(true)} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1b3520' }}>
              Schedule an Activity
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 stagger-2">
          {visibleSchedules.map(s => {
            const cap = s.effectiveCapacity ?? s.activity?.maxCapacity ?? 0
            const pct = cap ? (s.bookedPax / cap) * 100 : 0
            const isFull = s.bookedPax >= cap
            const when = new Date(s.scheduledAt)
            const end = s.endAt ? new Date(s.endAt) : null
            const time = when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            const endTime = end ? end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null
            const dateStr = when.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            const sMeta = SCHEDULE_STATUS[s.status] || SCHEDULE_STATUS.not_started
            const isExpanded = expanded === s.id

            return (
              <div key={s.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all" style={{ borderColor: '#dde7c8' }}>
                <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                  {/* Date + From→To */}
                  <div className="w-28 shrink-0">
                    <div className="text-xs font-semibold" style={{ color: '#c8a96e' }}>{dateStr}</div>
                    <div className="font-display text-xl font-bold leading-tight" style={{ color: '#1c2b1e' }}>{time}</div>
                    <div className="text-xs" style={{ color: '#5a6b5c' }}>{endTime ? `→ ${endTime}` : 'end TBD'}</div>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f5f7ee' }}>
                    <ActivityIcon name={s.activity?.name} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold" style={{ color: '#1c2b1e' }}>{s.activity?.name}</h3>
                    <div className="flex items-center gap-4 mt-0.5 text-xs" style={{ color: '#5a6b5c' }}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Lead Guide: Staff
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {s.location || 'TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="w-36 shrink-0 hidden md:block">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1" style={{ color: '#5a6b5c' }}>
                      <span className="uppercase tracking-wider">Capacity</span>
                      <span style={{ color: '#1c2b1e' }}>{s.bookedPax}/{cap}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: '#eef2e4' }}>
                      <div className="h-1.5 rounded-full transition-all" style={{
                        width: `${Math.min(100, pct)}%`,
                        background: isFull ? '#dc2626' : pct > 80 ? '#d97706' : '#1b3520',
                      }} />
                    </div>
                  </div>

                  {/* Status badge / dropdown */}
                  <div className="shrink-0" onClick={e => e.stopPropagation()}>
                    {canChangeStatus ? (
                      <select
                        value={s.status || 'not_started'}
                        onChange={e => changeScheduleStatus(s.id, e.target.value)}
                        className="appearance-none rounded-full text-xs font-semibold px-3 py-1.5 outline-none cursor-pointer border"
                        style={{ background: sMeta.bg, color: sMeta.color, borderColor: sMeta.bg }}
                      >
                        {Object.entries(SCHEDULE_STATUS).map(([v, m]) => <option key={v} value={v} style={{ color: '#1c2b1e' }}>{m.label}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: sMeta.bg, color: sMeta.color }}>{sMeta.label}</span>
                    )}
                  </div>

                  {canWrite && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingSchedule(s); setShowSchedule(true) }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all"
                      style={{ background: '#f5f7ee', color: '#1b3520', border: '1px solid #dde7c8' }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}

                  {canWrite && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setBookingFor(s) }}
                      disabled={isFull}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all disabled:opacity-40"
                      style={{ background: '#f5f7ee', color: '#1b3520', border: '1px solid #dde7c8' }}
                      title={isFull ? 'Activity is full' : 'Book a guest'}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Book</span>
                    </button>
                  )}

                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: '#5a6b5c' }} />
                </div>

                {isExpanded && (
                  <div className="border-t px-5 py-4" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#5a6b5c' }}>Guest Manifest</p>
                    {s.bookings?.length > 0 ? (
                      <div className="space-y-2">
                        {s.bookings.map(b => (
                          <div key={b.id} className="flex items-center justify-between text-sm">
                            <span style={{ color: '#1c2b1e' }}>
                              {b.guestLabel || b.reservation?.guestName || `Booking #${b.id}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#d1fae5', color: '#065f46' }}>{b.paxCount} pax</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: '#5a6b5c' }}>No guests booked yet.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showSchedule && <ScheduleModal schedule={editingSchedule} onClose={() => { setShowSchedule(false); setEditingSchedule(null) }} onSaved={loadSchedules} />}
      {bookingFor && <BookGuestModal schedule={bookingFor} onClose={() => setBookingFor(null)} onSaved={loadSchedules} />}
    </div>
  )
}
