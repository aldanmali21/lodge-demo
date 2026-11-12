import { createContext, useContext, useState } from 'react'
import api from '../lib/api'
import { resetDemo } from '../mock/server'

const AuthContext = createContext(null)

const WRITE_ROLES = {
  '/calendar':     ['admin', 'frontdesk'],
  '/guests':       ['admin', 'frontdesk', 'housekeeping', 'viewer'],
  '/folios':       ['admin', 'frontdesk'],
  '/pos':          ['admin', 'frontdesk', 'pos'],
  '/housekeeping': ['admin', 'housekeeping'],
  '/activities':   ['admin', 'frontdesk'],
  '/finance':      ['admin', 'frontdesk'],
  '/users':        ['admin'],
  '/settings':     ['admin', 'frontdesk', 'pos', 'guide', 'housekeeping', 'viewer'],
}

// Demo mode: no login. The visitor is always signed in as the lodge admin.
const DEMO_USER = { id: 1, name: 'Aldan Mali', email: 'admin@lodgedemo.example', role: 'admin' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_USER)

  function updateUser(patch) {
    setUser(u => ({ ...u, ...patch }))
  }

  // "Reset demo" — restores the original seeded records and reloads.
  function resetData() {
    resetDemo()
    window.location.assign('/dashboard')
  }

  return (
    <AuthContext.Provider value={{ user, token: 'demo', loading: false, updateUser, resetData, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export function useCanWrite(path) {
  const { user } = useAuth()
  if (!user) return false
  const roles = WRITE_ROLES[path]
  if (!roles) return true
  return roles.includes(user.role)
}
