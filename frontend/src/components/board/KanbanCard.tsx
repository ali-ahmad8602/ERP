"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Paperclip, Clock } from "lucide-react";
import { PRIORITY_CONFIG } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/Avatar";
import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";
import type { Card } from "@/types";

interface KanbanCardProps {
  card: Card;
  onClick?: () => void;
  isDragging?: boolean;
}

const PRIORITY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: "bg-[#8B0000]",       text: "text-white",       label: "URGENT" },
  high:   { bg: "bg-[#FF3B30]",       text: "text-white",       label: "HIGH" },
  medium: { bg: "bg-[#FF9500]",       text: "text-white",       label: "MEDIUM" },
  low:    { bg: "bg-black/[0.06] dark:bg-white/[0.1]", text: "text-text-secondary", label: "LOW" },
};

const LABEL_COLORS: Record<string, string> = {
  devops:     "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  frontend:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  backend:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  security:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  design:     "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  qa:         "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  mobile:     "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  infra:      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  compliance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

function getLabelColor(label: string) {
  return LABEL_COLORS[label.toLowerCase()] ?? "bg-black/[0.04] dark:bg-white/[0.06] text-text-secondary";
}

function formatDueDate(dueDate: string): { label: string; color: string; icon: typeof Calendar | typeof Clock } {
  const date = new Date(dueDate);
  const overdue = isPast(date) && !isToday(date);
  const today = isToday(date);
  const tomorrow = isTomorrow(date);

  if (overdue) {
    const daysAgo = Math.abs(differenceInDays(new Date(), date));
    return { label: `${daysAgo}d ago`, color: "text-danger", icon: Clock };
  }
  if (today) return { label: "Today", color: "text-warning", icon: Calendar };
  if (tomorrow) return { label: "Tomorrow", color: "text-warning", icon: Calendar };

  const daysUntil = differenceInDays(date, new Date());
  if (daysUntil <= 7) return { label: `${daysUntil} Days`, color: "text-text-secondary", icon: Calendar };

  return { label: format(date, "MMM d"), color: "text-text-muted", icon: Calendar };
}

export function KanbanCard({ card, onClick, isDragging }: KanbanCardProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging: isSortable,
  } = useSortable({ id: card._id });

  const priorityBadge = PRIORITY_BADGE[card.priority];
  const dueInfo = card.dueDate ? formatDueDate(card.dueDate) : null;
  const DueIcon = dueInfo?.icon ?? Calendar;
  const commentCount = card.comments?.length ?? 0;
  const attachmentCount = card.attachments?.length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      }}
      className={cn(
        "relative rounded-xl bg-bg-surface ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        "p-2.5 cursor-grab select-none group/card",
        "shadow-card transition-shadow duration-150",
        "hover:shadow-card-hover",
        (isSortable || isDragging) ? "opacity-50 scale-[1.01]" : "opacity-100"
      )}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {/* Priority badge */}
      {priorityBadge && (
        <span className={cn(
          "inline-block text-[10px] font-bold tracking-wider px-1.5 py-px rounded-md mb-1.5",
          priorityBadge.bg,
          priorityBadge.text
        )}>
          {priorityBadge.label}
        </span>
      )}

      {/* Category labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mb-1.5">
          {card.labels.slice(0, 3).map(label => (
            <span
              key={label}
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                getLabelColor(label)
              )}
            >
              {label}
            </span>
          ))}
          {card.labels.length > 3 && (
            <span className="text-[10px] text-text-muted font-medium px-1">
              +{card.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <p className="text-[13px] font-medium text-text-primary leading-snug tracking-tight">
        {card.title}
      </p>

      {/* Subtask progress bar (if card has subtask-like data, approximate via checklist) */}
      {card.customFields && card.customFields.length > 0 && (
        <div className="mt-2 h-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-info rounded-full transition-all duration-300"
            style={{ width: "40%" }}
          />
        </div>
      )}

      {/* Footer */}
      {(card.assignees.length > 0 || dueInfo || commentCount > 0 || attachmentCount > 0) && (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-subtle/50">
          {/* Left: Avatars */}
          <div className="flex items-center">
            {card.assignees.length > 0 && (
              <AvatarGroup users={card.assignees} max={3} size="xs" />
            )}
          </div>

          {/* Right: metadata — fades in on hover */}
          <div className="flex items-center gap-2 opacity-60 group-hover/card:opacity-100 transition-opacity duration-150">
            {dueInfo && (
              <span className={cn("flex items-center gap-1 text-[11px] font-medium", dueInfo.color)}>
                <DueIcon size={11} />
                {dueInfo.label}
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-text-muted">
                <MessageSquare size={11} />
                {commentCount}
              </span>
            )}
            {attachmentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-text-muted">
                <Paperclip size={11} />
                {attachmentCount}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
