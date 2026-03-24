"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Paperclip, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { PRIORITY_CONFIG } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import type { Card } from "@/types";

interface KanbanCardProps {
  card: Card;
  onClick?: () => void;
  isDragging?: boolean;
}

const PRIORITY_DOT: Record<string, string> = {
  urgent: "#FF4444",
  high:   "#F5A623",
  medium: "#0454FC",
  low:    "#444444",
  none:   "transparent",
};

export function KanbanCard({ card, onClick, isDragging }: KanbanCardProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging: isSortable,
  } = useSortable({ id: card._id });

  const priority  = PRIORITY_CONFIG[card.priority];
  const dotColor  = PRIORITY_DOT[card.priority];
  const isOverdue  = card.dueDate && isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate));
  const isDueToday = card.dueDate && isToday(new Date(card.dueDate));
  const isDueTomorrow = card.dueDate && isTomorrow(new Date(card.dueDate));
  const isApproved = card.approval?.status === "approved";

  const dueDateColor = isOverdue   ? "#FF4444"
                     : isDueToday  ? "#F5A623"
                     : isDueTomorrow ? "#F5A623"
                     : "#444444";

  const dueDateLabel = isOverdue    ? "Overdue"
                     : isDueToday   ? "Today"
                     : isDueTomorrow ? "Tomorrow"
                     : card.dueDate  ? format(new Date(card.dueDate), "MMM d")
                     : null;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: (isSortable || isDragging) ? 0.35 : 1,
        position: "relative",
        borderRadius: 10,
        background: "#0F0F0F",
        border: "1px solid #222222",
        borderLeft: `3px solid ${card.isComplianceTagged ? "#F5A623" : dotColor === "transparent" ? "#222222" : dotColor}`,
        padding: "11px 12px 10px",
        cursor: "grab",
        userSelect: "none",
      }}
      className="card-hover"
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {/* Top row: title + approval dot */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 7 }}>
        <p style={{
          flex: 1, fontSize: 13, fontWeight: 500, color: "#EBEBEB",
          lineHeight: 1.45, letterSpacing: "-0.01em",
        }}>
          {card.title}
        </p>
        {card.approval?.required && card.approval.status === "pending" && (
          <span title="Awaiting approval" style={{
            flexShrink: 0, marginTop: 2,
            width: 7, height: 7, borderRadius: "50%",
            background: "#F5A623",
            animation: "pulseDot 1.8s ease-in-out infinite",
          }} />
        )}
        {isApproved && (
          <CheckCircle2 size={13} color="#00E5A0" style={{ flexShrink: 0, marginTop: 2 }} />
        )}
      </div>

      {/* Labels */}
      {card.labels.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {card.labels.slice(0, 3).map(label => (
            <span key={label} style={{
              padding: "2px 7px", borderRadius: 4,
              fontSize: 10, fontWeight: 500,
              background: "#1C1C1C", color: "#666666",
              border: "1px solid #2A2A2A",
            }}>
              {label}
            </span>
          ))}
          {card.labels.length > 3 && (
            <span style={{ padding: "2px 5px", fontSize: 10, color: "#444444" }}>
              +{card.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: due date + compliance */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {dueDateLabel && (
            <span style={{
              display: "flex", alignItems: "center", gap: 3,
              fontSize: 11, color: dueDateColor, fontWeight: isOverdue || isDueToday ? 500 : 400,
            }}>
              {isOverdue
                ? <Clock size={10} />
                : <Calendar size={10} />}
              {dueDateLabel}
            </span>
          )}
          {card.isComplianceTagged && (
            <span title="Compliance-tagged" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: "#F5A623" }}>
              <ShieldCheck size={10} /> Compliance
            </span>
          )}
        </div>

        {/* Right: meta + avatars */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {(card.comments?.length ?? 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#444444" }}>
              <MessageSquare size={10} />
              {card.comments.length}
            </span>
          )}
          {(card.attachments?.length ?? 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#444444" }}>
              <Paperclip size={10} />
              {card.attachments!.length}
            </span>
          )}
          {(card.assignees?.length ?? 0) > 0 && (
            <div style={{ display: "flex", marginLeft: 2 }}>
              {card.assignees.slice(0, 3).map((user, i) => (
                <div key={user._id} title={user.name} style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: `hsl(${(user.name.charCodeAt(0) * 37) % 360}, 55%, 40%)`,
                  border: "2px solid #0F0F0F",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, color: "white",
                  marginLeft: i > 0 ? -6 : 0,
                  zIndex: 3 - i,
                  position: "relative",
                }}>
                  {user.name[0].toUpperCase()}
                </div>
              ))}
              {card.assignees.length > 3 && (
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#1A1A1A", border: "2px solid #0F0F0F",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, color: "#666", marginLeft: -6, position: "relative",
                }}>
                  +{card.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Priority micro-indicator strip at top */}
      {card.priority !== "none" && !card.isComplianceTagged && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          borderRadius: "10px 10px 0 0",
          background: `linear-gradient(90deg, ${dotColor}60, transparent)`,
        }} />
      )}
    </div>
  );
}
