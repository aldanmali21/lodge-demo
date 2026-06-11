import { useEffect, useState, useCallback } from 'react'
import { X, LogIn, CreditCard, Calendar, CheckSquare, Plus, Activity, AlertCircle } from 'lucide-react'
import api from '../lib/api'

const ACTION_ICONS = {
  check_in: LogIn,
  check_out: LogIn,
  record_payment: CreditCard,
  create_reservation: Calendar,
  complete_task: CheckSquare,
  book_activity: Activity,
  create_room: Plus,
  pos_charge_to_room: CreditCard,
}

const ACTION_COLORS = {
  check_in: '#16a34a',
  check_out: '#5a6b5c',
  record_payment: '#2d5a22',
  create_reservation: '#1b3520',
  complete_task: '#0284c7',
  book_activity: '#c8a96e',
  create_room: '#7c3aed',
  pos_charge_to_room: '#2d5a22',
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationsDrawer({ open, onClose, onSeen }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    if (!open) return
    setLoading(true)
    api.get('/notifications?limit=20')
      .then(r => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    // Mark as seen for this user, then clear the parent's badge count.
    api.post('/notifications/seen').then(() => onSeen?.()).catch(() => {})
  }, [open, onSeen])

  useEffect(() => { load() }, [load])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(13,26,15,0.4)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 w-full max-w-sm`}
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)', borderLeft: '1px solid #dde7c8' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: '#dde7c8', background: '#1b3520' }}>
          <h2 className="font-display text-lg font-semibold text-white">Activity Feed</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: '#eef2e4' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded-full w-3/4" style={{ background: '#eef2e4' }} />
                    <div className="h-2.5 rounded-full w-1/2" style={{ background: '#eef2e4' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 px-8 text-center">
              <AlertCircle className="w-8 h-8 mb-3" style={{ color: '#9db87a' }} />
              <p className="font-medium text-sm" style={{ color: '#1c2b1e' }}>No recent activity</p>
              <p className="text-xs mt-1" style={{ color: '#5a6b5c' }}>Events will appear here as staff use the system.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: '#f0f4e8' }}>
              {notifications.map(n => {
                const Icon = ACTION_ICONS[n.action] || Activity
                const color = ACTION_COLORS[n.action] || '#5a6b5c'
                return (
                  <div key={n.id} className="flex gap-3 px-5 py-4 hover:bg-sage-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f5f7ee' }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight" style={{ color: '#1c2b1e' }}>
                        <span style={{ color: '#1b3520', fontWeight: 600 }}>{n.actor?.name || 'System'}</span>
                        {' '}{n.actionLabel || n.action}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#5a6b5c' }}>
                        {n.objectType} #{n.objectId}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#9db87a' }}>{relativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
