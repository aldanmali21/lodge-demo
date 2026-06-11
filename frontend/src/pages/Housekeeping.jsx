import { useEffect, useMemo, useState } from 'react'
import { BedDouble, CalendarDays, ChevronDown, Eye, Filter, Pencil, Plus, Search, X } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../components/Toast'

const CLEAN_META = {
  dirty: { label: 'DIRTY', badge: 'badge-dirty', color: '#dc2626', bg: '#fee2e2' },
  cleaning: { label: 'IN PROGRESS', badge: 'badge-cleaning', color: '#d97706', bg: '#ffedd5' },
  clean: { label: 'CLEAN', badge: 'badge-clean', color: '#16a34a', bg: '#d1fae5' },
}

const AVAIL_META = {
  available: { label: 'Available', color: '#065f46', bg: '#d1fae5' },
  occupied: { label: 'Occupied', color: '#b91c1c', bg: '#fee2e2' },
}

const DATE_PRESETS = ['today', 'week', 'custom']
const CLEAN_FILTERS = ['all', 'dirty', 'cleaning', 'clean']
const AVAIL_FILTERS = ['all', 'available', 'occupied']

function iso(value) {
  return value.toISOString().slice(0, 10)
}

function startOfDay(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(value) {
  const d = new Date(value)
  d.setHours(23, 59, 59, 999)
  return d
}

function presetRange(preset) {
  const today = new Date()
  if (preset === 'week') {
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    return { from: iso(startOfDay(start)), to: iso(endOfDay(today)) }
  }
  return { from: iso(startOfDay(today)), to: iso(endOfDay(today)) }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(value) {
  const d = new Date(value)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}

function statusLabel(value) {
  return CLEAN_META[value]?.label || value
}

function HousekeepingBulkModal({ action, rooms, onClose, onSaved }) {
  const today = iso(new Date())
  const [date, setDate] = useState(today)
  const [selectedRoomIds, setSelectedRoomIds] = useState([])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const roomPool = rooms.filter(room => action === 'clean' ? room.housekeepingStatus === 'dirty' : room.housekeepingStatus === 'clean')
  const visibleRooms = roomPool.filter(room => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return room.number.toLowerCase().includes(q) || room.type.toLowerCase().includes(q)
  })

  function toggleRoom(id) {
    setSelectedRoomIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  async function submit(e) {
    e.preventDefault()
    if (!selectedRoomIds.length) {
      setError('Select at least one room.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/housekeeping/tasks', {
        roomIds: selectedRoomIds,
        status: action,
        date,
      })
      toast(`${selectedRoomIds.length} room(s) marked ${action}.`)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save housekeeping changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: '#1b3520' }}>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Mark {action === 'clean' ? 'Clean' : 'Dirty'}</h2>
            <p className="text-xs text-white/60">Choose a date and one or more rooms to update.</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Date</span>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Search rooms</span>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9db87a' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Room number or type"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                />
              </div>
            </label>
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#dde7c8' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>
                {action === 'clean' ? 'Dirty rooms only' : 'Clean rooms only'}
              </span>
              <span className="text-xs" style={{ color: '#5a6b5c' }}>{selectedRoomIds.length} selected</span>
            </div>
            <div className="max-h-72 overflow-y-auto p-3 space-y-2 bg-white">
              {visibleRooms.length === 0 ? (
                <p className="text-sm px-1 py-4 text-center" style={{ color: '#5a6b5c' }}>No rooms match this action filter.</p>
              ) : visibleRooms.map(room => (
                <label key={room.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border cursor-pointer" style={{ borderColor: '#eef2e4', background: selectedRoomIds.includes(room.id) ? '#f5f7ee' : 'white' }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>{room.number}</div>
                    <div className="text-xs" style={{ color: '#5a6b5c' }}>{room.type} · {room.status}</div>
                  </div>
                  <input type="checkbox" checked={selectedRoomIds.includes(room.id)} onChange={() => toggleRoom(room.id)} className="w-4 h-4" />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1b3520' }}>
              {saving ? 'Saving…' : `Save ${action === 'clean' ? 'Clean' : 'Dirty'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function HousekeepingEditModal({ task, onClose, onSaved }) {
  const [status, setStatus] = useState(task.status === 'dirty' ? 'cleaning' : task.status || 'cleaning')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.patch(`/housekeeping/tasks/${task.id}`, { status })
      toast(`${task.room.number} → ${statusLabel(status)}`)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b" style={{ borderColor: '#dde7c8' }}>
          <h2 className="font-display text-xl font-bold" style={{ color: '#1c2b1e' }}>Edit Task</h2>
          <p className="text-sm mt-0.5" style={{ color: '#5a6b5c' }}>{task.room.number} · {task.room.type}</p>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Status</label>
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none focus:outline-none" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}>
                <option value="dirty">Dirty</option>
                <option value="cleaning">In Progress</option>
                <option value="clean">Clean</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a6b5c' }} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1b3520' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Housekeeping() {
  const { user } = useAuth()
  const canWrite = ['admin', 'frontdesk', 'housekeeping'].includes(user?.role)
  const [rooms, setRooms] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState('today')
  const [range, setRange] = useState(() => presetRange('today'))
  const [cleanFilter, setCleanFilter] = useState('all')
  const [availFilter, setAvailFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [bulkAction, setBulkAction] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (range.from) params.set('from', range.from)
    if (range.to) params.set('to', range.to)
    if (cleanFilter !== 'all') params.set('status', cleanFilter)
    if (availFilter !== 'all') params.set('availability', availFilter)
    api.get(`/housekeeping/tasks?${params.toString()}`)
      .then(r => setTasks(r.data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/rooms').then(r => setRooms(r.data)).catch(() => setRooms([]))
  }, [])

  useEffect(() => {
    load()
  }, [range.from, range.to, cleanFilter, availFilter])

  function changePreset(next) {
    setPreset(next)
    if (next === 'custom') return
    setRange(presetRange(next))
  }

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter(task => {
      if (q && !(task.room?.number?.toLowerCase().includes(q) || task.room?.type?.toLowerCase().includes(q))) return false
      return true
    })
  }, [tasks, search])

  const today = iso(new Date())
  const todayTasks = tasks.filter(task => iso(new Date(task.timestamp)) === today)
  const metricRooms = {
    clean: new Set(todayTasks.filter(task => task.status === 'clean').map(task => task.roomId)).size,
    dirty: new Set(todayTasks.filter(task => task.status === 'dirty').map(task => task.roomId)).size,
    cleaning: new Set(todayTasks.filter(task => task.status === 'cleaning').map(task => task.roomId)).size,
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Housekeeping</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Track room cleanliness as dated housekeeping records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite && (
            <>
              <button onClick={() => setBulkAction('dirty')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#b91c1c' }}>
                <Plus className="w-4 h-4" /> Mark Dirty
              </button>
              <button onClick={() => setBulkAction('clean')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1b3520' }}>
                <Plus className="w-4 h-4" /> Mark Clean
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 stagger-2">
        {[
          { key: 'clean', label: 'Clean today', value: metricRooms.clean, color: '#16a34a' },
          { key: 'dirty', label: 'Dirty today', value: metricRooms.dirty, color: '#dc2626' },
          { key: 'cleaning', label: 'In progress today', value: metricRooms.cleaning, color: '#d97706' },
        ].map(card => (
          <div key={card.key} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#dde7c8' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#5a6b5c' }}>{card.label}</div>
            <div className="font-display text-3xl font-bold" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9db87a' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search room number or type..."
            className="w-full border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none bg-white"
            style={{ borderColor: '#dde7c8' }}
          />
        </div>
        <div className="flex items-center gap-2 rounded-2xl border bg-white px-2 py-1" style={{ borderColor: '#dde7c8' }}>
          <CalendarDays className="w-4 h-4" style={{ color: '#5a6b5c' }} />
          {DATE_PRESETS.map(p => (
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

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 rounded-2xl border bg-white px-2 py-1" style={{ borderColor: '#dde7c8' }}>
          <Filter className="w-4 h-4" style={{ color: '#5a6b5c' }} />
          {CLEAN_FILTERS.map(key => (
            <button
              key={key}
              onClick={() => setCleanFilter(key)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: cleanFilter === key ? (key === 'all' ? '#1b3520' : CLEAN_META[key].bg) : 'transparent', color: cleanFilter === key ? (key === 'all' ? 'white' : CLEAN_META[key].color) : '#5a6b5c' }}
            >
              {key === 'all' ? 'All status' : CLEAN_META[key].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border bg-white px-2 py-1" style={{ borderColor: '#dde7c8' }}>
          <BedDouble className="w-4 h-4" style={{ color: '#5a6b5c' }} />
          {AVAIL_FILTERS.map(key => (
            <button
              key={key}
              onClick={() => setAvailFilter(key)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: availFilter === key ? (key === 'all' ? '#1b3520' : AVAIL_META[key].bg) : 'transparent', color: availFilter === key ? (key === 'all' ? 'white' : AVAIL_META[key].color) : '#5a6b5c' }}
            >
              {key === 'all' ? 'All rooms' : AVAIL_META[key].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border p-8 animate-pulse" style={{ borderColor: '#dde7c8' }}>
          <div className="h-72 rounded-xl bg-sage-50" />
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#dde7c8' }}>
          <p className="font-semibold" style={{ color: '#1c2b1e' }}>No housekeeping records found.</p>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Try a different date range or filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#dde7c8' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-sage-50">
                <tr>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Date</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Room</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden md:table-cell" style={{ color: '#5a6b5c' }}>Availability</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Cleanliness</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden lg:table-cell" style={{ color: '#5a6b5c' }}>Notes</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-right" style={{ color: '#5a6b5c' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map(task => {
                  const clean = CLEAN_META[task.status] || CLEAN_META.clean
                  const avail = AVAIL_META[task.room?.status] || AVAIL_META.available
                  return (
                    <tr key={task.id} className="border-t" style={{ borderColor: '#eef2e4' }}>
                      <td className="px-4 py-4 text-sm" style={{ color: '#5a6b5c' }}>{formatDateTime(task.timestamp)}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold" style={{ color: '#1c2b1e' }}>{task.room?.number}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#5a6b5c' }}>{task.room?.type}</div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={{ background: avail.bg, color: avail.color }}>{avail.label}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={{ background: clean.bg, color: clean.color }}>{clean.label}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-sm" style={{ color: '#5a6b5c' }}>{task.notes || '—'}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canWrite ? (
                            <button onClick={() => setEditingTask(task)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                          ) : (
                            <button onClick={() => setEditingTask(task)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
                              <Eye className="w-3.5 h-3.5" /> View
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

      {bulkAction && <HousekeepingBulkModal action={bulkAction} rooms={rooms} onClose={() => setBulkAction(null)} onSaved={load} />}
      {editingTask && <HousekeepingEditModal task={editingTask} onClose={() => setEditingTask(null)} onSaved={load} />}
    </div>
  )
}
