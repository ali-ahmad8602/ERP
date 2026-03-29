import { motion } from 'framer-motion'
import { Calendar, Flag, User, ShieldCheck, Clock, ShieldX, AlertTriangle } from 'lucide-react'
import { getDueDateStatus, formatDate } from '../../lib/dates'

const priorityConfig = {
  urgent: { label: 'Urgent', bg: 'bg-danger/15', text: 'text-danger', dot: 'bg-danger' },
  critical: { label: 'Critical', bg: 'bg-danger/15', text: 'text-danger', dot: 'bg-danger' },
  high: { label: 'High', bg: 'bg-amber/15', text: 'text-amber', dot: 'bg-amber' },
  medium: { label: 'Medium', bg: 'bg-primary-light/15', text: 'text-primary-light', dot: 'bg-primary-light' },
  low: { label: 'Low', bg: 'bg-text-muted/15', text: 'text-text-muted', dot: 'bg-text-muted' },
}

const statusConfig = {
  none: { label: null },
  new: { label: 'New', bg: 'bg-primary-light/10', text: 'text-primary-light' },
  pending: { label: 'Pending Approval', bg: 'bg-amber/10', text: 'text-amber' },
  in_progress: { label: 'In Progress', bg: 'bg-amber/10', text: 'text-amber' },
  approved: { label: 'Approved', bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  done: { label: 'Done', bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  rejected: { label: 'Rejected', bg: 'bg-danger/10', text: 'text-danger' },
}

const approvalIcons = {
  pending: Clock,
  approved: ShieldCheck,
  rejected: ShieldX,
}

export default function KanbanCard({ card, index = 0, onClick, columnId, boardId, readOnly }) {
  const priority = priorityConfig[card.priority] || priorityConfig.medium
  const status = statusConfig[card.status] || statusConfig.new
  const dueStatus = getDueDateStatus(card.date)
  const isOverdue = dueStatus.status === 'overdue'
  const isDueSoon = dueStatus.status === 'due-today' || dueStatus.status === 'due-soon'

  return (
    <motion.div
      layout
      layoutId={card.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={() => onClick?.(card)}
      drag={readOnly || card.status === 'pending' ? false : 'x'}
      dragSnapToOrigin
      dragElastic={0.15}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (Math.abs(info.offset.x) > 100) {
          const direction = info.offset.x > 0 ? 'right' : 'left'
          window.dispatchEvent(
            new CustomEvent('kanban-card-drag', {
              detail: { cardId: card.id, columnId, boardId, direction },
            })
          )
        }
      }}
      className={[
        'bg-glass/80 backdrop-blur-md border rounded-xl p-4 cursor-pointer transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] group',
        isOverdue
          ? 'border-danger/30 hover:border-danger/50 shadow-[0_0_12px_rgba(255,59,59,0.08)]'
          : isDueSoon
            ? 'border-amber/20 hover:border-amber/40'
            : 'border-glass-border hover:border-glass-border-hover',
      ].join(' ')}
    >
      {/* Priority + Status + Overdue badges */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${priority.bg} ${priority.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>
        {status.label && (
          <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${status.bg} ${status.text}`}>
            {approvalIcons[card.status] && (() => { const I = approvalIcons[card.status]; return <I className="w-3 h-3" /> })()}
            {status.label}
          </span>
        )}
        {isOverdue && (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-danger/15 text-danger">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        )}
        {dueStatus.status === 'due-today' && (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-danger/15 text-danger animate-pulse">
            <Clock className="w-3 h-3" />
            Due Today
          </span>
        )}
        {dueStatus.status === 'due-soon' && (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber/10 text-amber">
            <Clock className="w-3 h-3" />
            {dueStatus.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-text-primary leading-snug mb-3 group-hover:text-white transition-colors">
        {card.title}
      </h4>

      {/* Meta Row */}
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center gap-3">
          {card.date && (
            <span className={`flex items-center gap-1 ${dueStatus.color || 'text-text-muted'}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(card.date)}
            </span>
          )}
          {card.assignee && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {card.assignee.split(' ')[0]}
            </span>
          )}
        </div>
        {card.auditLog?.length > 0 && (
          <span className="text-text-muted/60">
            {card.auditLog.length} update{card.auditLog.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.div>
  )
}
