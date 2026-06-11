import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Grid2x2, Table2, ChevronDown } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const AVAIL_META = {
  available: { label: 'Available', bg: '#d1fae5', color: '#065f46' },
  occupied: { label: 'Occupied', bg: '#fee2e2', color: '#b91c1c' },
}
const CLEAN_META = {
  dirty: { label: 'Dirty', bg: '#fef3c7', color: '#92400e' },
  cleaning: { label: 'In Progress', bg: '#ffedd5', color: '#c2410c' },
  clean: { label: 'Clean', bg: '#dbeafe', color: '#1e40af' },
}
const AVAIL_OPTIONS = ['available', 'occupied']
const CLEAN_OPTIONS = ['dirty', 'cleaning', 'clean']
const ROOM_TYPES = ['Standard Double', 'Standard Twin', 'Deluxe Double', 'Deluxe Twin', 'Family Room', 'Executive Suite', 'Honeymoon Suite']

function getActiveReservation(room) {
  const activeStatuses = new Set(['pending', 'confirmed', 'checked_in'])
  return room.reservationRooms?.map(rr => rr.reservation).find(reservation => reservation && activeStatuses.has(reservation.status)) || null
}

function RoomModal({ room, onClose, onSaved, canDelete }) {
  const isEditing = !!room
  const [form, setForm] = useState({
    number: room?.number || '',
    type: room?.type || ROOM_TYPES[0],
    capacity: room?.capacity || 2,
    defaultRate: room?.defaultRate ?? '',
    status: room?.status || 'available',
    housekeepingStatus: room?.housekeepingStatus || 'clean',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!form.number || !form.defaultRate) {
      setError('Room number and rate are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        number: form.number,
        type: form.type,
        capacity: Number(form.capacity),
        defaultRate: Number(form.defaultRate),
        status: form.status,
        housekeepingStatus: form.housekeepingStatus,
      }
      if (isEditing) {
        await api.patch(`/rooms/${room.id}`, payload)
      } else {
        await api.post('/rooms', payload)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save room.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b" style={{ borderColor: '#dde7c8' }}>
          <h2 className="font-display text-xl font-bold" style={{ color: '#1c2b1e' }}>{isEditing ? 'Edit Room' : 'Add New Room'}</h2>
          <p className="text-sm mt-0.5" style={{ color: '#5a6b5c' }}>{isEditing ? 'Update the room record and status values.' : 'Create a new room in the inventory.'}</p>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Room Number *</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                placeholder="e.g. R301"
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Capacity</label>
              <input
                type="number" min="1" max="10"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Room Type</label>
            <div className="relative">
              <select
                className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#5a6b5c' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Nightly Rate (USD) *</label>
              <input
                type="number" min="0" step="0.01"
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                placeholder="e.g. 250.00"
                value={form.defaultRate}
                onChange={e => setForm(f => ({ ...f, defaultRate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Availability</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                {AVAIL_OPTIONS.map(s => <option key={s} value={s}>{AVAIL_META[s].label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Housekeeping</label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}
              value={form.housekeepingStatus}
              onChange={e => setForm(f => ({ ...f, housekeepingStatus: e.target.value }))}
            >
              {CLEAN_OPTIONS.map(s => <option key={s} value={s}>{CLEAN_META[s].label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {isEditing && canDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`Delete room ${room.number}?`)) return
                  await api.delete(`/rooms/${room.id}`)
                  onSaved()
                  onClose()
                }}
                className="px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                style={{ borderColor: '#fecaca', color: '#b91c1c' }}
              >
                Delete
              </button>
            )}
            <div className="flex-1 flex gap-3 justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: saving ? '#9db87a' : '#1b3520' }}
              >
                {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Room'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function StatusDropdown({ value, meta, options, field, roomId, onUpdated, disabled }) {
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const current = meta[value] || Object.values(meta)[0]

  async function change(next) {
    setOpen(false)
    if (next === value) return
    setUpdating(true)
    try {
      await api.patch(`/rooms/${roomId}/status`, { [field]: next })
      onUpdated()
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={updating || disabled}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-opacity disabled:opacity-60"
        style={{ background: current.bg, color: current.color }}
      >
        {updating ? '…' : current.label}
        {!disabled && <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border shadow-lg py-1 min-w-36" style={{ borderColor: '#dde7c8' }}>
            {options.map(s => (
              <button
                key={s}
                onClick={() => change(s)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-sage-50 transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: meta[s].color }} />
                {meta[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RoomCard({ room, canEdit, onEdit, onUpdated }) {
  const availMeta = AVAIL_META[room.status] || AVAIL_META.available
  const cleanMeta = CLEAN_META[room.housekeepingStatus] || CLEAN_META.clean
  const guest = getActiveReservation(room)
  return (
    <div
      className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 transition-all hover:shadow-md"
      style={{ borderColor: '#dde7c8', borderLeftColor: availMeta.color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{room.number}</h3>
          <p className="text-xs mt-0.5" style={{ color: '#5a6b5c' }}>{room.type}</p>
        </div>
        {canEdit && (
          <button onClick={() => onEdit(room)} className="p-2 rounded-xl border" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusDropdown value={room.status} meta={AVAIL_META} options={AVAIL_OPTIONS} field="status" roomId={room.id} onUpdated={onUpdated} disabled={!canEdit} />
        <StatusDropdown value={room.housekeepingStatus} meta={CLEAN_META} options={CLEAN_OPTIONS} field="housekeepingStatus" roomId={room.id} onUpdated={onUpdated} disabled={!canEdit} />
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: '#5a6b5c' }}>
        <span>Capacity: {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</span>
        <span className="font-semibold" style={{ color: cleanMeta.color }}>${Number(room.defaultRate).toFixed(0)}/night</span>
      </div>

      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#f5f7ee', color: '#5a6b5c' }}>
        <span className="font-semibold" style={{ color: '#1c2b1e' }}>Guest: </span>
        {guest?.guestName || 'No active guest'}
      </div>
    </div>
  )
}

export default function Rooms() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const canWrite = ['admin', 'frontdesk', 'housekeeping'].includes(user?.role)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [view, setView] = useState('table')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    api.get('/rooms')
      .then(r => setRooms(r.data))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = rooms.filter(room => {
    if (filterStatus !== 'all' && room.status !== filterStatus) return false
    const q = search.trim().toLowerCase()
    const guest = getActiveReservation(room)
    if (q && !(room.number.toLowerCase().includes(q) || room.type.toLowerCase().includes(q) || guest?.guestName?.toLowerCase().includes(q))) return false
    return true
  })

  const counts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
  }

  function openEdit(room) {
    setEditingRoom(room)
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Rooms</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Manage room inventory, statuses, and housekeeping links.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditingRoom(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#1b3520' }}
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 stagger-2">
        {[
          { key: 'all', label: 'Total', color: '#1b3520' },
          { key: 'available', label: 'Available', color: '#065f46' },
          { key: 'occupied', label: 'Occupied', color: '#b91c1c' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className="bg-white rounded-2xl border p-3 text-left transition-all"
            style={{
              borderColor: filterStatus === s.key ? s.color : '#dde7c8',
              borderWidth: filterStatus === s.key ? 2 : 1,
              boxShadow: filterStatus === s.key ? `0 0 0 1px ${s.color}22` : 'none',
            }}
          >
            <div className="text-2xl font-display font-bold" style={{ color: s.color }}>{counts[s.key]}</div>
            <div className="text-xs font-medium mt-0.5" style={{ color: '#5a6b5c' }}>{s.label}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-xl">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search room number or type..."
            className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
            style={{ borderColor: '#dde7c8' }}
          />
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button onClick={() => setView('cards')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: view === 'cards' ? '#1b3520' : '#dde7c8', color: view === 'cards' ? '#1b3520' : '#5a6b5c', background: '#fff' }}>
            <Grid2x2 className="w-4 h-4" /> Cards
          </button>
          <button onClick={() => setView('table')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: view === 'table' ? '#1b3520' : '#dde7c8', color: view === 'table' ? '#1b3520' : '#5a6b5c', background: '#fff' }}>
            <Table2 className="w-4 h-4" /> Table
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: '#dde7c8' }}>
          <p className="font-semibold mb-1" style={{ color: '#1c2b1e' }}>No rooms found</p>
          <p className="text-sm" style={{ color: '#5a6b5c' }}>
            {filterStatus === 'all' ? 'No rooms have been added yet.' : `No rooms with status "${filterStatus}".`}
          </p>
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-3">
          {filtered.map(room => (
            <RoomCard key={room.id} room={room} canEdit={canWrite} onEdit={openEdit} onUpdated={load} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden stagger-3" style={{ borderColor: '#dde7c8' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-sage-50">
                <tr>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Room</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden md:table-cell" style={{ color: '#5a6b5c' }}>Type</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden lg:table-cell" style={{ color: '#5a6b5c' }}>Guest</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Availability</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Housekeeping</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden lg:table-cell" style={{ color: '#5a6b5c' }}>Rate</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-right" style={{ color: '#5a6b5c' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(room => (
                  <tr key={room.id} className="border-t" style={{ borderColor: '#eef2e4' }}>
                    <td className="px-4 py-4">
                      <div className="font-semibold" style={{ color: '#1c2b1e' }}>{room.number}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#5a6b5c' }}>Capacity {room.capacity}</div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell" style={{ color: '#5a6b5c' }}>{room.type}</td>
                    <td className="px-4 py-4 hidden lg:table-cell" style={{ color: '#5a6b5c' }}>{getActiveReservation(room)?.guestName || 'No active guest'}</td>
                    <td className="px-4 py-4">
                      <StatusDropdown value={room.status} meta={AVAIL_META} options={AVAIL_OPTIONS} field="status" roomId={room.id} onUpdated={load} disabled={!canWrite} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusDropdown value={room.housekeepingStatus} meta={CLEAN_META} options={CLEAN_OPTIONS} field="housekeepingStatus" roomId={room.id} onUpdated={load} disabled={!canWrite} />
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell" style={{ color: '#1c2b1e' }}>${Number(room.defaultRate).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite && (
                          <button onClick={() => openEdit(room)} className="p-2 rounded-lg border" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }} title="Edit room">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete room ${room.number}?`)) return
                              await api.delete(`/rooms/${room.id}`)
                              load()
                            }}
                            className="p-2 rounded-lg border"
                            style={{ borderColor: '#fecaca', color: '#b91c1c' }}
                            title="Delete room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <RoomModal room={editingRoom} canDelete={isAdmin} onClose={() => { setShowModal(false); setEditingRoom(null) }} onSaved={load} />}
    </div>
  )
}
