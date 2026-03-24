"use client";
import { useState } from "react";
import { useRef } from "react";
import { X, Calendar, User, Tag, ShieldCheck, Clock, Send, MoreHorizontal, CheckCircle2, XCircle, Loader2, Paperclip, FileText, Image, File, Download, Trash2, Upload } from "lucide-react";
import { PRIORITY_CONFIG } from "@/lib/utils";
import { cardApi } from "@/lib/api";
import { useBoardStore } from "@/store/board.store";
import { format } from "date-fns";
import type { Board, Card, Comment } from "@/types";

const S = {
  sectionLabel: {
    fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase" as const,
    letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
  },
};

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

export function CardDetailDrawer({ card, board, onClose }: CardDetailDrawerProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(card.comments ?? []);
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAttachment, deleteAttachment } = useBoardStore();
  const priority = PRIORITY_CONFIG[card.priority];

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
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        zIndex: 40, backdropFilter: "blur(2px)",
        animation: "fadeIn 0.15s ease-out",
      }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", right: 0, top: 0, height: "100%", width: 440,
        background: "#0A0A0A", borderLeft: "1px solid #1E1E1E",
        zIndex: 50, display: "flex", flexDirection: "column",
        animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "-40px 0 80px rgba(0,0,0,0.7)",
      }}>

        {/* Header */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #1E1E1E" }}>

          {/* Top row: priority strip + close */}
          {card.priority !== "none" && (
            <div style={{
              height: 3, borderRadius: 3, marginBottom: 14,
              background: `linear-gradient(90deg, ${priority.color}90, ${priority.color}20, transparent)`,
            }} />
          )}

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <h2 style={{
              flex: 1, fontSize: 15, fontWeight: 600, color: "#EBEBEB",
              lineHeight: 1.45, letterSpacing: "-0.015em",
            }}>
              {card.title}
            </h2>
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              <button style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "#444" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#888"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
              >
                <MoreHorizontal size={14} />
              </button>
              <button onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "#444" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#F3F3F3"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
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

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1E1E1E", flexShrink: 0 }}>
          {(["details", "activity"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 600,
              background: "transparent", border: "none", cursor: "pointer",
              borderBottom: tab === t ? "2px solid #0454FC" : "2px solid transparent",
              color: tab === t ? "#0454FC" : "#555",
              textTransform: "capitalize", letterSpacing: "0.02em",
              transition: "color 0.12s",
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
          {tab === "details" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Description */}
              {card.description ? (
                <div>
                  <div style={S.sectionLabel}>Description</div>
                  <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65 }}>{card.description}</p>
                </div>
              ) : (
                <div style={{ padding: "12px 0" }}>
                  <p style={{ fontSize: 13, color: "#333", fontStyle: "italic" }}>No description — click to add</p>
                </div>
              )}

              <Divider />

              {/* Assignees + Due date grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <Field label="Assignees" icon={<User size={10} />}>
                  {(card.assignees?.length ?? 0) > 0
                    ? card.assignees.map(u => (
                        <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            background: `hsl(${(u.name.charCodeAt(0) * 37) % 360}, 50%, 35%)`,
                            fontSize: 9, fontWeight: 700, color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>{u.name[0].toUpperCase()}</div>
                          <span style={{ fontSize: 13, color: "#888" }}>{u.name}</span>
                        </div>
                      ))
                    : <p style={{ fontSize: 13, color: "#333" }}>Unassigned</p>
                  }
                </Field>

                <Field label="Due Date" icon={<Calendar size={10} />}>
                  {card.dueDate
                    ? <span style={{ fontSize: 13, color: "#888", fontFamily: "monospace" }}>
                        {format(new Date(card.dueDate), "MMM d, yyyy")}
                      </span>
                    : <p style={{ fontSize: 13, color: "#333" }}>Not set</p>
                  }
                </Field>
              </div>

              {/* Labels */}
              {(card.labels?.length ?? 0) > 0 && (
                <div>
                  <div style={S.sectionLabel}><Tag size={10} /> Labels</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {card.labels.map(l => (
                      <span key={l} style={{ padding: "3px 9px", borderRadius: 6, background: "#161616", border: "1px solid #222", fontSize: 12, color: "#777" }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div>
                <div style={{ ...S.sectionLabel, justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Paperclip size={10} /> Attachments ({card.attachments?.length || 0})</span>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600,
                    color: "#0454FC", background: "none", border: "none", cursor: "pointer",
                  }}>
                    {uploading ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {card.attachments.map(att => (
                      <div key={att._id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 10px", background: "#111", borderRadius: 8,
                        border: "1px solid #1A1A1A",
                      }}>
                        {/* Thumbnail or icon */}
                        {isImage(att.name) ? (
                          <div style={{
                            width: 36, height: 36, borderRadius: 6, overflow: "hidden",
                            background: "#1A1A1A", flexShrink: 0,
                          }}>
                            <img src={`${API_URL}${att.url}`} alt={att.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                            background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#555",
                          }}>
                            {getFileIcon(att.name)}
                          </div>
                        )}

                        {/* Name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: "#D0D0D0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {att.name}
                          </div>
                          {att.uploadedBy && (
                            <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
                              by {typeof att.uploadedBy === "object" ? att.uploadedBy.name : "Unknown"}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <a href={`${API_URL}${att.url}`} target="_blank" rel="noopener noreferrer" download style={{
                          width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#555", background: "transparent", textDecoration: "none",
                          transition: "background 0.1s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#1A1A1A"; e.currentTarget.style.color = "#888"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; }}
                        >
                          <Download size={12} />
                        </a>
                        <button onClick={() => deleteAttachment(card._id, att._id)} style={{
                          width: 26, height: 26, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#555", background: "transparent", border: "none", cursor: "pointer",
                          transition: "background 0.1s, color 0.1s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,68,68,0.08)"; e.currentTarget.style.color = "#FF4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#333", fontStyle: "italic" }}>No attachments yet</p>
                )}
              </div>

              {/* Custom fields */}
              {(board.customFields?.length ?? 0) > 0 && (
                <div>
                  <Divider />
                  <div style={{ ...S.sectionLabel, marginBottom: 10 }}>Custom Fields</div>
                  {board.customFields.map(field => {
                    const val = card.customFields?.find(f => f.field === field._id)?.value;
                    return (
                      <div key={field._id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "9px 0", borderBottom: "1px solid #161616",
                      }}>
                        <span style={{ fontSize: 13, color: "#555" }}>{field.name}</span>
                        <span style={{ fontSize: 13, color: val != null ? "#EBEBEB" : "#333", fontFamily: "monospace" }}>
                          {val != null ? String(val) : "—"}
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
                  <div style={{
                    borderRadius: 10, padding: 14,
                    background: card.approval.status === "approved" ? "rgba(0,229,160,0.04)"
                      : card.approval.status === "rejected" ? "rgba(255,68,68,0.04)"
                      : "rgba(245,166,35,0.04)",
                    border: `1px solid ${card.approval.status === "approved" ? "rgba(0,229,160,0.15)"
                      : card.approval.status === "rejected" ? "rgba(255,68,68,0.15)"
                      : "rgba(245,166,35,0.15)"}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#EBEBEB", marginBottom: 6 }}>Approval Required</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Approvers: {card.approval.approvers?.map(a => a.name).join(", ") || "None set"}
                    </div>
                    {card.approval.rejectionReason && (
                      <div style={{ fontSize: 12, color: "#FF4444", marginTop: 6 }}>{card.approval.rejectionReason}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Activity */
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {localComments.map(c => (
                <div key={c._id} style={{ display: "flex", gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    background: `hsl(${(c.author?.name?.charCodeAt(0) ?? 0) * 37 % 360}, 50%, 35%)`,
                    fontSize: 10, fontWeight: 700, color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {c.author?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#D0D0D0" }}>{c.author?.name}</span>
                      <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>
                        {format(new Date(c.createdAt), "MMM d · HH:mm")}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "#888", lineHeight: 1.55, background: "#111", borderRadius: 8, padding: "8px 10px", border: "1px solid #1E1E1E" }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* Audit entries */}
              {card.auditLog?.map(entry => (
                <div key={entry._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
                  <div style={{ width: 26, display: "flex", justifyContent: "center" }}>
                    <Clock size={11} color="#333" />
                  </div>
                  <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>
                    {format(new Date(entry.createdAt), "MMM d · HH:mm")}
                  </span>
                  <span style={{ fontSize: 12, color: "#444" }}>
                    <span style={{ color: "#666" }}>{entry.user?.name}</span> {entry.action}
                    {entry.detail && <span style={{ color: "#3A3A3A" }}> — {entry.detail}</span>}
                  </span>
                </div>
              ))}

              {!localComments.length && !card.auditLog?.length && (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#333" }}>No activity yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment box */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1E1E1E", background: "#0A0A0A" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..." rows={2}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCommentSubmit(); }}
              style={{
                flex: 1, background: "#111111", border: "1px solid #222222",
                borderRadius: 8, padding: "8px 12px", fontSize: 13,
                color: "#F3F3F3", outline: "none", resize: "none", fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              className="placeholder:text-[#333] input-field"
            />
            <button onClick={handleCommentSubmit} disabled={!comment.trim() || submitting} style={{
              width: 36, height: 36, borderRadius: 9, border: "none", flexShrink: 0,
              background: comment.trim() && !submitting ? "#0454FC" : "#161616",
              color: comment.trim() && !submitting ? "white" : "#333",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: comment.trim() && !submitting ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (comment.trim() && !submitting) e.currentTarget.style.background = "#3B7BFF"; }}
              onMouseLeave={e => { if (comment.trim() && !submitting) e.currentTarget.style.background = "#0454FC"; }}
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────
function Chip({ color, bg, label, icon }: { color: string; bg: string; label: string; icon?: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: bg, fontSize: 11, fontWeight: 500, color }}>
      {icon}{label}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#161616" }} />;
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        {icon} {label}
      </div>
      {children}
    </div>
  );
}
