"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Paperclip, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { PRIORITY_CONFIG } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/Avatar";
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
        borderLeft: `3px solid ${card.isComplianceTagged ? "#F5A623" : dotColor === "transparent" ? "#222222" : dotColor}`,
      }}
      className={cn(
        "relative rounded-[10px] bg-bg-surface border border-border-subtle",
        "py-[11px] px-3 cursor-grab select-none card-hover",
        (isSortable || isDragging) ? "opacity-35" : "opacity-100"
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {/* Top row: title + approval dot */}
      <div className="flex items-start gap-1.5 mb-[7px]">
        <p className="flex-1 text-[13px] font-medium text-text-primary leading-[1.45] tracking-tight">
          {card.title}
        </p>
        {card.approval?.required && card.approval.status === "pending" && (
          <span
            title="Awaiting approval"
            className="shrink-0 mt-0.5 w-[7px] h-[7px] rounded-full bg-warning animate-pulse-dot"
          />
        )}
        {isApproved && (
          <CheckCircle2 size={13} className="text-success shrink-0 mt-0.5" />
        )}
      </div>

      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 3).map(label => (
            <span
              key={label}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-bg-elevated text-text-muted border border-border-subtle"
            >
              {label}
            </span>
          ))}
          {card.labels.length > 3 && (
            <span className="px-[5px] py-0.5 text-[10px] text-text-muted">
              +{card.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Left: due date + compliance */}
        <div className="flex items-center gap-2">
          {dueDateLabel && (
            <span
              className={cn(
                "flex items-center gap-[3px] text-[11px]",
                (isOverdue || isDueToday) ? "font-medium" : "font-normal"
              )}
              style={{ color: dueDateColor }}
            >
              {isOverdue
                ? <Clock size={10} />
                : <Calendar size={10} />}
              {dueDateLabel}
            </span>
          )}
          {card.isComplianceTagged && (
            <span title="Compliance-tagged" className="flex items-center gap-0.5 text-[10px] text-warning">
              <ShieldCheck size={10} /> Compliance
            </span>
          )}
        </div>

        {/* Right: meta + avatars */}
        <div className="flex items-center gap-[7px]">
          {(card.comments?.length ?? 0) > 0 && (
            <span className="flex items-center gap-[3px] text-[11px] text-text-muted">
              <MessageSquare size={10} />
              {card.comments.length}
            </span>
          )}
          {(card.attachments?.length ?? 0) > 0 && (
            <span className="flex items-center gap-[3px] text-[11px] text-text-muted">
              <Paperclip size={10} />
              {card.attachments!.length}
            </span>
          )}
          {(card.assignees?.length ?? 0) > 0 && (
            <AvatarGroup users={card.assignees} max={3} size="xs" />
          )}
        </div>
      </div>

      {/* Priority micro-indicator strip at top */}
      {card.priority !== "none" && !card.isComplianceTagged && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[10px]"
          style={{ background: `linear-gradient(90deg, ${dotColor}60, transparent)` }}
        />
      )}
    </div>
  );
}
