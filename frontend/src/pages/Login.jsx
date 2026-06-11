import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Mountain, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[3fr_2fr]">
      {/* Left — aerial safari photo */}
      <div
        className="relative hidden lg:flex flex-col justify-end p-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(13,26,15,0.2) 0%, rgba(13,26,15,0.7) 100%),
            url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1400&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <Mountain className="text-gold w-7 h-7" style={{ color: '#c8a96e' }} />
            <Mountain className="text-gold w-5 h-5 -ml-1" style={{ color: '#c8a96e' }} />
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">Twin Lakes</h1>
          <p className="font-display text-xl text-white/70 italic mt-1">Safari Lodge Management</p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex items-center justify-center bg-cream px-8 py-12 min-h-screen">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Mountain className="w-6 h-6" style={{ color: '#1b3520' }} />
            <span className="font-display text-2xl font-bold" style={{ color: '#1b3520' }}>Twin Lakes</span>
          </div>

          <div
            className="bg-white rounded-2xl p-8 shadow-sm border"
            style={{ borderColor: '#dde7c8' }}
          >
            <h2 className="font-display text-3xl font-semibold text-center mb-1" style={{ color: '#1c2b1e' }}>
              Secure Access
            </h2>
            <p className="text-center text-sm mb-7" style={{ color: '#5a6b5c' }}>
              Enter your credentials to access the Lodge Management System.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#1b3520' }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9db87a' }} />
                  <input
                    type="email"
                    placeholder="staff@twinlakes.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border-b-2 bg-transparent outline-none text-sm transition-colors"
                    style={{ borderColor: '#dde7c8', color: '#1c2b1e' }}
                    onFocus={e => e.target.style.borderColor = '#1b3520'}
                    onBlur={e => e.target.style.borderColor = '#dde7c8'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: '#1b3520' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9db87a' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2.5 border-b-2 bg-transparent outline-none text-sm transition-colors"
                    style={{ borderColor: '#dde7c8', color: '#1c2b1e' }}
                    onFocus={e => e.target.style.borderColor = '#1b3520'}
                    onBlur={e => e.target.style.borderColor = '#dde7c8'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" style={{ color: '#9db87a' }} /> : <Eye className="w-4 h-4" style={{ color: '#9db87a' }} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#1b3520' }}
                  />
                  <span className="text-sm" style={{ color: '#5a6b5c' }}>Remember Me</span>
                </label>
                <button type="button" className="text-sm hover:underline" style={{ color: '#5a6b5c' }}>
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all mt-2 disabled:opacity-60"
                style={{ background: loading ? '#3d7a30' : '#1b3520' }}
                onMouseEnter={e => !loading && (e.target.style.background = '#2d5a22')}
                onMouseLeave={e => !loading && (e.target.style.background = '#1b3520')}
              >
                {loading ? 'Signing in…' : 'Access Dashboard'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-xs mt-5" style={{ color: '#9db87a' }}>
              Authorized Personnel Only. Monitored System.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
