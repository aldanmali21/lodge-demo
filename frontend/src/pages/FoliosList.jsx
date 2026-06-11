import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, TrendingUp, CheckCircle2, Clock, Pencil } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import FolioQuickActions from '../components/FolioQuickActions'

const STATUS_TABS = ['all', 'open', 'paid', 'closed']

const STATUS_META = {
  open:   { label: 'Open',   bg: '#d1fae5', color: '#065f46' },
  paid:   { label: 'Paid',   bg: '#dbeafe', color: '#1e40af' },
  closed: { label: 'Closed', bg: '#f3f4f6', color: '#6b7280' },
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

const PAGE_SIZE = 15

export default function FoliosList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = ['admin', 'frontdesk'].includes(user?.role)
  const [folios, setFolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [editFolio, setEditFolio] = useState(null)

  function load() {
    setLoading(true)
    setError('')
    const params = tab !== 'all' ? `?status=${tab}` : ''
    api.get(`/folios${params}`)
      .then(r => setFolios(r.data))
      .catch(() => setError('Could not load folios — backend may be offline.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab])

  useEffect(() => { setPage(1) }, [search, tab])

  const filtered = folios.filter(f => {
    if (!search) return true
    const q = search.toLowerCase()
    return f.reservation?.guestName?.toLowerCase().includes(q)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Stats
  const openCount = folios.filter(f => f.status === 'open').length
  const paidToday = folios.filter(f => f.status === 'paid').length
  const totalRevenue = folios.reduce((s, f) => s + Number(f.totalAmount || 0), 0)

  return (
    <div>
      <div className="mb-5 stagger-1">
        <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Folios</h1>
        <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Guest invoices and billing records.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 stagger-2">
        {[
          { label: 'Open Folios', value: openCount, icon: Clock, color: '#16a34a' },
          { label: 'Paid', value: paidToday, icon: CheckCircle2, color: '#2563eb' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: '#c8a96e' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-4" style={{ borderColor: '#dde7c8' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f5f7ee' }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{s.value}</p>
              <p className="text-xs" style={{ color: '#5a6b5c' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden stagger-3" style={{ borderColor: '#dde7c8' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: '#dde7c8' }}>
          {/* Status tabs */}
          <div className="flex gap-1">
            {STATUS_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                style={{
                  background: tab === t ? '#1b3520' : '#f5f7ee',
                  color: tab === t ? 'white' : '#5a6b5c',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9db87a' }} />
            <input
              placeholder="Search guest name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm outline-none"
              style={{ borderColor: '#dde7c8' }}
            />
          </div>
        </div>

        {error ? (
          <div className="px-5 py-10 text-center">
            <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: '#9db87a' }} />
            <p className="text-sm" style={{ color: '#5a6b5c' }}>{error}</p>
          </div>
        ) : loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1b3520', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: '#dde7c8', color: '#5a6b5c', background: '#f5f7ee' }}>
                    <th className="text-left px-5 py-3">Guest</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Room(s)</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Check-in</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Check-out</th>
                    <th className="text-left px-4 py-3">Currency</th>
                    <th className="text-right px-4 py-3">Total</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-right px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(f => {
                    const rooms = f.reservation?.reservationRooms?.map(rr => `Room ${rr.room?.number}`).join(', ') || '—'
                    return (
                      <tr key={f.id} className="border-b hover:bg-sage-50 transition-colors cursor-pointer" style={{ borderColor: '#f0f4e8' }}
                        onClick={() => navigate(`/folios/${f.id}`)}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#1b3520' }}>
                              {f.reservation?.guestName?.[0] || '?'}
                            </div>
                            <span className="text-sm font-medium" style={{ color: '#1c2b1e' }}>{f.reservation?.guestName || `Folio #${f.id}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: '#5a6b5c' }}>{rooms}</td>
                        <td className="px-4 py-3 text-sm hidden lg:table-cell" style={{ color: '#5a6b5c' }}>
                          {f.reservation?.checkinDate ? new Date(f.reservation.checkinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm hidden lg:table-cell" style={{ color: '#5a6b5c' }}>
                          {f.reservation?.checkoutDate ? new Date(f.reservation.checkoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#5a6b5c' }}>{f.currency}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-right" style={{ color: '#1c2b1e' }}>
                          {Number(f.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={f.status} /></td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canWrite && (
                              <button
                                onClick={e => { e.stopPropagation(); setEditFolio(f) }}
                                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
                                style={{ borderColor: '#c8a96e', color: '#8a6d3b' }}
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/folios/${f.id}`) }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
                              style={{ borderColor: '#1b3520', color: '#1b3520' }}
                            >
                              View →
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: '#9db87a' }} />
                        <p className="text-sm" style={{ color: '#5a6b5c' }}>No folios found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: '#dde7c8' }}>
                <p className="text-xs" style={{ color: '#5a6b5c' }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>← Prev</button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editFolio && (
        <FolioQuickActions folio={editFolio} onClose={() => setEditFolio(null)} onChanged={load} />
      )}
    </div>
  )
}
