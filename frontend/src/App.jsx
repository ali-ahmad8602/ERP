import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart3, LayoutGrid } from 'lucide-react'
import AnalyticsPage from './pages/AnalyticsPage'
import NotificationsPage from './pages/NotificationsPage'
import DashboardPage from './pages/DashboardPage'
import BoardsPage from './pages/BoardsPage'
import BoardViewPage from './pages/BoardViewPage'
import NotificationBell from './components/notifications/NotificationBell'
import apiClient from './api/client'

function TopBar() {
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
          <span className="text-sm font-heading font-semibold text-text-primary tracking-tight">
            InvoiceMate
          </span>
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </NavLink>
            <NavLink to="/boards" className={linkClass}>
              <LayoutGrid className="w-3.5 h-3.5" />
              Boards
            </NavLink>
            <NavLink to="/analytics" className={linkClass}>
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [ready, setReady] = useState(() => !!localStorage.getItem('token'))

  // Auto-login with seed credentials if no token exists
  useEffect(() => {
    if (localStorage.getItem('token')) {
      setReady(true)
      return
    }
    apiClient
      .post('/auth/login', {
        email: 'hamza@invoicemate.com',
        password: 'Password1!',
      })
      .then((data) => {
        localStorage.setItem('token', data.token)
        setReady(true)
      })
      .catch(() => {
        // Proceed without auth — mock data will be used
        setReady(true)
      })
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-text-muted text-sm animate-pulse">
          Connecting to server...
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/boards/:boardId" element={<BoardViewPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
