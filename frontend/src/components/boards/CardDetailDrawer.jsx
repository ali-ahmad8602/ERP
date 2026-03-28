import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  User,
  Building2,
  Flag,
  CheckCircle2,
  ArrowRightLeft,
  MessageSquare,
  PlusCircle,
} from 'lucide-react'

const priorityConfig = {
  critical: { label: 'Critical', bg: 'bg-danger/15', text: 'text-danger' },
  high: { label: 'High', bg: 'bg-amber/15', text: 'text-amber' },
  medium: { label: 'Medium', bg: 'bg-primary-light/15', text: 'text-primary-light' },
  low: { label: 'Low', bg: 'bg-text-muted/15', text: 'text-text-muted' },
}

const statusConfig = {
  new: { label: 'New', bg: 'bg-primary-light/10', text: 'text-primary-light' },
  in_progress: { label: 'In Progress', bg: 'bg-amber/10', text: 'text-amber' },
  approved: { label: 'Approved', bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  done: { label: 'Done', bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  rejected: { label: 'Rejected', bg: 'bg-danger/10', text: 'text-danger' },
}

const activityIcons = {
  Created: PlusCircle,
  Moved: ArrowRightLeft,
  Approved: CheckCircle2,
  Reviewed: CheckCircle2,
  Added: MessageSquare,
  Started: ArrowRightLeft,
  Marked: CheckCircle2,
}

function getActivityIcon(action) {
  for (const [keyword, Icon] of Object.entries(activityIcons)) {
    if (action.includes(keyword)) return Icon
  }
  return PlusCircle
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

export default function CardDetailDrawer({ card, onClose }) {
  if (!card) return null

  const priority = priorityConfig[card.priority] || priorityConfig.medium
  const status = statusConfig[card.status] || statusConfig.new

  return (
    <AnimatePresence>
      {card && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-surface border-l border-glass-border shadow-[−20px_0_60px_rgba(0,0,0,0.5)] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-glass-border px-6 py-4 flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-lg font-heading font-bold text-text-primary leading-snug">
                  {card.title}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${priority.bg} ${priority.text}`}>
                    {priority.label} Priority
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {card.description || 'No description provided.'}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-glass border border-glass-border">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-xs text-text-muted">Assigned to</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {card.assignee || 'Unassigned'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-glass border border-glass-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-xs text-text-muted">Department</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {card.department || '—'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-glass border border-glass-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-xs text-text-muted">Date</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(card.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-glass border border-glass-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-xs text-text-muted">Priority</span>
                  </div>
                  <p className={`text-sm font-medium ${priority.text}`}>
                    {priority.label}
                  </p>
                </div>
              </div>

              {/* Activity History */}
              {card.activity && card.activity.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                    Activity
                  </h3>
                  <div className="space-y-0">
                    {card.activity.map((entry, i) => {
                      const Icon = getActivityIcon(entry.action)
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.25 }}
                          className="flex items-start gap-3 py-3 border-b border-glass-border/30 last:border-0"
                        >
                          <div className="p-1.5 rounded-lg bg-glass border border-glass-border mt-0.5 shrink-0">
                            <Icon className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-secondary">
                              <span className="font-medium text-text-primary">{entry.user}</span>
                              {' '}{entry.action.toLowerCase()}
                            </p>
                            <p className="text-[11px] text-text-muted font-mono mt-0.5">
                              {relativeTime(entry.time)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
