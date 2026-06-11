import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Banknote, BedDouble, CalendarDays, Compass, Download, FileWarning, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react'
import api from '../lib/api'

function iso(value) {
  return value.toISOString().split('T')[0]
}

function money(value) {
  return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function downloadCsv(filename, rows) {
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function Panel({ icon: Icon, title, subtitle, onExport, children }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#dde7c8' }}>
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: '#dde7c8' }}>
        <div>
          <h2 className="flex items-center gap-2 font-semibold" style={{ color: '#1c2b1e' }}>
            <Icon className="w-4 h-4" style={{ color: '#c8a96e' }} /> {title}
          </h2>
          {subtitle && <p className="text-xs mt-1" style={{ color: '#5a6b5c' }}>{subtitle}</p>}
        </div>
        {onExport && (
          <button onClick={onExport} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Download className="w-3 h-3" /> CSV
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Metric({ label, value, sub, iconColor }) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#f5f7ee' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: iconColor || '#9db87a' }}>{label}</p>
      <p className="font-display text-xl font-bold" style={{ color: '#1c2b1e' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: '#5a6b5c' }}>{sub}</p>}
    </div>
  )
}

function useChartBox(points, width = 600, height = 220, padding = 20) {
  const values = points.map(p => Number(p.value || 0))
  const max = Math.max(1, ...values)
  const min = Math.min(0, ...values)
  const range = max - min || 1
  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0
  const coords = points.map((point, index) => {
    const x = padding + step * index
    const y = height - padding - ((Number(point.value || 0) - min) / range) * (height - padding * 2)
    return { ...point, x, y }
  })
  return { coords, width, height, padding, max, min }
}

function LineChart({ points }) {
  const chart = useChartBox(points)
  const path = chart.coords.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  if (!points.length) {
    return <div className="h-56 flex items-center justify-center text-sm" style={{ color: '#5a6b5c' }}>No revenue in range.</div>
  }

  return (
    <div>
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="w-full h-56 overflow-visible">
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b3520" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1b3520" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={20} y1={chart.height - 20} x2={chart.width - 20} y2={chart.height - 20} stroke="#dde7c8" />
        <path d={`${path} L ${chart.width - 20} ${chart.height - 20} L 20 ${chart.height - 20} Z`} fill="url(#revenueFill)" />
        <path d={path} fill="none" stroke="#1b3520" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {chart.coords.map(point => (
          <g key={point.day}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#c8a96e" stroke="#fff" strokeWidth="2" />
            <text x={point.x} y={chart.height - 6} textAnchor="middle" fontSize="10" fill="#5a6b5c">{point.day.slice(5)}</text>
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-between text-xs mt-2" style={{ color: '#5a6b5c' }}>
        <span>{money(points[0]?.value)}</span>
        <span>{money(points[points.length - 1]?.value)}</span>
      </div>
    </div>
  )
}

function DonutChart({ percent }) {
  const r = 42
  const c = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, Number(percent || 0))) / 100) * c
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2e4" strokeWidth="12" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1b3520" strokeWidth="12" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" />
    </svg>
  )
}

function BarChart({ items, color = '#1b3520', emptyText = 'No data in range.' }) {
  const max = Math.max(1, ...items.map(i => Number(i.value || 0)))
  if (!items.length) return <div className="h-40 flex items-center justify-center text-sm" style={{ color: '#5a6b5c' }}>{emptyText}</div>
  return (
    <div className="space-y-3">
      {items.map(item => {
        const width = `${Math.max(4, (Number(item.value || 0) / max) * 100)}%`
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span style={{ color: '#1c2b1e' }}>{item.label}</span>
              <span style={{ color: '#5a6b5c' }}>{item.valueText || item.value}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#eef2e4' }}>
              <div className="h-3 rounded-full" style={{ width, background: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'revenue',      label: 'Revenue' },
  { id: 'occupancy',    label: 'Occupancy' },
  { id: 'guests',       label: 'Guests' },
  { id: 'activities',   label: 'Activities' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'finance',      label: 'Finance' },
]

export default function Reports() {
  const today = new Date()
  const monthAgo = new Date(Date.now() - 30 * 86400000)
  const [range, setRange] = useState({ from: iso(monthAgo), to: iso(today) })
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState(null)
  const [finData, setFinData] = useState(null)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    Promise.all([
      api.get(`/reports/summary?from=${range.from}&to=${range.to}`),
      api.get(`/finance/summary?from=${range.from}&to=${range.to}`),
    ])
      .then(([r, f]) => { setData(r.data); setFinData(f.data) })
      .catch(() => { setData(null); setFinData(null) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [range.from, range.to])

  const revenueSeries = useMemo(() => data?.revenue?.byDay || [], [data])
  const activitySeries = useMemo(() => (data?.activities?.perActivity || []).map(item => ({ label: item.name, value: item.revenue, valueText: money(item.revenue) })), [data])
  const guestSeries = useMemo(() => (data?.guests?.byStatus || []).map(item => ({ label: item.status.replace('_', ' '), value: item.count })), [data])
  const housekeepingSeries = useMemo(() => (data?.housekeeping?.byStatus || []).map(item => ({ label: item.status.replace('_', ' '), value: item.count })), [data])
  const occupancy = data?.occupancy || {}

  const income = finData?.income || 0
  const expenses = finData?.expenses || 0
  const profit = finData?.profit || 0

  const DateFilters = (
    <div className="flex items-end gap-2">
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#9db87a' }}>From</label>
        <input type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} className="border rounded-xl px-3 py-2 text-sm outline-none bg-white" style={{ borderColor: '#dde7c8' }} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#9db87a' }}>To</label>
        <input type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} className="border rounded-xl px-3 py-2 text-sm outline-none bg-white" style={{ borderColor: '#dde7c8' }} />
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Analytics across revenue, occupancy, guests, activities, housekeeping and finances.</p>
        </div>
        {DateFilters}
      </div>

      {/* Pill tabs */}
      <div className="flex gap-2 flex-wrap mb-5 stagger-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
            style={{
              background: activeTab === tab.id ? '#1b3520' : '#f5f7ee',
              color: activeTab === tab.id ? 'white' : '#5a6b5c',
              borderColor: activeTab === tab.id ? '#1b3520' : '#dde7c8',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : !data ? (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#dde7c8' }}>
          <p className="text-sm" style={{ color: '#5a6b5c' }}>Could not load reports — backend may be offline.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-3">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric label="Revenue" value={money(data.revenue.total)} sub={`${data.revenue.transactions} payments`} />
                <Metric label="Occupancy" value={`${occupancy.percent || 0}%`} sub={`${occupancy.roomNightsSold || 0} room nights`} />
                <Metric label="Guests" value={(data.guests?.byStatus || []).reduce((sum, item) => sum + item.count, 0)} sub="bookings in range" />
                <Metric label="Activities" value={data.activities?.perActivity?.reduce((sum, item) => sum + item.bookings, 0) || 0} sub="bookings in range" />
              </div>
              <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-4">
                <Panel icon={TrendingUp} title="Revenue Trend" subtitle="Daily collections over the selected range." onExport={() => downloadCsv('revenue.csv', ['Day,Amount', ...revenueSeries.map(d => `${d.day},${Number(d.amount).toFixed(2)}`)])}>
                  <LineChart points={revenueSeries.map(d => ({ day: d.day, value: d.amount }))} />
                </Panel>
                <Panel icon={BedDouble} title="Occupancy" subtitle="Room nights sold vs. available capacity.">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <DonutChart percent={occupancy.percent || 0} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{occupancy.percent || 0}%</span>
                        <span className="text-xs" style={{ color: '#5a6b5c' }}>occupied</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-semibold" style={{ color: '#1c2b1e' }}>ADR:</span> <span style={{ color: '#5a6b5c' }}>{money(occupancy.adr)}</span></div>
                      <div><span className="font-semibold" style={{ color: '#1c2b1e' }}>RevPAR:</span> <span style={{ color: '#5a6b5c' }}>{money(occupancy.revpar)}</span></div>
                    </div>
                  </div>
                </Panel>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Metric label="Monthly Income" value={money(income)} iconColor="#16a34a" />
                <Metric label="Monthly Expenses" value={money(expenses)} iconColor="#dc2626" />
                <Metric label="Recognised Profit" value={money(profit)} iconColor="#c8a96e" />
              </div>
            </>
          )}

          {/* REVENUE */}
          {activeTab === 'revenue' && (
            <>
              <Panel icon={TrendingUp} title="Revenue Trend" subtitle="Daily collections." onExport={() => downloadCsv('revenue.csv', ['Day,Amount', ...revenueSeries.map(d => `${d.day},${Number(d.amount).toFixed(2)}`)])}>
                <LineChart points={revenueSeries.map(d => ({ day: d.day, value: d.amount }))} />
              </Panel>
              <div className="grid lg:grid-cols-2 gap-4">
                <Panel icon={Banknote} title="Outstanding Folios" subtitle="Open balances needing settlement." onExport={() => downloadCsv('outstanding.csv', ['Guest,Currency,Balance', ...(data.outstanding || []).map(o => `"${o.guestName}",${o.currency},${Number(o.balance).toFixed(2)}`)])}>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(data.outstanding || []).length === 0 ? (
                      <p className="text-sm" style={{ color: '#5a6b5c' }}>No outstanding balances.</p>
                    ) : data.outstanding.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span style={{ color: '#1c2b1e' }}>{item.guestName}</span>
                        <span className="font-semibold" style={{ color: '#b45309' }}>{item.currency} {Number(item.balance).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel icon={CalendarDays} title="Reconciliation History" subtitle="Recent shift closes and cash variance." onExport={() => downloadCsv('reconciliation.csv', ['Date,Closer,Expected Cash,Actual Cash,Variance', ...(data.reconciliations || []).map(r => `${iso(new Date(r.date))},${r.closer?.name || ''},${Number(r.expectedCash).toFixed(2)},${Number(r.actualCash).toFixed(2)},${(Number(r.actualCash) - Number(r.expectedCash)).toFixed(2)}`)])}>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(data.reconciliations || []).length === 0 ? (
                      <p className="text-sm" style={{ color: '#5a6b5c' }}>No shift closes in range.</p>
                    ) : data.reconciliations.map(item => {
                      const variance = Number(item.actualCash) - Number(item.expectedCash)
                      return (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span style={{ color: '#1c2b1e' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {item.closer?.name}</span>
                          <span className="font-semibold" style={{ color: Math.abs(variance) < 0.01 ? '#16a34a' : '#dc2626' }}>{variance >= 0 ? '+' : ''}{variance.toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              </div>
            </>
          )}

          {/* OCCUPANCY */}
          {activeTab === 'occupancy' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric label="Occupancy" value={`${occupancy.percent || 0}%`} />
                <Metric label="Room Nights Sold" value={occupancy.roomNightsSold || 0} />
                <Metric label="ADR" value={money(occupancy.adr)} sub="Avg. Daily Rate" />
                <Metric label="RevPAR" value={money(occupancy.revpar)} sub="Rev per Available Room" />
              </div>
              <Panel icon={BedDouble} title="Occupancy Rate" subtitle="Room nights sold versus available capacity." onExport={() => downloadCsv('occupancy.csv', ['Metric,Value', `Percent,${occupancy.percent || 0}`, `Room nights sold,${occupancy.roomNightsSold || 0}`, `Available room nights,${occupancy.availableRoomNights || 0}`])}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative shrink-0">
                    <DonutChart percent={occupancy.percent || 0} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{occupancy.percent || 0}%</span>
                      <span className="text-xs" style={{ color: '#5a6b5c' }}>occupied</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm w-full max-w-xs">
                    {[
                      { label: 'Room nights sold', value: occupancy.roomNightsSold || 0 },
                      { label: 'Available room nights', value: occupancy.availableRoomNights || 0 },
                      { label: 'Room revenue', value: money(occupancy.roomRevenue) },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between border-b pb-2" style={{ borderColor: '#eef2e4' }}>
                        <span style={{ color: '#5a6b5c' }}>{row.label}</span>
                        <span className="font-semibold" style={{ color: '#1c2b1e' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </>
          )}

          {/* GUESTS */}
          {activeTab === 'guests' && (
            <Panel icon={Users} title="Guests by Reservation Status" subtitle="Reservation statuses in the selected range." onExport={() => downloadCsv('guests.csv', ['Status,Count', ...(data.guests?.byStatus || []).map(s => `${s.status},${s.count}`)])}>
              <div className="mb-4">
                <Metric label="Total Bookings" value={(data.guests?.byStatus || []).reduce((sum, item) => sum + item.count, 0)} sub="in selected range" />
              </div>
              <BarChart items={guestSeries} color="#1b3520" emptyText="No guests in range." />
            </Panel>
          )}

          {/* ACTIVITIES */}
          {activeTab === 'activities' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Total Bookings" value={data.activities?.perActivity?.reduce((sum, item) => sum + item.bookings, 0) || 0} />
                <Metric label="Activity Revenue" value={money(data.activities?.perActivity?.reduce((sum, item) => sum + Number(item.revenue || 0), 0) || 0)} />
              </div>
              <Panel icon={Compass} title="Revenue by Activity" subtitle="Breakdown across activity types in the selected range." onExport={() => downloadCsv('activities.csv', ['Activity,Bookings,Pax,Revenue', ...(data.activities?.perActivity || []).map(a => `${a.name},${a.bookings},${a.pax},${Number(a.revenue).toFixed(2)}`)])}>
                <BarChart items={activitySeries} color="#2d5a22" emptyText="No activity revenue in range." />
              </Panel>
            </>
          )}

          {/* HOUSEKEEPING */}
          {activeTab === 'housekeeping' && (
            <Panel icon={FileWarning} title="Housekeeping Status" subtitle="Current housekeeping task status counts." onExport={() => downloadCsv('housekeeping.csv', ['Status,Count', ...(data.housekeeping?.byStatus || []).map(s => `${s.status},${s.count}`)])}>
              <BarChart items={housekeepingSeries} color="#d97706" emptyText="No housekeeping records in range." />
            </Panel>
          )}

          {/* FINANCE */}
          {activeTab === 'finance' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#dde7c8' }}>
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4" style={{ color: '#16a34a' }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Income</span></div>
                  <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{money(income)}</p>
                </div>
                <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#dde7c8' }}>
                  <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4" style={{ color: '#dc2626' }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Expenses</span></div>
                  <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{money(expenses)}</p>
                </div>
                <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#dde7c8' }}>
                  <div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4" style={{ color: '#c8a96e' }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Recognised Profit</span></div>
                  <p className="font-display text-2xl font-bold" style={{ color: profit >= 0 ? '#1c2b1e' : '#dc2626' }}>{money(profit)}</p>
                </div>
              </div>
              <Panel icon={Banknote} title="Finance by Category" subtitle="Total amount per category in the selected date range.">
                {finData?.byCategory?.length ? (
                  <BarChart
                    items={finData.byCategory.map(c => ({ label: c.category, value: c.amount, valueText: money(c.amount) }))}
                    color="#1b3520"
                    emptyText="No finance data in range."
                  />
                ) : (
                  <p className="text-sm" style={{ color: '#5a6b5c' }}>No categorised finance data in range.</p>
                )}
              </Panel>
            </>
          )}

        </div>
      )}
    </div>
  )
}
