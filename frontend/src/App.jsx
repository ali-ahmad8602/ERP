import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart3, LayoutGrid, LogOut, User, UserPlus } from 'lucide-react'
import AnalyticsPage from './pages/AnalyticsPage'
import NotificationsPage from './pages/NotificationsPage'
import DashboardPage from './pages/DashboardPage'
import BoardsPage from './pages/BoardsPage'
import BoardViewPage from './pages/BoardViewPage'
import LoginPage from './pages/LoginPage'
import InvitesPage from './pages/InvitesPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import NotificationBell from './components/notifications/NotificationBell'
import useAuthStore from './store/useAuthStore'
import useNotificationStore from './store/useNotificationStore'
import usePermissions from './hooks/usePermissions'
import { connectSocket, disconnectSocket, onNotification, onStatusChange } from './lib/socket'

/* ─── Protected Route Wrapper ──────────────────────────────────────────────── */

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

/* ─── Socket Manager — connects/disconnects based on auth state ────────────── */

function SocketManager() {
  const token = useAuthStore((s) => s.token)
  const addRealtimeNotification = useNotificationStore((s) => s.addRealtimeNotification)

  useEffect(() => {
    if (!token) {
      disconnectSocket()
      return
    }

    connectSocket(token)
    const unsub = onNotification((data) => {
      addRealtimeNotification(data)
    })

    return () => {
      unsub()
      disconnectSocket()
    }
  }, [token])

  return null
}

/* ─── Top Navigation Bar ───────────────────────────────────────────────────── */

function TopBar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { orgRole, isReadOnly, canInviteUsers } = usePermissions()
  const [socketStatus, setSocketStatus] = useState('disconnected')

  useEffect(() => {
    return onStatusChange(setSocketStatus)
  }, [])

  const handleLogout = () => {
    disconnectSocket()
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    [
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-glass-hover text-text-primary border border-glass-border-hover'
        : 'text-text-muted hover:text-text-secondary hover:bg-glass',
    ].join(' ')

  return (
    <header className="sticky top-0 z-40 w-full border-b border-glass-border bg-surface/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-heading font-semibold text-text-primary tracking-tight">
              InvoiceMate
            </span>
            {/* Connection status dot */}
            <span
              title={socketStatus === 'connected' ? 'Real-time connected' : socketStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                socketStatus === 'connected' ? 'bg-accent-emerald' :
                socketStatus === 'reconnecting' ? 'bg-amber animate-pulse' :
                'bg-text-muted/30'
              }`}
            />
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </NavLink>
            <NavLink to="/boards" className={linkClass}>
              <LayoutGrid className="w-3.5 h-3.5" />
              Boards
            </NavLink>
            {!isReadOnly && (
              <NavLink to="/analytics" className={linkClass}>
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </NavLink>
            )}
            {canInviteUsers && (
              <NavLink to="/invites" className={linkClass}>
                <UserPlus className="w-3.5 h-3.5" />
                Invites
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          {user && (
            <div className="flex items-center gap-2 ml-1">
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary-light" />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs text-text-secondary max-w-[100px] truncate leading-tight">
                    {user.name}
                  </span>
                  {orgRole && (
                    <span className="text-[10px] text-text-muted leading-tight">
                      {orgRole.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-xl hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/* ─── App Shell ────────────────────────────────────────────────────────────── */

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />

      {/* Protected */}
      <Route path="/dashboard" element={<RequireAuth><TopBar /><DashboardPage /></RequireAuth>} />
      <Route path="/boards" element={<RequireAuth><TopBar /><BoardsPage /></RequireAuth>} />
      <Route path="/boards/:boardId" element={<RequireAuth><TopBar /><BoardViewPage /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><TopBar /><AnalyticsPage /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><TopBar /><NotificationsPage /></RequireAuth>} />
      <Route path="/invites" element={<RequireAuth><TopBar /><InvitesPage /></RequireAuth>} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  const loading = useAuthStore((s) => s.loading)
  const checkSession = useAuthStore((s) => s.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-text-muted text-sm animate-pulse">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <SocketManager />
      <AppRoutes />
    </BrowserRouter>
  )
}
