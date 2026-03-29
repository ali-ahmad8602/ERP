import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react'
import useBoardStore from '../../store/useBoardStore'
import useAuthStore from '../../store/useAuthStore'

const statusStyles = {
  pending: { icon: Clock, bg: 'bg-amber/10', border: 'border-amber/20', text: 'text-amber', label: 'Pending Approval' },
  approved: { icon: CheckCircle2, bg: 'bg-accent-emerald/10', border: 'border-accent-emerald/20', text: 'text-accent-emerald', label: 'Approved' },
  rejected: { icon: XCircle, bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', label: 'Rejected' },
}

export default function ApprovalSection({ card, boardId, onCardUpdated }) {
  const approval = card.approval
  if (!approval || !approval.required) return null

  const user = useAuthStore((s) => s.user)
  const approve = useBoardStore((s) => s.approveCard)
  const reject = useBoardStore((s) => s.rejectCard)

  const [acting, setActing] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const style = statusStyles[approval.status] || statusStyles.pending
  const StatusIcon = style.icon

  // Check if current user is an approver
  const userId = user?._id || user?.id
  const isApprover = approval.approvers.some((a) => a.id === userId)
  const hasApproved = approval.approvedBy.some((a) => a.id === userId)
  const canAct = isApprover && approval.status === 'pending' && !hasApproved
  const approvedCount = approval.approvedBy.length
  const totalApprovers = approval.approvers.length

  const handleApprove = async () => {
    setActing(true)
    setError(null)
    try {
      const updated = await approve(boardId, card.id)
      onCardUpdated?.(updated)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve')
    } finally {
      setActing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }
    setActing(true)
    setError(null)
    try {
      const updated = await reject(boardId, card.id, rejectReason.trim())
      onCardUpdated?.(updated)
      setShowReject(false)
      setRejectReason('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject')
    } finally {
      setActing(false)
    }
  }

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden`}>
      {/* Status Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${style.text}`} />
          <span className={`text-sm font-semibold ${style.text}`}>{style.label}</span>
          {approval.status === 'pending' && totalApprovers > 0 && (
            <span className="text-xs text-text-muted">
              ({approvedCount}/{totalApprovers})
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-lg hover:bg-white/5 transition-colors text-text-muted cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Progress Bar */}
      {approval.status === 'pending' && totalApprovers > 0 && (
        <div className="px-4 pb-3">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-amber"
              initial={{ width: 0 }}
              animate={{ width: `${(approvedCount / totalApprovers) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {approval.status === 'rejected' && approval.rejectionReason && (
        <div className="px-4 pb-3">
          <p className="text-xs text-danger/80 italic">
            "{approval.rejectionReason}"
          </p>
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/5"
        >
          <div className="px-4 py-3 space-y-2">
            {/* Approver list */}
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium">Approvers</p>
            {approval.approvers.map((approver) => {
              const approved = approval.approvedBy.some((a) => a.id === approver.id)
              return (
                <div key={approver.id} className="flex items-center gap-2 py-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${approved ? 'bg-accent-emerald/20' : 'bg-glass'}`}>
                    {approved ? (
                      <CheckCircle2 className="w-3 h-3 text-accent-emerald" />
                    ) : (
                      <User className="w-3 h-3 text-text-muted" />
                    )}
                  </div>
                  <span className={`text-xs ${approved ? 'text-accent-emerald' : 'text-text-secondary'}`}>
                    {approver.name || approver.email || 'Unknown'}
                  </span>
                  {approved && (
                    <span className="text-[10px] text-accent-emerald/60">approved</span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {canAct && (
        <div className="border-t border-white/5 px-4 py-3 space-y-2">
          {error && (
            <div className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">
              {error}
            </div>
          )}

          {showReject ? (
            <div className="space-y-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={2}
                disabled={acting}
                className="w-full px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-danger/50 focus:ring-1 focus:ring-danger/20 transition-all resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowReject(false); setRejectReason(''); setError(null) }}
                  disabled={acting}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:bg-glass-hover transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={acting || !rejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-danger text-white hover:bg-danger/90 transition-all cursor-pointer disabled:opacity-40"
                >
                  {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldX className="w-3 h-3" />}
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={acting}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-accent-emerald text-white hover:bg-accent-emerald/90 transition-all cursor-pointer disabled:opacity-40"
              >
                {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                Approve
              </button>
              <button
                onClick={() => setShowReject(true)}
                disabled={acting}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all cursor-pointer disabled:opacity-40"
              >
                <ShieldX className="w-3 h-3" />
                Reject
              </button>
            </div>
          )}

          {hasApproved && (
            <p className="text-xs text-accent-emerald text-center">You have already approved this card</p>
          )}
        </div>
      )}
    </div>
  )
}
