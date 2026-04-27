"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, X } from "lucide-react"
import { KanbanCard } from "./kanban-card"
import type { Card, ColumnId } from "./types"

interface KanbanColumnProps {
  id: ColumnId
  title: string
  cards: Card[]
  onCardClick: (card: Card) => void
  onAddCard?: (columnId: string, title: string) => void
}

export function KanbanColumn({ id, title, cards, onCardClick, onAddCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")

  const handleAdd = () => {
    if (!newTitle.trim() || !onAddCard) return
    onAddCard(id, newTitle.trim())
    setNewTitle("")
    setAdding(false)
  }

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

        {/* Add Card Inline */}
        {adding ? (
          <div className="p-2 bg-[#0f0f11] border border-[#27272a] rounded-md">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd()
                if (e.key === "Escape") { setAdding(false); setNewTitle("") }
              }}
              placeholder="Card title..."
              autoFocus
              className="w-full h-7 px-2 bg-transparent border border-[#27272a] rounded text-[12px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors"
            />
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                onClick={handleAdd}
                disabled={!newTitle.trim()}
                className="h-6 px-2.5 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-[11px] font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setNewTitle("") }}
                className="h-6 w-6 flex items-center justify-center rounded text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : onAddCard ? (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Add card</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
