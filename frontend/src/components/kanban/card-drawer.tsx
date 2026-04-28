"use client"

import { useState, useRef, useEffect } from "react"
import { X, FileText, Paperclip, Calendar, Users, Send, Upload, Save, RotateCcw, Download } from "lucide-react"
import { cardApi } from "@/lib/api"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/store/auth.store"
import { useToast } from "@/components/ui/action-toast"
import type { Card, Priority } from "./types"

interface AuditLogEntry {
  _id: string
  user: { name: string }
  action: string
  detail?: string
  createdAt: string
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const PRIORITY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: "Urgent", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
  high: { label: "High", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
  medium: { label: "Medium", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  low: { label: "Low", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
  none: { label: "None", bg: "bg-[#71717a]/10", text: "text-[#52525b]" },
}

function getPriority(val: string | undefined | null) {
  if (!val) return PRIORITY_STYLES.low
  return PRIORITY_STYLES[val.toLowerCase().trim()] || PRIORITY_STYLES.low
}

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  "ideas": { label: "Ideas", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
  "backlog": { label: "Backlog", bg: "bg-[#71717a]/15", text: "text-[#a1a1aa]" },
  "in-progress": { label: "In Progress", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  "in-review": { label: "In Review", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  "done": { label: "Done", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
}

function exportAuditCSV(auditLog: any[], cardTitle: string) {
  const header = "User,Action,Detail,Date\n"
  const rows = auditLog.map(e => {
    const user = e.user?.name || "Unknown"
    const action = e.action || ""
    const detail = (e.detail || "").replace(/,/g, ";")
    const date = e.createdAt ? new Date(e.createdAt).toISOString() : ""
    return `${user},${action},${detail},${date}`
  }).join("\n")

  const blob = new Blob([header + rows], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `audit-${cardTitle.replace(/\s+/g, "-")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface CardDrawerProps {
  card: Card | null
  onClose: () => void
  onComment?: (cardId: string, text: string) => void
  onApprove?: (cardId: string) => void
  onReject?: (cardId: string, reason: string) => void
  onAttachmentUploaded?: (cardId: string) => void
  onCardUpdated?: (cardId: string, data: any) => void
  readOnly?: boolean
  boardFields?: { _id: string; name: string; type: string; options?: string[] }[]
}

export function CardDrawer({ card, onClose, onComment, onApprove, onReject, onAttachmentUploaded, onCardUpdated, readOnly, boardFields }: CardDrawerProps) {
  const [commentText, setCommentText] = useState("")
  const [uploading, setUploading] = useState(false)
  const [localAttachments, setLocalAttachments] = useState<Card["attachments"]>([])
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isAdmin } = usePermissions()
  const authUser = useAuthStore((s) => s.user)
  const { show } = useToast()

  // Edit state
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriority, setEditPriority] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [localLabels, setLocalLabels] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [sendingComment, setSendingComment] = useState(false)
  const [editCustomFields, setEditCustomFields] = useState<Record<string, any>>({})

  // Sync edit state when card changes
  useEffect(() => {
    if (card) {
      setEditTitle(card.title)
      setEditDescription(card.description || "")
      setEditPriority(card.priority || "medium")
      setEditDueDate(card.dueDate || "")
      setEditing(false)
      setSaveError("")
      setLocalAttachments([])
      setLocalLabels(card.labels || [])
      setNewLabel("")
      setActiveTab("details")
      // Sync custom fields
      const cfMap: Record<string, any> = {}
      ;(card.customFields || []).forEach((cf: any) => {
        cfMap[cf.field] = cf.value
      })
      setEditCustomFields(cfMap)
    }
  }, [card?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!card) return null

  const approvers: string[] = (card as any).approval?.approvers ?? []
  const canApproveCard = isAdmin || approvers.includes(authUser?._id ?? "")

  const priority = getPriority(card.priority)
  const status = statusLabels[card.columnId] || { label: card.columnId, bg: "bg-[#71717a]/15", text: "text-[#71717a]" }

  const handleSendComment = async () => {
    if (!commentText.trim() || sendingComment) return
    setSendingComment(true)
    try {
      if (onComment) onComment(card.id, commentText.trim())
      setCommentText("")
    } finally {
      setSendingComment(false)
    }
  }

  const handleApprove = () => { if (onApprove) onApprove(card.id) }
  const handleReject = () => {
    const reason = window.prompt("Rejection reason:")
    if (reason && onReject) onReject(card.id, reason)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await cardApi.uploadAttachment(card.id, file)
      const newAtt = data.attachment || { _id: Date.now().toString(), name: file.name, size: `${Math.round(file.size / 1024)} KB`, type: file.name.split(".").pop() || "" }
      setLocalAttachments((prev) => [...prev, { id: newAtt._id || newAtt.id, name: newAtt.name, size: newAtt.size || "", type: newAtt.type || "" }])
      if (onAttachmentUploaded) onAttachmentUploaded(card.id)
      show("File uploaded")
    } catch (err) {
      console.error("Upload failed:", err)
      show("Upload failed", "error")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const updates: any = {}
      if (editTitle !== card.title) updates.title = editTitle
      if (editDescription !== (card.description || "")) updates.description = editDescription
      if (editPriority !== card.priority) updates.priority = editPriority
      if (editDueDate !== card.dueDate) updates.dueDate = editDueDate || undefined

      // Include custom fields
      if (boardFields && boardFields.length > 0) {
        const cfArray = Object.entries(editCustomFields).map(([field, value]) => ({ field, value }))
        if (cfArray.length > 0) updates.customFields = cfArray
      }

      if (Object.keys(updates).length > 0) {
        await cardApi.update(card.id, updates)
        if (onCardUpdated) onCardUpdated(card.id, updates)
      }
      setEditing(false)
      show("Changes saved")
    } catch (err: any) {
      const msg = err.message || "Failed to save"
      setSaveError(msg)
      show(msg, "error")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(card.title)
    setEditDescription(card.description || "")
    setEditPriority(card.priority || "medium")
    setEditDueDate(card.dueDate || "")
    setEditing(false)
    setSaveError("")
  }

  const allAttachments = [...(card.attachments || []), ...(localAttachments || [])]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-screen w-[480px] bg-[#09090b] border-l border-[#27272a] z-50 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#27272a]">
          <div className="flex-1 pr-4">
            {editing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-[16px] font-semibold text-[#fafafa] bg-[#0f0f11] border border-[#27272a] rounded-md px-2 py-1 outline-none focus:border-[#3b82f6] mb-1"
              />
            ) : (
              <h2 className="text-[16px] font-semibold text-[#fafafa] leading-snug mb-2">
                {card.title}
              </h2>
            )}
            {card.referenceId && (
              <span className="text-[11px] text-[#52525b]">{card.referenceId}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            {!editing && !readOnly && (
              <button
                onClick={() => setEditing(true)}
                className="h-7 px-2.5 rounded-md text-[11px] text-[#a1a1aa] bg-[#27272a] hover:bg-[#3f3f46] transition-colors"
              >
                Edit
              </button>
            )}
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
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
            <div className="flex -space-x-1">
              {(card.assignees || []).map((assignee) => (
                <div key={assignee.id} className="w-6 h-6 rounded-full bg-[#27272a] border-2 border-[#09090b] flex items-center justify-center" title={assignee.name}>
                  <span className="text-[9px] font-medium text-[#a1a1aa]">{assignee.initials}</span>
                </div>
              ))}
            </div>
          </div>

          {editing ? (
            <>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="h-7 px-2 bg-[#0f0f11] border border-[#27272a] rounded-md text-[11px] text-[#a1a1aa] outline-none focus:border-[#3b82f6]"
              />
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="h-7 px-2 bg-[#0f0f11] border border-[#27272a] rounded-md text-[10px] text-[#a1a1aa] outline-none focus:border-[#3b82f6]"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-[#71717a]">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="text-[11px]">{card.dueDate || "No date"}</span>
              </div>
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`}>
                {priority.label}
              </span>
            </>
          )}

          {card.amount && (
            <span className="text-[12px] font-medium text-[#fafafa] ml-auto">{card.amount}</span>
          )}
        </div>

        {/* Save/Cancel bar when editing */}
        {editing && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#ffffff0a] bg-[#0f0f11]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-7 px-3 rounded-md bg-[#3b82f6] text-[11px] font-medium text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3 h-3" strokeWidth={1.5} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelEdit}
              className="h-7 px-3 rounded-md bg-[#27272a] text-[11px] text-[#a1a1aa] hover:bg-[#3f3f46] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
              Cancel
            </button>
            {saveError && <span className="text-[11px] text-[#ef4444]">{saveError}</span>}
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex border-b border-[#ffffff0a]">
          {(["details", "activity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-[12px] transition-colors relative ${
                activeTab === tab ? "text-[#fafafa]" : "text-[#52525b] hover:text-[#a1a1aa]"
              }`}
            >
              {tab === "details" ? "Details" : "Activity"}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6]" />}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "details" && (
            <>
              {/* Description */}
              <div className="px-4 py-4 border-b border-[#ffffff0a]">
                <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-2">Description</h4>
                {editing ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-[#0f0f11] border border-[#27272a] rounded-md px-3 py-2 text-[13px] text-[#a1a1aa] outline-none focus:border-[#3b82f6] resize-none"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
                    {card.description || "No description provided."}
                  </p>
                )}
              </div>

              {/* Custom Fields */}
              {boardFields && boardFields.length > 0 && (
                <div className="px-4 py-4 border-b border-[#ffffff0a]">
                  <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-2">Custom Fields</h4>
                  <div className="space-y-2.5">
                    {boardFields.map((bf) => {
                      const value = editCustomFields[bf._id] ?? ""
                      if (readOnly) {
                        // Read-only: just show value as text
                        const displayVal = bf.type === "checkbox" ? (value ? "Yes" : "No") : (value || "—")
                        return (
                          <div key={bf._id} className="flex items-center justify-between">
                            <span className="text-[12px] text-[#a1a1aa]">{bf.name}</span>
                            <span className="text-[12px] text-[#fafafa]">{String(displayVal)}</span>
                          </div>
                        )
                      }
                      if (!editing) {
                        // Not editing: show values as read-only display
                        const displayVal = bf.type === "checkbox" ? (value ? "Yes" : "No") : bf.type === "date" && value ? new Date(value).toLocaleDateString() : (value || "—")
                        return (
                          <div key={bf._id} className="flex items-center justify-between">
                            <span className="text-[12px] text-[#a1a1aa]">{bf.name}</span>
                            <span className="text-[12px] text-[#fafafa]">{String(displayVal)}</span>
                          </div>
                        )
                      }
                      // Editing mode: render appropriate input
                      return (
                        <div key={bf._id}>
                          <label className="text-[11px] text-[#a1a1aa] mb-1 block">{bf.name}</label>
                          {bf.type === "text" && (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setEditCustomFields((prev) => ({ ...prev, [bf._id]: e.target.value }))}
                              className="w-full h-7 px-2 bg-[#0f0f11] border border-[#27272a] rounded text-[12px] text-[#fafafa] outline-none focus:border-[#3b82f6] transition-colors"
                            />
                          )}
                          {bf.type === "number" && (
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => setEditCustomFields((prev) => ({ ...prev, [bf._id]: e.target.value }))}
                              className="w-full h-7 px-2 bg-[#0f0f11] border border-[#27272a] rounded text-[12px] text-[#fafafa] outline-none focus:border-[#3b82f6] transition-colors"
                            />
                          )}
                          {bf.type === "date" && (
                            <input
                              type="date"
                              value={value}
                              onChange={(e) => setEditCustomFields((prev) => ({ ...prev, [bf._id]: e.target.value }))}
                              className="w-full h-7 px-2 bg-[#0f0f11] border border-[#27272a] rounded text-[12px] text-[#a1a1aa] outline-none focus:border-[#3b82f6] transition-colors"
                            />
                          )}
                          {bf.type === "checkbox" && (
                            <button
                              onClick={() => setEditCustomFields((prev) => ({ ...prev, [bf._id]: !prev[bf._id] }))}
                              className={`w-8 h-4 rounded-full relative transition-colors ${
                                value ? "bg-[#3b82f6]" : "bg-[#27272a]"
                              }`}
                            >
                              <div
                                className={`absolute top-0.5 w-3 h-3 rounded-full bg-[#fafafa] transition-transform ${
                                  value ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          )}
                          {bf.type === "dropdown" && (
                            <select
                              value={value}
                              onChange={(e) => setEditCustomFields((prev) => ({ ...prev, [bf._id]: e.target.value }))}
                              className="w-full h-7 px-2 bg-[#0f0f11] border border-[#27272a] rounded text-[12px] text-[#a1a1aa] outline-none focus:border-[#3b82f6] transition-colors"
                            >
                              <option value="">Select...</option>
                              {(bf.options || []).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Labels */}
              <div className="px-4 py-4 border-b border-[#ffffff0a]">
                <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-2">Labels</h4>
                {localLabels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {localLabels.map((label, idx) => {
                      const colors = [
                        { bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
                        { bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
                        { bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
                        { bg: "bg-[#8b5cf6]/15", text: "text-[#8b5cf6]" },
                      ]
                      const color = colors[idx % 4]
                      return (
                        <span
                          key={label}
                          className={`inline-flex items-center gap-1 h-5 px-2 rounded text-[10px] font-medium ${color.bg} ${color.text}`}
                        >
                          {label}
                          <button
                            onClick={async () => {
                              const updated = localLabels.filter(l => l !== label)
                              setLocalLabels(updated)
                              try {
                                await cardApi.update(card.id, { labels: updated })
                                if (onCardUpdated) onCardUpdated(card.id, { labels: updated })
                              } catch {}
                            }}
                            className="ml-0.5 hover:opacity-70 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5" strokeWidth={2} />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && newLabel.trim()) {
                      const updated = [...localLabels, newLabel.trim()]
                      setLocalLabels(updated)
                      setNewLabel("")
                      try {
                        await cardApi.update(card.id, { labels: updated })
                        if (onCardUpdated) onCardUpdated(card.id, { labels: updated })
                      } catch {}
                    }
                  }}
                  placeholder="Add label + Enter"
                  className="w-full h-7 px-2 bg-[#0f0f11] border border-[#27272a] rounded text-[11px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>

              {/* Attachments */}
              <div className="px-4 py-4 border-b border-[#ffffff0a]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider">Attachments</h4>
                  {!readOnly && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1 h-6 px-2 rounded bg-[#27272a] text-[10px] font-medium text-[#a1a1aa] hover:bg-[#3f3f46] transition-colors disabled:opacity-40"
                    >
                      <Upload className="w-3 h-3" strokeWidth={1.5} />
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
                </div>
                {allAttachments.length > 0 ? (
                  <div className="space-y-1">
                    {allAttachments.map((file) => (
                      <AttachmentItem key={file.id} file={file} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#52525b]">No attachments yet</p>
                )}
              </div>

              {/* Comments */}
              <div className="px-4 py-4 border-b border-[#ffffff0a]">
                <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">
                  Comments ({(card.comments || []).length})
                </h4>
                {(card.comments || []).length > 0 ? (
                  <div className="space-y-3">
                    {(card.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-medium text-[#a1a1aa]">{comment.author.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[12px] font-medium text-[#fafafa]">{comment.author.name}</span>
                            <span className="text-[10px] text-[#3f3f46]">{comment.createdAt}</span>
                          </div>
                          <p className="text-[12px] text-[#a1a1aa] leading-snug">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#52525b]">No comments yet</p>
                )}
                {!readOnly && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendComment() }}
                      placeholder="Write a comment..."
                      className="flex-1 h-8 px-3 rounded-[6px] bg-[#0f0f11] border border-[#27272a] text-[12px] text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#3f3f46] transition-colors"
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={!commentText.trim() || sendingComment}
                      className="h-8 w-8 flex items-center justify-center rounded-[6px] bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] disabled:opacity-40 transition-colors"
                    >
                      <Send className={`w-3.5 h-3.5 ${sendingComment ? "animate-pulse" : ""}`} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>

              {/* Approval */}
              {canApproveCard && !readOnly && (
                <div className="px-4 py-4">
                  <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">Approval</h4>
                  <div className="flex items-center gap-2">
                    <button onClick={handleApprove} className="h-8 px-4 rounded-[6px] bg-[#22c55e] text-[12px] font-medium text-white hover:bg-[#16a34a] transition-colors">Approve</button>
                    <button onClick={handleReject} className="h-8 px-4 rounded-[6px] bg-[#27272a] text-[12px] font-medium text-[#ef4444] hover:bg-[#ef4444]/15 border border-[#27272a] hover:border-[#ef4444]/30 transition-colors">Reject</button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "activity" && (
            <div className="px-4 py-4">
              {((card as any).auditLog ?? []).length > 0 && (
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider">Audit Trail</h4>
                  <button
                    onClick={() => exportAuditCSV((card as any).auditLog ?? [], card.title)}
                    className="flex items-center gap-1 h-6 px-2 rounded bg-[#27272a] text-[10px] font-medium text-[#a1a1aa] hover:bg-[#3f3f46] transition-colors"
                  >
                    <Download className="w-3 h-3" strokeWidth={1.5} />
                    Export
                  </button>
                </div>
              )}
              {((card as any).auditLog ?? []).length > 0 ? (
                <div>
                  {((card as any).auditLog as AuditLogEntry[]).map((entry, idx, arr) => (
                    <div key={entry._id}>
                      <div className="flex gap-2.5 py-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-medium text-[#a1a1aa]">
                            {(entry.user?.name ?? "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] leading-snug">
                            <span className="font-medium text-[#e4e4e7]">{entry.user?.name ?? "Unknown"}</span>{" "}
                            <span className="text-[#52525b]">{entry.action}</span>
                            {entry.detail && <span className="text-[#71717a]"> &mdash; {entry.detail}</span>}
                          </p>
                          <p className="text-[10px] text-[#3f3f46] mt-0.5">{formatRelativeTime(entry.createdAt)}</p>
                        </div>
                      </div>
                      {idx < arr.length - 1 && <div className="border-b border-[#ffffff08]" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#52525b] text-center py-8">No activity yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ── Attachment Item with Image Preview ── */
const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg)$/i

function AttachmentItem({ file }: { file: { id: string; name: string; size: string; type: string; url?: string } }) {
  const [imgError, setImgError] = useState(false)
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
  const fileUrl = file.url ? `${BASE_URL}${file.url}` : undefined
  const isImage = fileUrl && IMAGE_EXTS.test(file.url || file.name) && !imgError

  const content = (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#0f0f11] border border-[#27272a] hover:border-[#3f3f46] transition-colors cursor-pointer">
      {isImage ? (
        <img
          src={fileUrl}
          alt={file.name}
          onError={() => setImgError(true)}
          className="w-10 h-10 rounded-md object-cover shrink-0 bg-[#27272a]"
        />
      ) : (
        <FileText className="w-4 h-4 text-[#52525b] shrink-0" strokeWidth={1.5} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#fafafa] truncate">{file.name}</p>
        {file.size && <p className="text-[10px] text-[#52525b]">{file.size}</p>}
      </div>
      <Paperclip className="w-3.5 h-3.5 text-[#3f3f46] shrink-0" strokeWidth={1.5} />
    </div>
  )

  return fileUrl ? (
    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    <div>{content}</div>
  )
}
