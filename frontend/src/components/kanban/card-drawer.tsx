"use client"

import { useState, useRef } from "react"
import { X, FileText, Paperclip, Calendar, Users, Send, Upload } from "lucide-react"
import { cardApi } from "@/lib/api"
import type { Card, Priority } from "./types"

const priorityConfig: Record<Priority, { label: string; bg: string; text: string }> = {
  low: { label: "Low", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
  medium: { label: "Medium", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  high: { label: "High", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
}

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  "ideas": { label: "Ideas", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
  "backlog": { label: "Backlog", bg: "bg-[#71717a]/15", text: "text-[#a1a1aa]" },
  "in-progress": { label: "In Progress", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  "in-review": { label: "In Review", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  "done": { label: "Done", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
}

interface CardDrawerProps {
  card: Card | null
  onClose: () => void
  onComment?: (cardId: string, text: string) => void
  onApprove?: (cardId: string) => void
  onReject?: (cardId: string, reason: string) => void
  onAttachmentUploaded?: (cardId: string) => void
}

export function CardDrawer({ card, onClose, onComment, onApprove, onReject, onAttachmentUploaded }: CardDrawerProps) {
  const [commentText, setCommentText] = useState("")
  const [uploading, setUploading] = useState(false)
  const [localAttachments, setLocalAttachments] = useState<Card["attachments"]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!card) return null

  const priority = priorityConfig[card.priority]
  const status = statusLabels[card.columnId] || { label: card.columnId, bg: "bg-[#71717a]/15", text: "text-[#71717a]" }

  const handleSendComment = () => {
    if (!commentText.trim()) return
    if (onComment) {
      onComment(card.id, commentText.trim())
    }
    setCommentText("")
  }

  const handleApprove = () => {
    if (onApprove) {
      onApprove(card.id)
    }
  }

  const handleReject = () => {
    const reason = window.prompt("Rejection reason:")
    if (reason && onReject) {
      onReject(card.id, reason)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await cardApi.uploadAttachment(card.id, file)
      // Optimistically add attachment to local list
      const newAtt = data.attachment || { _id: Date.now().toString(), name: file.name, size: `${Math.round(file.size / 1024)} KB`, type: file.name.split(".").pop() || "" }
      setLocalAttachments((prev) => [...prev, { id: newAtt._id || newAtt.id, name: newAtt.name, size: newAtt.size || "", type: newAtt.type || "" }])
      if (onAttachmentUploaded) onAttachmentUploaded(card.id)
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const allAttachments = [...card.attachments, ...localAttachments]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-[480px] bg-[#09090b] border-l border-[#27272a] z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#27272a]">
          <div className="flex-1 pr-4">
            <h2 className="text-[16px] font-semibold text-[#fafafa] leading-snug mb-2">
              {card.title}
            </h2>
            {card.referenceId && (
              <span className="text-[11px] text-[#52525b]">{card.referenceId}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#ffffff0a]">
          {/* Assignees */}
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
            <div className="flex -space-x-1">
              {card.assignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full bg-[#27272a] border-2 border-[#09090b] flex items-center justify-center"
                  title={assignee.name}
                >
                  <span className="text-[9px] font-medium text-[#a1a1aa]">
                    {assignee.initials}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-1.5 text-[#71717a]">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-[11px]">{card.dueDate}</span>
          </div>

          {/* Priority */}
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`}>
            {priority.label}
          </span>

          {/* Amount */}
          {card.amount && (
            <span className="text-[12px] font-medium text-[#fafafa] ml-auto">
              {card.amount}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Description */}
          <div className="px-4 py-4 border-b border-[#ffffff0a]">
            <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-2">
              Description
            </h4>
            <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
              {card.description || "No description provided."}
            </p>
          </div>

          {/* Attachments */}
          <div className="px-4 py-4 border-b border-[#ffffff0a]">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider">
                Attachments
              </h4>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 h-6 px-2 rounded bg-[#27272a] text-[10px] font-medium text-[#a1a1aa] hover:bg-[#3f3f46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Upload className="w-3 h-3" strokeWidth={1.5} />
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
            {allAttachments.length > 0 ? (
              <div className="space-y-1">
                {allAttachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#0f0f11] border border-[#27272a] hover:border-[#3f3f46] transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#52525b]" strokeWidth={1.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#fafafa] truncate">{file.name}</p>
                      <p className="text-[10px] text-[#52525b]">{file.size}</p>
                    </div>
                    <Paperclip className="w-3.5 h-3.5 text-[#3f3f46]" strokeWidth={1.5} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#52525b]">No attachments yet</p>
            )}
          </div>

          {/* Comments */}
          <div className="px-4 py-4 border-b border-[#ffffff0a]">
            <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">
              Comments ({card.comments.length})
            </h4>
            {card.comments.length > 0 ? (
              <div className="space-y-3">
                {card.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-medium text-[#a1a1aa]">
                        {comment.author.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] font-medium text-[#fafafa]">
                          {comment.author.name}
                        </span>
                        <span className="text-[10px] text-[#3f3f46]">
                          {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#a1a1aa] leading-snug">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#52525b]">No comments yet</p>
            )}

            {/* Comment Input */}
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendComment()
                }}
                placeholder="Write a comment..."
                className="flex-1 h-8 px-3 rounded-[6px] bg-[#0f0f11] border border-[#27272a] text-[12px] text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#3f3f46] transition-colors"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim()}
                className="h-8 w-8 flex items-center justify-center rounded-[6px] bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Approval Section */}
          <div className="px-4 py-4">
            <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">
              Approval
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleApprove}
                className="h-8 px-4 rounded-[6px] bg-[#22c55e] text-[12px] font-medium text-white hover:bg-[#16a34a] transition-colors"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="h-8 px-4 rounded-[6px] bg-[#27272a] text-[12px] font-medium text-[#ef4444] hover:bg-[#ef4444]/15 border border-[#27272a] hover:border-[#ef4444]/30 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
