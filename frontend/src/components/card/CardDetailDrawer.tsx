"use client";
import { useState, useRef, Fragment } from "react";
import {
  X, Calendar, User, Tag, ShieldCheck, Clock, Send, CheckCircle2,
  XCircle, Loader2, Paperclip, FileText, Image, File, Download,
  Trash2, Upload, Archive, MoreHorizontal,
} from "lucide-react";
import { cn, PRIORITY_CONFIG } from "@/lib/utils";
import { cardApi } from "@/lib/api";
import { useBoardStore } from "@/store/board.store";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Board, Card, Comment } from "@/types";

interface CardDetailDrawerProps {
  card: Card; board: Board; onClose: () => void; canEdit: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
function getFileExt(name: string) { return name.split(".").pop()?.toLowerCase() || ""; }
function isImage(name: string) { return IMAGE_EXTS.has(getFileExt(name)); }
function getFileIcon(name: string) {
  if (isImage(name)) return <Image size={14} />;
  const ext = getFileExt(name);
  if (["pdf", "doc", "docx", "txt", "csv", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return <FileText size={14} />;
  return <File size={14} />;
}

/** Render inline `code` blocks inside comment text */
function renderCommentText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded text-[12px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function CardDetailDrawer({ card, board, onClose }: CardDetailDrawerProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(card.comments ?? []);
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState(card.description ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAttachment, deleteAttachment } = useBoardStore();
  const priority = PRIORITY_CONFIG[card.priority];
  const taskId = `ERP-${card._id.slice(-4).toUpperCase()}`;

  const handleCommentSubmit = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const { comments } = await cardApi.comment(card._id, comment.trim());
      setLocalComments(comments);
      setComment("");
    } catch {
      // keep comment text on failure
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose} variant="drawer-right" width="480px">
      <div className="flex flex-col h-full">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          {/* Priority strip */}
          {card.priority !== "none" && (
            <div
              className="h-[3px] rounded-sm mb-3.5"
              style={{ background: `linear-gradient(90deg, ${priority.color}90, ${priority.color}20, transparent)` }}
            />
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h2 className="text-[18px] font-bold text-text-primary leading-tight tracking-tight truncate">
                  {card.title}
                </h2>
                <p className="text-[13px] text-text-muted mt-0.5">{taskId}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors">
                <MoreHorizontal size={16} />
              </button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {card.priority !== "none" && (
              <Chip color={priority.color} bg={priority.bg} label={priority.label} />
            )}
            {card.isComplianceTagged && (
              <Chip color="#F5A623" bg="rgba(245,166,35,0.1)" label="Compliance" icon={<ShieldCheck size={9} />} />
            )}
            {card.approval?.required && (
              <Chip
                color={card.approval.status === "approved" ? "#00E5A0" : card.approval.status === "rejected" ? "#FF4444" : "#F5A623"}
                bg={card.approval.status === "approved" ? "rgba(0,229,160,0.1)" : card.approval.status === "rejected" ? "rgba(255,68,68,0.1)" : "rgba(245,166,35,0.1)"}
                label={card.approval.status === "approved" ? "Approved" : card.approval.status === "rejected" ? "Rejected" : "Pending Approval"}
                icon={card.approval.status === "approved" ? <CheckCircle2 size={9} /> : card.approval.status === "rejected" ? <XCircle size={9} /> : undefined}
              />
            )}
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-border shrink-0">
          {(["details", "activity"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2.5 text-[13px] font-semibold bg-transparent border-none cursor-pointer capitalize tracking-[0.02em] transition-colors",
                tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "border-b-2 border-transparent text-text-muted hover:text-text-secondary"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === "details" ? (
            <div className="flex flex-col gap-6">

              {/* Assignee + Due Date row */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <SectionLabel icon={<User size={10} />}>Assignee</SectionLabel>
                  {(card.assignees?.length ?? 0) > 0 ? (
                    card.assignees.map(u => (
                      <div key={u._id} className="inline-flex items-center gap-2 bg-bg-elevated rounded-full px-3 py-1.5 mb-1.5 mr-1.5">
                        <Avatar name={u.name} size="xs" />
                        <span className="text-[13px] text-text-primary font-medium">{u.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[13px] text-text-muted">Unassigned</p>
                  )}
                </div>

                <div>
                  <SectionLabel icon={<Calendar size={10} />}>Due Date</SectionLabel>
                  {card.dueDate ? (
                    <div className="inline-flex items-center gap-2 bg-bg-elevated rounded-full px-3 py-1.5">
                      <Calendar size={13} className="text-text-muted" />
                      <span className="text-[13px] text-text-primary font-medium">
                        {format(new Date(card.dueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[13px] text-text-muted">Not set</p>
                  )}
                </div>
              </div>

              <Divider />

              {/* Description */}
              <div>
                <SectionLabel>Description</SectionLabel>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={4}
                  className="w-full bg-black/5 dark:bg-white/10 border border-transparent rounded-xl px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted resize-none outline-none transition-all duration-200 focus:bg-bg-surface focus:border-primary focus:ring-[3px] focus:ring-primary/20"
                />
              </div>

              <Divider />

              {/* Labels */}
              {(card.labels?.length ?? 0) > 0 && (
                <>
                  <div>
                    <SectionLabel icon={<Tag size={10} />}>Labels</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {card.labels.map(l => (
                        <span key={l} className="px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-subtle text-[12px] text-text-secondary font-medium">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Divider />
                </>
              )}

              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <SectionLabel icon={<Paperclip size={10} />} className="mb-0">
                    Attachments ({card.attachments?.length || 0})
                  </SectionLabel>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-transparent border-none cursor-pointer hover:text-primary-light transition-colors"
                  >
                    {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  <input
                    ref={fileInputRef} type="file" hidden
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.svg,.webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try { await uploadAttachment(card._id, file); } catch { /* ignore */ }
                      finally { setUploading(false); e.target.value = ""; }
                    }}
                  />
                </div>

                {(card.attachments?.length ?? 0) > 0 ? (
                  <div className="flex flex-col gap-2">
                    {card.attachments.map(att => (
                      <div key={att._id} className="flex items-center gap-3 p-2.5 bg-bg-elevated rounded-xl border border-border-subtle">
                        {isImage(att.name) ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-bg-overlay shrink-0">
                            <img src={`${API_URL}${att.url}`} alt={att.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg shrink-0 bg-bg-overlay flex items-center justify-center text-text-muted">
                            {getFileIcon(att.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-text-primary font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                            {att.name}
                          </div>
                          {att.uploadedBy && (
                            <div className="text-[11px] text-text-muted mt-0.5">
                              by {typeof att.uploadedBy === "object" ? att.uploadedBy.name : "Unknown"}
                            </div>
                          )}
                        </div>
                        <a
                          href={`${API_URL}${att.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted bg-transparent no-underline hover:bg-bg-overlay hover:text-text-secondary transition-colors"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          onClick={() => deleteAttachment(card._id, att._id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted bg-transparent border-none cursor-pointer hover:bg-danger/10 hover:text-danger transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-text-muted italic">No attachments yet</p>
                )}
              </div>

              {/* Custom fields */}
              {(board.customFields?.length ?? 0) > 0 && (
                <div>
                  <Divider />
                  <SectionLabel className="mb-2.5 mt-5">Custom Fields</SectionLabel>
                  {board.customFields.map(field => {
                    const val = card.customFields?.find(f => f.field === field._id)?.value;
                    return (
                      <div key={field._id} className="flex items-center justify-between py-2.5 border-b border-border-subtle">
                        <span className="text-[13px] text-text-muted">{field.name}</span>
                        <span className={cn("text-[13px] font-mono", val != null ? "text-text-primary" : "text-text-muted")}>
                          {val != null ? String(val) : "\u2014"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Approval block */}
              {card.approval?.required && (
                <>
                  <Divider />
                  <div
                    className="rounded-xl p-4 border"
                    style={{
                      background: card.approval.status === "approved" ? "rgba(0,229,160,0.04)"
                        : card.approval.status === "rejected" ? "rgba(255,68,68,0.04)"
                        : "rgba(245,166,35,0.04)",
                      borderColor: card.approval.status === "approved" ? "rgba(0,229,160,0.15)"
                        : card.approval.status === "rejected" ? "rgba(255,68,68,0.15)"
                        : "rgba(245,166,35,0.15)",
                    }}
                  >
                    <div className="text-[13px] font-semibold text-text-primary mb-1.5">Approval Required</div>
                    <div className="text-[13px] text-text-secondary">
                      Approvers: {card.approval.approvers?.map(a => a.name).join(", ") || "None set"}
                    </div>
                    {card.approval.rejectionReason && (
                      <div className="text-[13px] text-danger mt-1.5">{card.approval.rejectionReason}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── Activity ──────────────────────────────────────────────── */
            <div className="flex flex-col gap-4">
              {localComments.map(c => (
                <div key={c._id} className="flex gap-3">
                  <Avatar name={c.author?.name ?? "?"} size="md" className="mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-semibold text-text-primary">{c.author?.name}</span>
                      <span className="text-[11px] text-text-muted font-mono">
                        {format(new Date(c.createdAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                    <div className="text-[13px] text-text-secondary leading-[1.6] bg-bg-elevated rounded-xl p-4 border border-border-subtle">
                      {renderCommentText(c.text)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Audit entries */}
              {card.auditLog?.map(entry => (
                <div key={entry._id} className="flex items-center gap-2.5 py-1">
                  <div className="w-7 flex justify-center shrink-0">
                    <Clock size={12} className="text-text-muted" />
                  </div>
                  <span className="text-[11px] text-text-muted font-mono shrink-0">
                    {format(new Date(entry.createdAt), "MMM d, HH:mm")}
                  </span>
                  <span className="text-[12px] text-text-muted">
                    <span className="text-text-secondary font-medium">{entry.user?.name}</span> {entry.action}
                    {entry.detail && <span className="text-text-muted"> &mdash; {entry.detail}</span>}
                  </span>
                </div>
              ))}

              {!localComments.length && !card.auditLog?.length && (
                <div className="py-12 text-center">
                  <Clock size={24} className="text-text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-[13px] text-text-muted">No activity yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Comment input ───────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-border bg-bg-base">
          <div className="flex gap-2.5 items-center">
            <Avatar name="You" size="sm" className="shrink-0" />
            <div className="flex-1 flex items-center gap-2 bg-bg-surface border border-border rounded-full px-4 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-150">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment..."
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCommentSubmit(); }}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-text-primary placeholder:text-text-muted"
              />
            </div>
            <button
              onClick={handleCommentSubmit}
              disabled={!comment.trim() || submitting}
              className={cn(
                "w-8 h-8 rounded-full border-none shrink-0 flex items-center justify-center transition-all duration-150",
                comment.trim() && !submitting
                  ? "bg-primary text-white cursor-pointer hover:bg-primary-light"
                  : "bg-bg-elevated text-text-muted cursor-not-allowed"
              )}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>

        {/* ── Footer bar ──────────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-border bg-bg-surface flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Archive size={14} />
            Archive
          </Button>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-danger bg-transparent border-none cursor-pointer hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
          <div className="flex-1" />
          <Button variant="primary" size="sm">
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────
function Chip({ color, bg, label, icon }: { color: string; bg: string; label: string; icon?: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{ color, background: bg }}
    >
      {icon}{label}
    </span>
  );
}

function Divider() {
  return <div className="h-px bg-border-subtle" />;
}
