import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import useNotificationStore from '../store/useNotificationStore'
import NotificationItem from '../components/notifications/NotificationItem'
import GlassCard from '../components/ui/GlassCard'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
]

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const notifications = useNotificationStore((s) => s.notifications)
  const loading = useNotificationStore((s) => s.loading)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filtered =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  return (
    <motion.div
      className="min-h-screen bg-base px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary-light" strokeWidth={1.8} />
            Notifications
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading
              ? 'Loading...'
              : unreadCount() > 0
                ? `You have ${unreadCount()} unread notification${unreadCount() > 1 ? 's' : ''}`
                : 'You\'re all caught up'}
          </p>
        </div>

        {unreadCount() > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors px-3 py-2 rounded-xl hover:bg-glass-hover cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-glass rounded-xl p-1 w-fit border border-glass-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              activeTab === tab.key
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary',
            ].join(' ')}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="notification-tab"
                className="absolute inset-0 bg-glass-hover rounded-lg border border-glass-border-hover"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Notification List */}
      <GlassCard className="overflow-hidden" glow="none">
        <div className="divide-y divide-glass-border/40">
          {loading && notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Loader2 className="w-6 h-6 text-text-muted animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-muted">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Bell className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-text-muted">
                {activeTab === 'unread'
                  ? 'No unread notifications'
                  : 'No notifications yet'}
              </p>
            </div>
          ) : (
            filtered.map((notification, i) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={i}
              />
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-glass-border text-center">
            <p className="text-xs text-text-muted">
              Showing all {filtered.length} notifications
            </p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
