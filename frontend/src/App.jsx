import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import { ToastContainer } from './components/Toast'
import Login from './pages/Login'
import AcceptInvite from './pages/AcceptInvite'
import Dashboard from './pages/Dashboard'
import Calendar from './pages/Calendar'
import Guests from './pages/Guests'
import FoliosList from './pages/FoliosList'
import FolioPage from './pages/Folio'
import POS from './pages/POS'
import Activities from './pages/Activities'
import Housekeeping from './pages/Housekeeping'
import Finance from './pages/Finance'
import Settings from './pages/Settings'
import Users from './pages/Users'
import Rooms from './pages/Rooms'
import Reports from './pages/Reports'

function RoleDefaultRedirect() {
  const { user } = useAuth()
  const role = user?.role
  if (role === 'pos') return <Navigate to="/pos" replace />
  if (role === 'guide') return <Navigate to="/activities" replace />
  if (role === 'housekeeping') return <Navigate to="/rooms" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />

          {/* Authenticated app shell */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<RoleDefaultRedirect />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="guests" element={<Guests />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="rooms" element={
              <ProtectedRoute roles={['admin', 'frontdesk', 'housekeeping', 'viewer']}>
                <Rooms />
              </ProtectedRoute>
            } />
            <Route path="folios" element={<FoliosList />} />
            <Route path="folios/:id" element={<FolioPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="pos" element={
              <ProtectedRoute roles={['admin', 'frontdesk', 'pos', 'viewer']}>
                <POS />
              </ProtectedRoute>
            } />
            <Route path="activities" element={
              <ProtectedRoute roles={['admin', 'frontdesk', 'guide', 'viewer']}>
                <Activities />
              </ProtectedRoute>
            } />
            <Route path="housekeeping" element={
              <ProtectedRoute roles={['admin', 'housekeeping', 'viewer']}>
                <Housekeeping />
              </ProtectedRoute>
            } />
            <Route path="finance" element={
              <ProtectedRoute roles={['admin', 'frontdesk', 'viewer']}>
                <Finance />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute roles={['admin', 'frontdesk', 'viewer']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute roles={['admin']}>
                <Users />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  )
}
