import { motion } from 'framer-motion'
import {
  PlusCircle,
  Pencil,
  ArrowRightLeft,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Archive,
  Paperclip,
  FileX,
  History,
} from 'lucide-react'

/**
 * Maps card.auditLog action types to display config.
 * Backend action values: created, edited, moved, commented, approved, rejected,
 *   archived, attachment_added, attachment_removed
 */
const auditConfig = {
  created:             { icon: PlusCircle,    color: 'text-primary-light', bg: 'bg-primary-light/10', label: 'Created card' },
  edited:              { icon: Pencil,        color: 'text-text-secondary', bg: 'bg-glass',           label: 'Edited card' },
  moved:               { icon: ArrowRightLeft, color: 'text-primary-light', bg: 'bg-primary-light/10', label: 'Moved card' },
  commented:           { icon: MessageSquare, color: 'text-amber',          bg: 'bg-amber/10',        label: 'Added comment' },
  approved:            { icon: CheckCircle2,  color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', label: 'Approved' },
  rejected:            { icon: XCircle,       color: 'text-danger',         bg: 'bg-danger/10',       label: 'Rejected' },
  archived:            { icon: Archive,       color: 'text-text-muted',     bg: 'bg-glass',           label: 'Archived' },
  attachment_added:    { icon: Paperclip,     color: 'text-primary-light', bg: 'bg-primary-light/10', label: 'Uploaded file' },
  attachment_removed:  { icon: FileX,         color: 'text-text-muted',     bg: 'bg-glass',           label: 'Removed file' },
}

const defaultConfig = { icon: History, color: 'text-text-muted', bg: 'bg-glass', label: 'Updated' }

function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`

  // For older entries, show full date + time
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function CardAuditLog({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Audit Trail
        </h3>
        <p className="text-xs text-text-muted/50 py-2">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <History className="w-3.5 h-3.5" />
        Audit Trail
        <span className="text-text-muted/60">({entries.length})</span>
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-glass-border" />

        <div className="space-y-0">
          {entries.map((entry, i) => {
            const config = auditConfig[entry.action] || defaultConfig
            const Icon = config.icon

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="flex items-start gap-3 py-2.5 relative"
              >
                {/* Icon node on timeline */}
                <div className={`p-1.5 rounded-lg ${config.bg} border border-glass-border shrink-0 z-10 bg-surface`}>
                  <Icon className={`w-3 h-3 ${config.color}`} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-text-primary">
                      {typeof entry.user === 'string' ? entry.user : entry.user?.name || 'System'}
                    </span>
                    <span className={`text-xs ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  {entry.detail && (
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {entry.detail}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-text-muted font-mono shrink-0 pt-1">
                  {formatTime(entry.time)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
