import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ArrowRightLeft,
  MessageSquare,
  PlusCircle,
  XCircle,
  UserPlus,
  ClipboardCheck,
  Clock,
  AtSign,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useNotificationStore from '../../store/useNotificationStore'

const iconConfig = {
  card_approved: { icon: CheckCircle2, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  card_rejected: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
  card_moved: { icon: ArrowRightLeft, color: 'text-primary-light', bg: 'bg-primary-light/10' },
  card_created: { icon: PlusCircle, color: 'text-primary-light', bg: 'bg-primary-light/10' },
  comment_added: { icon: MessageSquare, color: 'text-amber', bg: 'bg-amber/10' },
  member_added: { icon: UserPlus, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
  task_assigned: { icon: PlusCircle, color: 'text-primary-light', bg: 'bg-primary-light/10' },
  approval_requested: { icon: ClipboardCheck, color: 'text-amber', bg: 'bg-amber/10' },
  due_date_reminder: { icon: Clock, color: 'text-danger', bg: 'bg-danger/10' },
  mentioned: { icon: AtSign, color: 'text-primary-light', bg: 'bg-primary-light/10' },
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function getRoute(notification) {
  const { type, meta } = notification
  if (type === 'card' && meta.boardId) return `/boards/${meta.boardId}`
  if (type === 'board' && meta.id) return `/boards/${meta.id}`
  if (type === 'department' && meta.slug) return `/departments/${meta.slug}`
  return '/notifications'
}

export default function NotificationItem({ notification, index = 0, onNavigate }) {
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const navigate = useNavigate()
  const config = iconConfig[notification.icon] || iconConfig.card_created
  const Icon = config.icon
  const isDueReminder = notification.icon === 'due_date_reminder'

  const handleClick = () => {
    markAsRead(notification.id)
    onNavigate?.()
    navigate(getRoute(notification))
  }

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
      className={[
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer',
        'hover:bg-glass-hover',
        notification.read ? 'opacity-50' : '',
        isDueReminder && !notification.read ? 'bg-danger/[0.03]' : '',
      ].join(' ')}
    >
      {/* Icon */}
      <div className={`p-2 rounded-xl ${config.bg} mt-0.5 shrink-0`}>
        <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary truncate">
            {notification.title}
          </span>
          {isDueReminder && !notification.read && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-danger/15 text-danger shrink-0">
              URGENT
            </span>
          )}
          {!notification.read && !isDueReminder && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[11px] text-text-muted mt-1 font-mono">
          {relativeTime(notification.timestamp)}
        </p>
      </div>
    </motion.button>
  )
}
