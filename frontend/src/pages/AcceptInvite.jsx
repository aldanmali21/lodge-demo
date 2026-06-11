import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mountain, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const ROLE_META = {
  admin:        { label: 'Administrator', color: '#c8a96e' },
  frontdesk:    { label: 'Front Desk',    color: '#1b3520' },
  pos:          { label: 'Restaurant POS',color: '#9d174d' },
  guide:        { label: 'Activity Guide',color: '#065f46' },
  housekeeping: { label: 'Housekeeping',  color: '#3730a3' },
  viewer:       { label: 'Viewer',        color: '#6b7280' },
}

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const token = params.get('token')

  const [invite, setInvite] = useState(null)
  const [status, setStatus] = useState('loading') // loading | valid | invalid | done
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('invalid'); return }
    api.get(`/auth/verify-invite?token=${token}`)
      .then(r => { setInvite(r.data); setStatus('valid') })
      .catch(e => {
        setError(e.response?.data?.error || 'Invalid invite link.')
        setStatus('invalid')
      })
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName) return setError('First name and last name are required.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/accept-invite', {
        token,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
      })
      localStorage.setItem('tl_token', data.token)
      localStorage.setItem('tl_user', JSON.stringify(data.user))
      setStatus('done')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create account.')
    } finally {
      setSubmitting(false)
    }
  }

  const avatarColor = invite ? (ROLE_META[invite.role]?.color || '#1b3520') : '#1b3520'
  const roleLabel = invite ? (ROLE_META[invite.role]?.label || invite.role) : ''

  return (
    <div className="min-h-screen grid lg:grid-cols-[3fr_2fr]">
      {/* Left panel */}
      <div
        className="relative hidden lg:flex flex-col justify-end p-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(13,26,15,0.2) 0%, rgba(13,26,15,0.75) 100%), url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1400&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mountain className="w-7 h-7" style={{ color: '#c8a96e' }} />
            <Mountain className="w-5 h-5 -ml-1" style={{ color: '#c8a96e' }} />
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">Twin Lakes</h1>
          <p className="font-display text-xl text-white/70 italic mt-1">Safari Lodge Management</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-cream px-8 py-12 min-h-screen">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Mountain className="w-6 h-6" style={{ color: '#1b3520' }} />
            <span className="font-display text-2xl font-bold" style={{ color: '#1b3520' }}>Twin Lakes</span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: '#dde7c8' }}>
            {status === 'loading' && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1b3520', borderTopColor: 'transparent' }} />
              </div>
            )}

            {status === 'invalid' && (
              <div className="text-center py-4">
                <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: '#1c2b1e' }}>Invalid Invite</h2>
                <p className="text-sm" style={{ color: '#5a6b5c' }}>{error}</p>
                <button onClick={() => navigate('/login')} className="mt-5 text-sm underline" style={{ color: '#1b3520' }}>
                  Back to login
                </button>
              </div>
            )}

            {status === 'done' && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: '#1c2b1e' }}>Welcome aboard!</h2>
                <p className="text-sm" style={{ color: '#5a6b5c' }}>Taking you to the dashboard…</p>
              </div>
            )}

            {status === 'valid' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-display text-2xl font-bold text-white mb-3" style={{ background: avatarColor }}>
                    {(form.firstName[0] || '?').toUpperCase()}
                  </div>
                  <h2 className="font-display text-2xl font-semibold" style={{ color: '#1c2b1e' }}>Set up your account</h2>
                  <p className="text-sm mt-1" style={{ color: '#5a6b5c' }}>
                    You've been invited as{' '}
                    <span className="font-semibold px-2 py-0.5 rounded-full text-xs" style={{ background: '#eef2e4', color: '#1b3520' }}>
                      {roleLabel}
                    </span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#9db87a' }}>{invite?.email}</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[{ key: 'firstName', label: 'First Name' }, { key: 'lastName', label: 'Last Name' }].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#1b3520' }}>{f.label}</label>
                        <input
                          placeholder={f.label}
                          value={form[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full border-b-2 bg-transparent py-2 text-sm outline-none"
                          style={{ borderColor: '#dde7c8' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#1b3520' }}>Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8+ characters"
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        className="w-full border-b-2 bg-transparent py-2 pr-8 text-sm outline-none"
                        style={{ borderColor: '#dde7c8' }}
                      />
                      <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1" tabIndex={-1}>
                        {showPassword ? <EyeOff className="w-4 h-4" style={{ color: '#9db87a' }} /> : <Eye className="w-4 h-4" style={{ color: '#9db87a' }} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#1b3520' }}>Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Must match"
                        value={form.confirmPassword}
                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full border-b-2 bg-transparent py-2 pr-8 text-sm outline-none"
                        style={{ borderColor: '#dde7c8' }}
                      />
                      <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1" tabIndex={-1}>
                        {showConfirm ? <EyeOff className="w-4 h-4" style={{ color: '#9db87a' }} /> : <Eye className="w-4 h-4" style={{ color: '#9db87a' }} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white mt-2 disabled:opacity-60 transition-all"
                    style={{ background: '#1b3520' }}
                  >
                    {submitting ? 'Creating account…' : 'Access Dashboard'}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
