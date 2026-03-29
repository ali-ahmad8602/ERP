import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import useNotificationStore from '../../store/useNotificationStore'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const hasNew = useNotificationStore((s) => s.hasNewNotification)
  const clearNewFlag = useNotificationStore((s) => s.clearNewFlag)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = () => {
    setOpen((prev) => !prev)
    if (hasNew) clearNewFlag()
  }

  const count = unreadCount()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl transition-colors hover:bg-glass-hover cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-text-secondary" strokeWidth={1.8} />

        {/* Unread badge */}
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full ring-2 ring-surface">
            {count > 9 ? '9+' : count}
          </span>
        )}

        {/* Pulse ring for new real-time notification */}
        {hasNew && (
          <motion.span
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
            className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <NotificationDropdown onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
