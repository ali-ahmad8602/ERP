import { motion } from 'framer-motion'
import { CheckCheck, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useNotificationStore from '../../store/useNotificationStore'
import NotificationItem from './NotificationItem'

export default function NotificationDropdown({ onClose }) {
  const notifications = useNotificationStore((s) => s.notifications)
  const loading = useNotificationStore((s) => s.loading)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const navigate = useNavigate()

  const displayedNotifications = notifications.slice(0, 6)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute right-0 top-full mt-2 w-[380px] z-50 rounded-2xl border border-glass-border bg-surface/80 backdrop-blur-2xl shadow-[0_16px_64px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-heading font-semibold text-text-primary">
            Notifications
          </h3>
          {unreadCount() > 0 && (
            <span className="text-[11px] font-medium bg-primary/15 text-primary-light px-2 py-0.5 rounded-full">
              {unreadCount()} new
            </span>
          )}
        </div>
        {unreadCount() > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-glass-border/40">
        {loading && notifications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Loader2 className="w-5 h-5 text-text-muted animate-spin mx-auto mb-2" />
            <p className="text-xs text-text-muted">Loading...</p>
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-text-muted">No notifications yet</p>
          </div>
        ) : (
          displayedNotifications.map((notification, i) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              index={i}
              onNavigate={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-glass-border px-5 py-3 text-center">
        <button
          onClick={() => {
            onClose?.()
            navigate('/notifications')
          }}
          className="text-xs font-medium text-primary-light hover:text-primary-light/80 transition-colors cursor-pointer"
        >
          View All Notifications
        </button>
      </div>
    </motion.div>
  )
}
