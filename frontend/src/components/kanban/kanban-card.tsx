"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MessageSquare } from "lucide-react"
import type { Card } from "./types"

const PRIORITY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: "Urgent", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
  high: { label: "High", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
  medium: { label: "Medium", bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" },
  low: { label: "Low", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
  none: { label: "None", bg: "bg-[#71717a]/10", text: "text-[#52525b]" },
}

const DEFAULT_PRIORITY = PRIORITY_STYLES.low

function getPriority(val: string | undefined | null) {
  if (!val) return DEFAULT_PRIORITY
  const key = val.toLowerCase().trim()
  return PRIORITY_STYLES[key] || DEFAULT_PRIORITY
}

interface KanbanCardProps {
  card: Card
  onClick: () => void
}

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = getPriority(card.priority)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-[#0f0f11] border rounded-lg p-3 cursor-pointer transition-colors ${
        isDragging
          ? "border-[#3b82f6] opacity-50"
          : "border-[#27272a] hover:border-[#3f3f46]"
      }`}
    >
      <p className="text-[13px] font-medium text-[#fafafa] leading-snug mb-2">
        {card.title}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.bg} ${priority.text}`}>
          {priority.label}
        </span>
        {card.dueDate && (
          <span className="text-[11px] text-[#52525b]">{card.dueDate}</span>
        )}
      </div>

      {(card.referenceId || card.amount) && (
        <div className="flex items-center gap-2 mb-3">
          {card.referenceId && (
            <span className="text-[11px] text-[#71717a]">{card.referenceId}</span>
          )}
          {card.amount && (
            <span className="text-[11px] text-[#a1a1aa] font-medium">{card.amount}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {(card.assignees || []).slice(0, 3).map((assignee) => (
            <div
              key={assignee.id}
              className="w-5 h-5 rounded-full bg-[#27272a] border border-[#0f0f11] flex items-center justify-center"
              title={assignee.name}
            >
              <span className="text-[8px] font-medium text-[#a1a1aa]">
                {assignee.initials}
              </span>
            </div>
          ))}
          {(card.assignees || []).length > 3 && (
            <div className="w-5 h-5 rounded-full bg-[#27272a] border border-[#0f0f11] flex items-center justify-center">
              <span className="text-[8px] font-medium text-[#71717a]">
                +{card.assignees.length - 3}
              </span>
            </div>
          )}
        </div>

        {(card.comments || []).length > 0 && (
          <div className="flex items-center gap-1 text-[#52525b]">
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            <span className="text-[10px]">{card.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}
