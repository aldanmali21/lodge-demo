import { useState, useEffect } from 'react'
import { UserPlus, Users as UsersIcon, Activity, Download, ChevronDown, X, Check, Shield, Mail, Clock } from 'lucide-react'
import api from '../lib/api'
import { toast } from '../components/Toast'
import FilterPanel from '../components/FilterPanel'

const ROLES = ['admin', 'frontdesk', 'pos', 'guide', 'housekeeping', 'viewer']
const ROLE_META = {
  admin:        { label: 'Admin',        bg: '#fef3c7', color: '#92400e' },
  frontdesk:    { label: 'Front Desk',   bg: '#dbeafe', color: '#1e40af' },
  pos:          { label: 'POS',          bg: '#fce7f3', color: '#9d174d' },
  guide:        { label: 'Guide',        bg: '#d1fae5', color: '#065f46' },
  housekeeping: { label: 'Housekeeping', bg: '#e0e7ff', color: '#3730a3' },
  viewer:       { label: 'Viewer',       bg: '#f3f4f6', color: '#6b7280' },
}
const ROLE_ACCESS = {
  admin:        'Full access to all pages and settings',
  frontdesk:    'Dashboard, Calendar, Rooms, Folios, POS, Activities, Finance, Reports',
  pos:          'Restaurant POS only — can take orders and charge to folios',
  guide:        'Activities only — can view and advance schedule status',
  housekeeping: 'Rooms + Housekeeping — can update cleanliness status',
  viewer:       'All pages read-only — no edits, deletes or writes',
}
const ACTION_LABELS = {
  create_reservation: 'Created reservation', check_in: 'Checked in guest',
  check_out: 'Checked out guest', record_payment: 'Recorded payment',
  add_folio_item: 'Added folio charge', complete_task: 'Completed task',
  book_activity: 'Booked activity', create_room: 'Added room',
  pos_charge_to_room: 'POS charge to room', pos_cash_sale: 'Cash sale',
  invite_user: 'Invited user', update_user_role: 'Updated user role',
}

function RoleBadge({ role }) {
  const m = ROLE_META[role] || { label: role, bg: '#f3f4f6', color: '#6b7280' }
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: m.bg, color: m.color }}>{m.label}</span>
}

const CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'both', label: 'Both' },
]

function InviteModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', role: 'frontdesk', channel: 'email', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const needsPhone = form.channel === 'sms' || form.channel === 'both'

  async function send() {
    if (!form.email) return setError('Email is required.')
    if (needsPhone && !form.phone) return setError('Phone number is required for SMS invites.')
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/users/invite', form)
      setResult(data)
      setStep(2)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send invite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(13,26,15,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4" style={{ background: '#1b3520' }}>
          <h2 className="font-display text-xl font-semibold text-white">
            {step === 1 ? 'Invite Team Member' : 'Invite Sent'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {step === 1 ? (
            <>
              {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ borderColor: '#dde7c8' }}
                    onKeyDown={e => e.key === 'Enter' && send()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Assign Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => {
                      const m = ROLE_META[r]
                      return (
                        <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all"
                          style={{
                            borderColor: form.role === r ? '#1b3520' : '#dde7c8',
                            background: form.role === r ? '#f5f7ee' : 'white',
                          }}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                          <span className="text-sm font-medium" style={{ color: '#1c2b1e' }}>{m.label}</span>
                          {form.role === r && <Check className="w-3 h-3 ml-auto" style={{ color: '#1b3520' }} />}
                        </button>
                      )
                    })}
                  </div>
                  {form.role && (
                    <div className="mt-2 px-3 py-2 rounded-xl text-xs" style={{ background: '#f5f7ee', color: '#5a6b5c' }}>
                      <span className="font-semibold" style={{ color: '#1c2b1e' }}>Access: </span>
                      {ROLE_ACCESS[form.role]}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Send Via</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CHANNELS.map(c => (
                      <button key={c.id} onClick={() => setForm(f => ({ ...f, channel: c.id }))}
                        className="px-3 py-2 rounded-xl border text-sm font-medium transition-all"
                        style={{
                          borderColor: form.channel === c.id ? '#1b3520' : '#dde7c8',
                          background: form.channel === c.id ? '#f5f7ee' : 'white',
                          color: '#1c2b1e',
                        }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                {needsPhone && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+256 7XX XXX XXX"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#dde7c8' }}
                    />
                    <p className="text-xs mt-1" style={{ color: '#9db87a' }}>SMS delivery via Africa's Talking (pending integration — link is still created).</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm border rounded-xl" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Cancel</button>
                <button onClick={send} disabled={loading} className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50" style={{ background: '#1b3520' }}>
                  <Mail className="w-4 h-4" />
                  {loading ? 'Sending…' : 'Send Invite'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-1" style={{ color: '#1c2b1e' }}>Invite Created</h3>
              <p className="text-sm mb-2" style={{ color: '#5a6b5c' }}>
                {result?.message || `Invite sent to ${form.email}`}
              </p>
              <RoleBadge role={form.role} />
              {result?.inviteUrl && (
                <div className="mt-4 p-3 rounded-xl text-xs text-left break-all" style={{ background: '#f5f7ee', color: '#1b3520' }}>
                  {result.inviteUrl}
                </div>
              )}
              {result?.emailError && (
                <div className="mt-3 p-3 rounded-xl text-xs text-left" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <span className="font-semibold">Email error:</span> {result.emailError}
                </div>
              )}
              <button onClick={() => { onSuccess?.(); onClose() }} className="mt-5 px-6 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: '#1b3520' }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Users() {
  const [tab, setTab] = useState('team')
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [logTotal, setLogTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [roleFilter, setRoleFilter] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [logFilters, setLogFilters] = useState({})
  const [logOffset, setLogOffset] = useState(0)
  const LOG_LIMIT = 50

  function loadUsers() {
    setLoading(true)
    api.get('/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  function loadLogs(offset = 0) {
    const params = new URLSearchParams({ limit: LOG_LIMIT, offset })
    if (logFilters.actor) params.set('actor', logFilters.actor)
    if (logFilters.action) params.set('action', logFilters.action)
    if (logFilters.date_from) params.set('from', logFilters.date_from)
    if (logFilters.date_to) params.set('to', logFilters.date_to)
    api.get(`/users/audit-log?${params}`).then(r => { setLogs(r.data.logs); setLogTotal(r.data.total) }).catch(() => {})
  }

  useEffect(() => { loadUsers() }, [])
  useEffect(() => { if (tab === 'activity') loadLogs(0) }, [tab, logFilters])

  const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users

  function exportLogs() {
    const header = 'Timestamp,Actor,Action,Object Type,Object ID\n'
    const rows = logs.map(l => `${l.createdAt},${l.actor?.name || 'System'},${l.action},${l.objectType},${l.objectId}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'activity-log.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5 stagger-1">
        <div>
          <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Team</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Manage staff accounts and system activity.</p>
        </div>
        {tab === 'team' && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: '#1b3520' }}>
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invite User</span>
          </button>
        )}
        {tab === 'activity' && (
          <button onClick={exportLogs} className="flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all"
            style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 stagger-2">
        {[{ id: 'team', label: 'Team Members', icon: UsersIcon }, { id: 'activity', label: 'Activity Log', icon: Activity }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: tab === t.id ? '#1b3520' : '#f5f7ee', color: tab === t.id ? 'white' : '#5a6b5c' }}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Team Members */}
      {tab === 'team' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden stagger-3" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#dde7c8' }}>
            <p className="text-sm font-medium" style={{ color: '#5a6b5c' }}>{users.length} staff accounts</p>
            <div className="flex gap-2 flex-wrap">
              {['', ...ROLES].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                  style={{
                    background: roleFilter === r ? '#1b3520' : '#f5f7ee',
                    color: roleFilter === r ? 'white' : '#5a6b5c',
                    borderColor: roleFilter === r ? '#1b3520' : '#dde7c8',
                  }}>
                  {r ? ROLE_META[r]?.label : 'All'}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1b3520', borderTopColor: 'transparent' }} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: '#dde7c8', color: '#5a6b5c', background: '#f5f7ee' }}>
                    <th className="text-left px-5 py-3">Staff Member</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Joined</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b hover:bg-sage-50 transition-colors" style={{ borderColor: '#f0f4e8' }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: ROLE_META[u.role]?.color || '#1b3520' }}>
                            {u.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: '#1c2b1e' }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: '#5a6b5c' }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: '#5a6b5c' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs" style={{ color: '#9db87a' }}>Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Activity Log */}
      {tab === 'activity' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden stagger-3" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#dde7c8' }}>
            <p className="text-sm font-medium" style={{ color: '#5a6b5c' }}>{logTotal.toLocaleString()} total events</p>
            <div className="relative">
              <button onClick={() => setShowFilter(s => !s)} className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm"
                style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>
                <Activity className="w-4 h-4" /> Filter
                <ChevronDown className="w-3 h-3" />
              </button>
              {showFilter && (
                <FilterPanel
                  filters={[
                    { key: 'date', label: 'Date Range', type: 'date-range' },
                    { key: 'action', label: 'Action Type', type: 'chips', options: Object.entries(ACTION_LABELS).map(([v, l]) => ({ value: v, label: l })) },
                  ]}
                  values={logFilters}
                  onChange={(k, v) => setLogFilters(f => ({ ...f, [k]: v }))}
                  onClose={() => setShowFilter(false)}
                  onReset={() => setLogFilters({})}
                />
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider" style={{ borderColor: '#dde7c8', color: '#5a6b5c', background: '#f5f7ee' }}>
                  <th className="text-left px-5 py-3">Timestamp</th>
                  <th className="text-left px-4 py-3">Actor</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Object</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} className="border-b hover:bg-sage-50 transition-colors" style={{ borderColor: '#f0f4e8' }}>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: '#5a6b5c' }}>
                      {new Date(l.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#1c2b1e' }}>
                      {l.actor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: ROLE_META[l.actor.role]?.color || '#1b3520' }}>
                            {l.actor.name?.[0]}
                          </div>
                          {l.actor.name}
                        </div>
                      ) : 'System'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#1c2b1e' }}>
                      {ACTION_LABELS[l.action] || l.action}
                    </td>
                    <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: '#5a6b5c' }}>
                      {l.objectType} #{l.objectId}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: '#5a6b5c' }}>No activity yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {logTotal > LOG_LIMIT && (
            <div className="flex justify-between items-center px-5 py-3 border-t" style={{ borderColor: '#dde7c8' }}>
              <p className="text-xs" style={{ color: '#5a6b5c' }}>Showing {Math.min(logs.length, LOG_LIMIT)} of {logTotal}</p>
              <div className="flex gap-1">
                <button disabled={logOffset === 0} onClick={() => { const o = Math.max(0, logOffset - LOG_LIMIT); setLogOffset(o); loadLogs(o) }}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>← Prev</button>
                <button disabled={logOffset + LOG_LIMIT >= logTotal} onClick={() => { const o = logOffset + LOG_LIMIT; setLogOffset(o); loadLogs(o) }}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40" style={{ borderColor: '#dde7c8', color: '#5a6b5c' }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSuccess={loadUsers} />}
    </div>
  )
}
