"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"
import type { Card, ColumnId } from "./types"

interface KanbanColumnProps {
  id: ColumnId
  title: string
  cards: Card[]
  onCardClick: (card: Card) => void
}

export function KanbanColumn({ id, title, cards, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      className={`flex-shrink-0 w-[260px] bg-[#0a0a0b] border rounded-lg flex flex-col max-h-full transition-colors ${
        isOver ? "border-[#3b82f6]/50" : "border-[#27272a]"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 px-3 py-2.5 border-b border-[#27272a] bg-[#0a0a0b] rounded-t-lg z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#fafafa]">{title}</h3>
          <span className="text-[11px] text-[#52525b] font-medium">{cards.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
