import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function roleHome(role) {
  if (role === 'pos') return '/pos'
  if (role === 'guide') return '/activities'
  if (role === 'housekeeping') return '/rooms'
  return '/dashboard'
}

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to={roleHome(user?.role)} replace />
  return children
}
