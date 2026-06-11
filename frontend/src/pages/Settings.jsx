import { useState, useEffect } from 'react'
import { User, Lock, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../components/Toast'
import api from '../lib/api'

const ROLE_COLORS = {
  admin:        { bg: '#fef3c7', color: '#92400e', label: 'Administrator' },
  frontdesk:    { bg: '#dbeafe', color: '#1e40af', label: 'Front Desk' },
  pos:          { bg: '#fce7f3', color: '#9d174d', label: 'Restaurant POS' },
  guide:        { bg: '#d1fae5', color: '#065f46', label: 'Activity Guide' },
  housekeeping: { bg: '#e0e7ff', color: '#3730a3', label: 'Housekeeping' },
  viewer:       { bg: '#f3f4f6', color: '#6b7280', label: 'Viewer' },
}

const AVATAR_COLORS = {
  admin: '#c8a96e', frontdesk: '#1b3520', pos: '#9d174d',
  guide: '#065f46', housekeeping: '#3730a3', viewer: '#6b7280',
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
]

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/users/me').then(r => {
      setProfile({ name: r.data.name, email: r.data.email })
    }).catch(() => {})
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    if (!profile.name) return toast('Name is required.', 'error')
    setSaving(true)
    try {
      const { data } = await api.put('/users/me', profile)
      updateUser(data)
      toast('Profile updated successfully.')
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    if (!security.currentPassword || !security.newPassword) return toast('All password fields are required.', 'error')
    if (security.newPassword.length < 8) return toast('New password must be at least 8 characters.', 'error')
    if (security.newPassword !== security.confirmPassword) return toast('Passwords do not match.', 'error')
    setSaving(true)
    try {
      await api.put('/users/me/password', {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      })
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast('Password updated successfully.')
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update password.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const roleInfo = ROLE_COLORS[user?.role] || ROLE_COLORS.viewer
  const avatarColor = AVATAR_COLORS[user?.role] || '#1b3520'
  const initials = profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="max-w-2xl">
      <div className="mb-6 stagger-1">
        <h1 className="font-display text-4xl font-bold" style={{ color: '#1c2b1e' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>Manage your profile and account security.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 stagger-2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? '#1b3520' : '#f5f7ee',
              color: tab === t.id ? 'white' : '#5a6b5c',
            }}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 stagger-3" style={{ borderColor: '#dde7c8' }}>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-2xl font-bold text-white shrink-0"
              style={{ background: avatarColor }}
            >
              {initials}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold" style={{ color: '#1c2b1e' }}>{profile.name || 'Your Name'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: roleInfo.bg, color: roleInfo.color }}>
                  <Shield className="w-3 h-3" />
                  {roleInfo.label}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Full Name</label>
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-forest-900 transition-all"
                style={{ borderColor: '#dde7c8' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                style={{ borderColor: '#dde7c8' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>Role</label>
              <input
                value={roleInfo.label}
                readOnly
                className="w-full border rounded-xl px-4 py-2.5 text-sm"
                style={{ borderColor: '#dde7c8', background: '#f5f7ee', color: '#5a6b5c' }}
              />
              <p className="text-xs mt-1" style={{ color: '#9db87a' }}>Role is managed by administrators.</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ background: '#1b3520' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 stagger-3" style={{ borderColor: '#dde7c8' }}>
          <h2 className="font-display text-lg font-semibold mb-1" style={{ color: '#1c2b1e' }}>Change Password</h2>
          <p className="text-sm mb-5" style={{ color: '#5a6b5c' }}>Use a strong password of at least 8 characters.</p>

          <form onSubmit={savePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
              { key: 'newPassword', label: 'New Password', placeholder: '8+ characters' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Must match above' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5a6b5c' }}>{field.label}</label>
                <input
                  type="password"
                  placeholder={field.placeholder}
                  value={security[field.key]}
                  onChange={e => setSecurity(s => ({ ...s, [field.key]: e.target.value }))}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{ borderColor: '#dde7c8' }}
                />
                {field.key === 'newPassword' && security.newPassword && security.newPassword.length < 8 && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>Must be at least 8 characters</p>
                )}
                {field.key === 'confirmPassword' && security.confirmPassword && security.confirmPassword !== security.newPassword && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>Passwords do not match</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ background: '#1b3520' }}
            >
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
