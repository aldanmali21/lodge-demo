import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import FilterPanel from '../components/FilterPanel'

const DAYS_SHOWN = 14

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDate(d) {
  return d.toISOString().split('T')[0]
}

function dayLabel(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

function dayNum(d) {
  return d.getDate()
}

export default function Calendar() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return d
  })
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({})

  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(startDate, i))

  useEffect(() => {
    setLoading(true)
    const from = formatDate(startDate)
    const to = formatDate(addDays(startDate, DAYS_SHOWN))
    Promise.all([
      api.get('/rooms'),
      api.get(`/reservations?from=${from}&to=${to}`),
    ]).then(([r, res]) => {
      setRooms(r.data)
      setReservations(res.data)
    }).finally(() => setLoading(false))
  }, [startDate])

  function prev() { setStartDate(d => addDays(d, -7)) }
  function next() { setStartDate(d => addDays(d, 7)) }

  const monthLabel = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Map reservation blocks to grid positions
  const filteredRooms = rooms.filter(r => !filters.roomType || r.type === filters.roomType)
  const filteredReservations = reservations.filter(r => !filters.resStatus || r.status === filters.resStatus)

  function getReservationsForRoom(roomId) {
    return filteredReservations.filter(r =>
      r.reservationRooms?.some(rr => rr.roomId === roomId)
    )
  }

  function getBlockStyle(status) {
    if (status === 'checked_in')
      return { bg: '#dcfce7', border: '#16a34a', dot: '#16a34a', text: '#14532d' }
    if (status === 'confirmed' || status === 'pending')
      return { bg: '#fef3c7', border: '#d97706', dot: '#d97706', text: '#78350f' }
    return { bg: '#f3f4f6', border: '#9ca3af', dot: '#9ca3af', text: '#374151' }
  }

  function getVisibleSpan(r, fromCol) {
    const checkout = formatDate(new Date(r.checkoutDate))
    let span = 0
    for (let j = fromCol; j < days.length; j++) {
      if (formatDate(days[j]) < checkout) span++
      else break
    }
    return Math.max(1, span)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Reservation Tape Chart</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Manage allocations and view occupancy at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border rounded-xl overflow-hidden" style={{ borderColor: '#dde7c8' }}>
            <button onClick={prev} className="px-3 py-2 hover:bg-sage-100 transition-colors">
              <ChevronLeft className="w-4 h-4" style={{ color: '#5a6b5c' }} />
            </button>
            <span className="px-4 text-sm font-medium min-w-36 text-center" style={{ color: '#1c2b1e' }}>{monthLabel}</span>
            <button onClick={next} className="px-3 py-2 hover:bg-sage-100 transition-colors">
              <ChevronRight className="w-4 h-4" style={{ color: '#5a6b5c' }} />
            </button>
          </div>
          <div className="relative">
            <button onClick={() => setShowFilter(s => !s)} className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {Object.values(filters).some(Boolean) && <span className="w-2 h-2 rounded-full" style={{ background: '#1b3520' }} />}
            </button>
            {showFilter && (
              <FilterPanel
                filters={[
                  { key: 'roomType', label: 'Room Type', type: 'chips', options: [
                    { value: 'Standard Double', label: 'Standard Double' },
                    { value: 'Standard Twin', label: 'Standard Twin' },
                    { value: 'Deluxe Double', label: 'Deluxe Double' },
                    { value: 'Family Room', label: 'Family Room' },
                    { value: 'Executive Suite', label: 'Executive Suite' },
                    { value: 'Honeymoon Suite', label: 'Honeymoon Suite' },
                  ]},
                  { key: 'resStatus', label: 'Reservation Status', type: 'chips', options: [
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'checked_in', label: 'Checked In' },
                    { value: 'checked_out', label: 'Checked Out' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]},
                ]}
                values={filters}
                onChange={(k, v) => setFilters(f => ({ ...f, [k]: v }))}
                onClose={() => setShowFilter(false)}
                onReset={() => setFilters({})}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-auto stagger-2" style={{ borderColor: '#dde7c8' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1b3520', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <table className="w-full border-collapse" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase border-b border-r sticky left-0 bg-white z-10" style={{ color: '#5a6b5c', borderColor: '#dde7c8', minWidth: 180 }}>
                  Accommodations
                </th>
                {days.map((d, i) => {
                  const isToday = formatDate(d) === formatDate(new Date())
                  return (
                    <th key={i} className="px-2 py-3 text-center text-xs font-semibold border-b border-r" style={{ borderColor: '#dde7c8', minWidth: 72, background: isToday ? '#f5f7ee' : 'white' }}>
                      <div className="uppercase" style={{ color: '#5a6b5c' }}>{dayLabel(d)}</div>
                      <div className="font-bold text-base" style={{ color: isToday ? '#1b3520' : '#1c2b1e' }}>{dayNum(d)}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(room => {
                const roomReservations = getReservationsForRoom(room.id)
                return (
                  <tr key={room.id} className="border-b hover:bg-sage-50 transition-colors" style={{ borderColor: '#dde7c8' }}>
                    {/* Room label */}
                    <td className="px-4 py-3 border-r sticky left-0 bg-white z-10" style={{ borderColor: '#dde7c8' }}>
                      <div className="font-semibold text-sm" style={{ color: '#1c2b1e' }}>{room.type}</div>
                      <div className="text-xs" style={{ color: '#5a6b5c' }}>Room {room.number}</div>
                    </td>
                    {/* Day cells */}
                    {days.map((d, ci) => {
                      const ds = formatDate(d)
                      const firstVisibleDay = formatDate(days[0])

                      const covering = roomReservations.find(r => {
                        const checkin = formatDate(new Date(r.checkinDate))
                        const checkout = formatDate(new Date(r.checkoutDate))
                        return ds >= checkin && ds < checkout
                      })

                      if (!covering) {
                        return <td key={ci} className="border-r" style={{ borderColor: '#dde7c8', height: 52 }} />
                      }

                      const checkin = formatDate(new Date(covering.checkinDate))
                      const isContinuation = checkin < firstVisibleDay
                      // Only render once per reservation: at its check-in day, or at column 0 if it continues from a previous page
                      const isFirstCell = ds === checkin || (isContinuation && ds === firstVisibleDay)
                      if (!isFirstCell) return null

                      const span = getVisibleSpan(covering, ci)
                      const style = getBlockStyle(covering.status)

                      return (
                        <td key={ci} colSpan={span} className="py-2 px-1 border-r" style={{ borderColor: '#dde7c8' }}>
                          <div
                            className="rounded-lg px-2 py-1.5 cursor-pointer transition-opacity hover:opacity-80 flex items-center gap-1.5"
                            style={{
                              background: style.bg,
                              border: `1px solid ${style.border}`,
                              borderLeft: isContinuation ? `3px dashed ${style.border}` : `1px solid ${style.border}`,
                            }}
                            onClick={() => covering.folio?.id && navigate(`/folios/${covering.folio.id}`)}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: style.dot }} />
                            <span className="text-xs font-medium truncate" style={{ color: style.text }}>
                              {covering.guestName}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan={DAYS_SHOWN + 1} className="text-center py-8 text-sm" style={{ color: '#5a6b5c' }}>
                    No rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Legend */}
        <div className="px-4 py-3 border-t flex items-center gap-6 text-xs" style={{ borderColor: '#dde7c8' }}>
          <span className="font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Legend:</span>
          {[
            { color: '#16a34a', label: 'Checked-In' },
            { color: '#d97706', label: 'Confirmed/Pending' },
            { color: '#9ca3af', label: 'Checked-Out' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5" style={{ color: '#5a6b5c' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
