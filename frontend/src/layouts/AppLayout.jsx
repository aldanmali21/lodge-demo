import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, FileText, Compass,
  UtensilsCrossed, Bed, Building2, Settings,
  Bell, Plus, Mountain, RotateCcw, Users,
  AlignLeft, X, DoorOpen, BarChart3, Globe
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NewBookingModal from '../components/NewBookingModal'
import NotificationsDrawer from '../components/NotificationsDrawer'
import OfflineBanner from '../components/OfflineBanner'
import api from '../lib/api'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard, roles: ['admin','frontdesk','viewer'] },
  { to: '/guests',       label: 'Guests',        icon: Users,           roles: ['admin','frontdesk','viewer'] },
  { to: '/calendar',     label: 'Calendar',      icon: Calendar,        roles: ['admin','frontdesk','viewer'] },
  { to: '/rooms',        label: 'Rooms',         icon: DoorOpen,        roles: ['admin','frontdesk','housekeeping','viewer'] },
  { to: '/folios',       label: 'Folios',        icon: FileText,        roles: ['admin','frontdesk','viewer'] },
  { to: '/activities',   label: 'Activities',    icon: Compass,         roles: ['admin','frontdesk','guide','viewer'] },
  { to: '/pos',          label: 'Restaurant POS',icon: UtensilsCrossed, roles: ['admin','frontdesk','pos','viewer'] },
  { to: '/housekeeping', label: 'Housekeeping',  icon: Bed,             roles: ['admin','housekeeping','viewer'] },
  { to: '/finance',      label: 'Finances',      icon: Building2,       roles: ['admin','frontdesk','viewer'] },
  { to: '/reports',      label: 'Reports',       icon: BarChart3,       roles: ['admin','frontdesk','viewer'] },
  { to: '/users',        label: 'Team',          icon: Users,           roles: ['admin'] },
]

function NavItem({ to, label, icon: Icon, user, roles, onClick }) {
  if (roles && !roles.includes(user?.role)) return null
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
          isActive
            ? 'bg-forest-800/60 text-white font-semibold italic'
            : 'text-white/50 hover:text-white/90 hover:bg-white/5'
        }`
      }
      style={({ isActive }) => isActive ? { background: 'rgba(255,255,255,0.12)' } : {}}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function AppLayout() {
  const { user, resetData } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showBooking, setShowBooking] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  // Fetch notification count
  const loadNotifCount = useCallback(() => {
    api.get('/notifications/count').then(r => setNotifCount(r.data.count)).catch(() => {})
  }, [])

  useEffect(() => {
    loadNotifCount()
    const interval = setInterval(loadNotifCount, 60000)
    return () => clearInterval(interval)
  }, [loadNotifCount])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#eef2e4' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(13,26,15,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-full z-40 w-64 shrink-0 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#1b3520' }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Mountain className="w-5 h-5" style={{ color: '#c8a96e' }} />
            <Mountain className="w-3.5 h-3.5 -ml-1" style={{ color: '#c8a96e' }} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white leading-tight">Lodge Demo</h1>
          <p className="text-xs tracking-wider uppercase" style={{ color: '#9db87a' }}>Management Demo</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavItem key={item.to} {...item} user={user} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 border-t border-white/10 pt-3 space-y-0.5">
          <button
            onClick={() => { navigate('/site'); setSidebarOpen(false) }}
            title="Open the guest-facing website for this lodge"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/90 hover:bg-white/5 transition-all w-full"
          >
            <Globe className="w-4 h-4" />
            <span>Guest Website</span>
          </button>
          <button
            onClick={() => { navigate('/settings'); setSidebarOpen(false) }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/90 hover:bg-white/5 transition-all w-full"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={resetData}
            title="Restore the original demo records"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-300 hover:bg-white/5 transition-all w-full mt-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b shrink-0" style={{ borderColor: '#dde7c8' }}>
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-sage-100 transition-colors"
              onClick={() => setSidebarOpen(s => !s)}
              aria-label="Toggle menu"
            >
              <span
                className="block w-5 h-0.5 transition-all duration-200 origin-center"
                style={{
                  background: '#1b3520',
                  transform: sidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                }}
              />
              <span
                className="block w-5 h-0.5 transition-all duration-200"
                style={{
                  background: '#1b3520',
                  opacity: sidebarOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-5 h-0.5 transition-all duration-200 origin-center"
                style={{
                  background: '#1b3520',
                  transform: sidebarOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                }}
              />
            </button>

            <span className="hidden sm:block text-sm font-medium" style={{ color: '#1c2b1e' }}>Lodge Demo</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            {/* New Booking */}
            {['admin', 'frontdesk'].includes(user?.role) && (
              <button
                onClick={() => setShowBooking(true)}
                className="flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: '#1b3520' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2d5a22'}
                onMouseLeave={e => e.currentTarget.style.background = '#1b3520'}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Booking</span>
              </button>
            )}

            {/* Notification bell */}
            <button
              onClick={() => setShowNotif(true)}
              className="p-2 rounded-lg hover:bg-sage-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" style={{ color: '#5a6b5c' }} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#dc2626', fontSize: '10px', fontWeight: 700, lineHeight: 1, padding: '0 3px' }}>
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer shrink-0"
              style={{ background: '#1b3520' }}
              title={user?.name}
              onClick={() => navigate('/settings')}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Offline banner */}
        <OfflineBanner />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {showBooking && <NewBookingModal onClose={() => setShowBooking(false)} />}
      <NotificationsDrawer open={showNotif} onClose={() => setShowNotif(false)} onSeen={() => setNotifCount(0)} />
    </div>
  )
}
