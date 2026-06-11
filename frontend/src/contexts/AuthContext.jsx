import { createContext, useContext, useReducer } from 'react'
import api from '../lib/api'

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

const initialState = {
  user: JSON.parse(localStorage.getItem('tl_user') || 'null'),
  token: localStorage.getItem('tl_token') || null,
  loading: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, token: action.token, loading: false }
    case 'LOGOUT':
      return { user: null, token: null, loading: false }
    case 'LOADING':
      return { ...state, loading: true }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  async function login(email, password) {
    dispatch({ type: 'LOADING' })
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('tl_token', data.token)
    localStorage.setItem('tl_user', JSON.stringify(data.user))
    dispatch({ type: 'LOGIN', user: data.user, token: data.token })
    return data.user
  }

  function logout() {
    localStorage.removeItem('tl_token')
    localStorage.removeItem('tl_user')
    dispatch({ type: 'LOGOUT' })
  }

  function updateUser(user) {
    const updated = { ...state.user, ...user }
    localStorage.setItem('tl_user', JSON.stringify(updated))
    dispatch({ type: 'UPDATE_USER', user })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, isAuthenticated: !!state.token }}>
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
