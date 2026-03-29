import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  User,
  Building2,
  Flag,
  Send,
  Loader2,
  Archive,
  AlertTriangle,
} from 'lucide-react'
import useBoardStore from '../../store/useBoardStore'
import AttachmentSection from './AttachmentSection'
import CustomFieldsDisplay from './CustomFieldsDisplay'
import ApprovalSection from './ApprovalSection'
import CardAuditLog from './CardAuditLog'
import { getDueDateStatus, formatDate } from '../../lib/dates'

const priorityConfig = {
  urgent: { label: 'Urgent', bg: 'bg-danger/15', text: 'text-danger' },
  critical: { label: 'Critical', bg: 'bg-danger/15', text: 'text-danger' },
  high: { label: 'High', bg: 'bg-amber/15', text: 'text-amber' },
  medium: { label: 'Medium', bg: 'bg-primary-light/15', text: 'text-primary-light' },
  low: { label: 'Low', bg: 'bg-text-muted/15', text: 'text-text-muted' },
  none: { label: 'None', bg: 'bg-glass', text: 'text-text-muted' },
}

const statusConfig = {
  none: { label: 'None', bg: 'bg-glass', text: 'text-text-muted' },
  new: { label: 'New', bg: 'bg-primary-light/10', text: 'text-primary-light' },
  pending: { label: 'Pending', bg: 'bg-amber/10', text: 'text-amber' },
  in_progress: { label: 'In Progress', bg: 'bg-amber/10', text: 'text-amber' },
  approved: { label: 'Approved', bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  done: { label: 'Done', bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  rejected: { label: 'Rejected', bg: 'bg-danger/10', text: 'text-danger' },
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function CardDetailDrawer({ card, boardId, onClose, onArchived, readOnly }) {
  const addComment = useBoardStore((s) => s.addComment)
  const archiveCard = useBoardStore((s) => s.archiveCard)
  const customFieldDefs = useBoardStore((s) => s.getCustomFields(boardId))
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [localAttachments, setLocalAttachments] = useState(null)

  // Track local updates from approval/attachment changes without full refetch
  const [localCard, setLocalCard] = useState(null)

  if (!card) return null

  const activeCard = localCard && localCard.id === card.id ? localCard : card

  // Use local attachments if updated via upload/delete, otherwise use card's
  const attachments = localAttachments ?? activeCard.attachments ?? []

  const handleAttachmentsChanged = (rawAttachments) => {
    if (!rawAttachments) return
    setLocalAttachments(
      rawAttachments.map((a) => ({
        id: a._id,
        name: a.name,
        url: a.url,
        uploadedBy: a.uploadedBy?.name || '',
        uploadedAt: a.uploadedAt,
      }))
    )
  }

  const priority = priorityConfig[activeCard.priority] || priorityConfig.none
  const status = statusConfig[activeCard.status] || statusConfig.none

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || commenting) return
    setCommenting(true)
    try {
      await addComment(card.id, commentText.trim())
      setCommentText('')
    } catch {
      // Comment failed — text stays so user can retry
    } finally {
      setCommenting(false)
    }
  }

  const handleArchive = async () => {
    if (archiving) return
    setArchiving(true)
    try {
      await archiveCard(boardId, card.id)
      onArchived?.()
      onClose()
    } catch {
      setArchiving(false)
    }
  }

  return (
    <AnimatePresence>
      {card && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-surface border-l border-glass-border shadow-[-20px_0_60px_rgba(0,0,0,0.5)] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-glass-border px-6 py-4 flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-lg font-heading font-bold text-text-primary leading-snug">
                  {activeCard.title}
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
              {/* Approval Workflow */}
              <ApprovalSection
                card={activeCard}
                boardId={boardId}
                onCardUpdated={setLocalCard}
              />

              {/* Description */}
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {activeCard.description || 'No description provided.'}
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
                    {activeCard.assignee || 'Unassigned'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-glass border border-glass-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-xs text-text-muted">Department</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {activeCard.department || '—'}
                  </p>
                </div>

                {(() => {
                  const ds = getDueDateStatus(activeCard.date)
                  const isAlert = ds.status === 'overdue' || ds.status === 'due-today'
                  return (
                    <div className={`p-3 rounded-xl border ${isAlert ? `${ds.bg} ${ds.border}` : 'bg-glass border-glass-border'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {isAlert ? (
                          <AlertTriangle className={`w-3.5 h-3.5 ${ds.color}`} />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        )}
                        <span className={`text-xs ${isAlert ? ds.color : 'text-text-muted'}`}>Due Date</span>
                      </div>
                      <p className={`text-sm font-medium ${ds.color || 'text-text-primary'}`}>
                        {formatDate(activeCard.date, 'long')}
                      </p>
                      {ds.label && (
                        <p className={`text-[11px] font-medium mt-0.5 ${ds.color}`}>
                          {ds.label}
                        </p>
                      )}
                    </div>
                  )
                })()}

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

              {/* Custom Fields */}
              <CustomFieldsDisplay
                fieldDefinitions={customFieldDefs}
                cardFieldValues={activeCard.customFields}
              />

              {/* Attachments */}
              <AttachmentSection
                cardId={card.id}
                attachments={attachments}
                readOnly={readOnly}
                onAttachmentsChanged={handleAttachmentsChanged}
              />

              {/* Add Comment — hidden for read-only (guest) users */}
              {!readOnly && (
                <div>
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                    Add Comment
                  </h3>
                  <form onSubmit={handleComment} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      disabled={commenting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || commenting}
                      className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {commenting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Card Audit Trail */}
              <CardAuditLog entries={activeCard.auditLog} />

              {/* Archive — hidden for read-only users */}
              {!readOnly && (
                <div className="pt-4 border-t border-glass-border">
                  <button
                    onClick={handleArchive}
                    disabled={archiving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-danger/80 hover:text-danger bg-danger/5 hover:bg-danger/10 border border-danger/10 hover:border-danger/20 transition-all cursor-pointer w-full justify-center disabled:opacity-40"
                  >
                    {archiving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                    {archiving ? 'Archiving...' : 'Archive Card'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
