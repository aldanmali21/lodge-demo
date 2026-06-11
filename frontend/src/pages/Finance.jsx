import { useEffect, useMemo, useState } from 'react'
import { Banknote, CalendarDays, ChevronDown, Download, Filter, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../components/Toast'

const DATE_PRESETS = ['today', 'week', 'month', 'custom']
const ENTRY_TYPES = ['all', 'income', 'expense']
const DEFAULT_CATEGORIES = ['Accommodation', 'Restaurant', 'Activities', 'POS', 'Supplies', 'Utilities', 'Payroll', 'Maintenance', 'Transport', 'Other']

function iso(date) {
  return date.toISOString().slice(0, 10)
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

function monthRange() {
  const today = new Date()
  return { from: iso(new Date(today.getFullYear(), today.getMonth(), 1)), to: iso(today) }
}

function presetRange(preset) {
  const today = new Date()
  if (preset === 'today') return { from: iso(startOfDay(today)), to: iso(endOfDay(today)) }
  if (preset === 'week') {
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    return { from: iso(startOfDay(start)), to: iso(endOfDay(today)) }
  }
  if (preset === 'month') return monthRange()
  return monthRange()
}

function money(value) {
  return '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function AddEntryModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    entryType: 'expense',
    category: DEFAULT_CATEGORIES[0],
    description: '',
    amount: '',
    currency: 'USD',
    entryDate: iso(new Date()),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!form.description || !form.amount) {
      setError('Description and amount are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post('/finance/entries', {
        ...form,
        amount: Number(form.amount),
      })
      toast('Finance entry saved.')
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save entry.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b" style={{ borderColor: '#dde7c8', background: '#1b3520' }}>
          <h2 className="font-display text-xl font-semibold text-white">Add Finance Entry</h2>
          <p className="text-xs text-white/60">Record an income or expense journal item.</p>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <div className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Type</span>
              <div className="relative">
                <select value={form.entryType} onChange={e => setForm(f => ({ ...f, entryType: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a6b5c' }} />
              </div>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Category</span>
              <div className="relative">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}>
                  {DEFAULT_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a6b5c' }} />
              </div>
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Description</span>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }} placeholder="Fuel, supplies, guest payment, etc." />
          </label>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Amount</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Currency</span>
              <div className="relative">
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm appearance-none" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }}>
                  <option value="USD">USD</option>
                  <option value="UGX">UGX</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a6b5c' }} />
              </div>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Date</span>
              <input type="date" value={form.entryDate} onChange={e => setForm(f => ({ ...f, entryDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#dde7c8', background: '#f5f7ee' }} />
            </label>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-medium" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1b3520' }}>
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Finance() {
  const { user } = useAuth()
  const canWrite = ['admin', 'frontdesk'].includes(user?.role)
  const [preset, setPreset] = useState('month')
  const [range, setRange] = useState(() => monthRange())
  const [entryType, setEntryType] = useState('all')
  const [category, setCategory] = useState('all')
  const [summary, setSummary] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  function load() {
    setLoading(true)
    const params = new URLSearchParams({ from: range.from, to: range.to })
    if (entryType !== 'all') params.set('type', entryType)
    if (category !== 'all') params.set('category', category)
    Promise.all([
      api.get(`/finance/summary?from=${range.from}&to=${range.to}`),
      api.get(`/finance/entries?${params.toString()}`),
    ]).then(([sum, list]) => {
      setSummary(sum.data)
      setEntries(list.data.rows)
    }).catch(() => {
      setSummary(null)
      setEntries([])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [range.from, range.to, entryType, category])

  function changePreset(next) {
    setPreset(next)
    if (next === 'custom') return
    setRange(presetRange(next))
  }

  const categories = useMemo(() => {
    const fromSummary = summary?.byCategory?.map(item => item.category) || []
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromSummary]))
  }, [summary])

  const income = summary?.income || 0
  const expenses = summary?.expenses || 0
  const profit = summary?.profit || 0

  function exportCsv() {
    const rows = [
      'Date,Type,Category,Description,Amount,Currency,Source',
      ...entries.map(row => `${formatDateTime(row.entryDate)},${row.entryType},"${row.category}","${row.description.replace(/"/g, '""')}",${Number(row.amount).toFixed(2)},${row.currency},"${row.source || ''}"`),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'finances.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Finances</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Track monthly income, expenses, and recognized profit.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Download className="w-4 h-4" /> Export
          </button>
          {canWrite && (
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1b3520' }}>
              <Plus className="w-4 h-4" /> Add Entry
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 stagger-2">
        <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4" style={{ color: '#16a34a' }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Monthly Income</span></div>
          <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{money(income)}</p>
        </div>
        <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4" style={{ color: '#dc2626' }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Monthly Expenses</span></div>
          <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{money(expenses)}</p>
        </div>
        <div className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4" style={{ color: '#c8a96e' }} /><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Recognized Profit</span></div>
          <p className="font-display text-2xl font-bold" style={{ color: '#1c2b1e' }}>{money(profit)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          {DATE_PRESETS.map(p => (
            <button key={p} onClick={() => changePreset(p)} className="px-4 py-2 rounded-full text-sm font-semibold border" style={{ background: preset === p ? '#1b3520' : '#f5f7ee', color: preset === p ? 'white' : '#5a6b5c', borderColor: preset === p ? '#1b3520' : '#dde7c8' }}>
              {p === 'today' ? 'Today' : p === 'week' ? 'Weekly' : p === 'month' ? 'Monthly' : 'Custom'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select value={entryType} onChange={e => setEntryType(e.target.value)} className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm bg-white" style={{ borderColor: '#dde7c8' }}>
              {ENTRY_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a6b5c' }} />
          </div>
          <div className="relative">
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm bg-white" style={{ borderColor: '#dde7c8' }}>
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a6b5c' }} />
          </div>
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

      {loading ? (
        <div className="bg-white rounded-2xl border p-8 animate-pulse" style={{ borderColor: '#dde7c8' }}>
          <div className="h-64 rounded-xl bg-sage-50" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#dde7c8' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-sage-50">
                <tr>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Date</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Type</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: '#5a6b5c' }}>Category</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden md:table-cell" style={{ color: '#5a6b5c' }}>Description</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider hidden lg:table-cell" style={{ color: '#5a6b5c' }}>Source</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-right" style={{ color: '#5a6b5c' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const isExpense = entry.entryType === 'expense'
                  return (
                    <tr key={entry.id} className="border-t" style={{ borderColor: '#eef2e4' }}>
                      <td className="px-4 py-4 text-sm" style={{ color: '#5a6b5c' }}>{formatDateTime(entry.entryDate)}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold" style={{ background: isExpense ? '#fee2e2' : '#d1fae5', color: isExpense ? '#b91c1c' : '#065f46' }}>{entry.entryType}</span>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium" style={{ color: '#1c2b1e' }}>{entry.category}</td>
                      <td className="px-4 py-4 text-sm hidden md:table-cell" style={{ color: '#5a6b5c' }}>{entry.description}</td>
                      <td className="px-4 py-4 text-sm hidden lg:table-cell" style={{ color: '#5a6b5c' }}>{entry.source || '—'}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-right" style={{ color: isExpense ? '#b91c1c' : '#1c2b1e' }}>{entry.currency} {Number(entry.amount).toFixed(2)}</td>
                    </tr>
                  )
                })}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: '#5a6b5c' }}>No finance entries found for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddEntryModal onClose={() => setShowAdd(false)} onSaved={load} />}
    </div>
  )
}
