import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ArrowRightLeft,
  MessageSquare,
  PlusCircle,
  XCircle,
  UserPlus,
  Archive,
  Settings,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const actionConfig = {
  card_approved: { icon: CheckCircle2, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', label: 'Approved' },
  card_rejected: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Rejected' },
  card_moved: { icon: ArrowRightLeft, color: 'text-primary-light', bg: 'bg-primary-light/10', label: 'Moved' },
  card_created: { icon: PlusCircle, color: 'text-primary-light', bg: 'bg-primary-light/10', label: 'Created' },
  card_edited: { icon: Settings, color: 'text-text-secondary', bg: 'bg-glass', label: 'Edited' },
  card_archived: { icon: Archive, color: 'text-text-muted', bg: 'bg-glass', label: 'Archived' },
  comment_added: { icon: MessageSquare, color: 'text-amber', bg: 'bg-amber/10', label: 'Commented' },
  member_added: { icon: UserPlus, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', label: 'Member Added' },
  member_removed: { icon: UserPlus, color: 'text-danger', bg: 'bg-danger/10', label: 'Member Removed' },
  board_created: { icon: PlusCircle, color: 'text-primary-light', bg: 'bg-primary-light/10', label: 'Board Created' },
  board_updated: { icon: Settings, color: 'text-primary-light', bg: 'bg-primary-light/10', label: 'Board Updated' },
  board_archived: { icon: Archive, color: 'text-text-muted', bg: 'bg-glass', label: 'Board Archived' },
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

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
}

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function ActivityTimeline({ activities }) {
  return (
    <GlassCard className="overflow-hidden" glow="none">
      <div className="px-6 py-4 border-b border-glass-border">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Recent Activity
        </h2>
      </div>

      <motion.div
        className="divide-y divide-glass-border/50"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {activities.map((activity) => {
          const config = actionConfig[activity.action] || actionConfig.card_created
          const Icon = config.icon

          return (
            <motion.div
              key={activity._id}
              variants={item}
              className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-glass-hover cursor-default"
            >
              {/* Timeline icon */}
              <div className={`p-2 rounded-xl ${config.bg} mt-0.5 shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} strokeWidth={1.8} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {/* User avatar */}
                  <div className="w-5 h-5 rounded-full bg-surface-light flex items-center justify-center text-[9px] font-bold text-text-muted shrink-0">
                    {getInitials(activity.user.name)}
                  </div>
                  <span className="text-sm font-medium text-text-primary truncate">
                    {activity.user.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-text-secondary truncate">
                  {activity.entityTitle}
                </p>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {activity.detail}
                </p>
              </div>

              {/* Meta */}
              <div className="text-right shrink-0 ml-2">
                <p className="text-xs text-text-muted font-mono">
                  {relativeTime(activity.createdAt)}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {activity.department?.icon} {activity.board?.name}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Load more placeholder */}
      <div className="px-6 py-3 border-t border-glass-border text-center">
        <button className="text-xs text-primary-light hover:text-primary-light/80 font-medium transition-colors">
          Load more activity...
        </button>
      </div>
    </GlassCard>
  )
}
