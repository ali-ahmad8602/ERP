"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { CardDrawer } from "./card-drawer"
import { columns as columnDefs, initialCards } from "./data"
import type { Card, ColumnId } from "./types"

export function KanbanBoard() {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getColumnCards = (columnId: ColumnId) => {
    return cards.filter((card) => card.columnId === columnId)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = cards.find((c) => c.id === active.id)
    setActiveCard(card || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCard = cards.find((c) => c.id === activeId)
    if (!activeCard) return

    // Check if over a column
    const isOverColumn = columnDefs.some((col) => col.id === overId)
    if (isOverColumn) {
      const newColumnId = overId as ColumnId
      if (activeCard.columnId !== newColumnId) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === activeId ? { ...card, columnId: newColumnId } : card
          )
        )
      }
      return
    }

    // Over another card
    const overCard = cards.find((c) => c.id === overId)
    if (overCard && activeCard.columnId !== overCard.columnId) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === activeId ? { ...card, columnId: overCard.columnId } : card
        )
      )
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeCard = cards.find((c) => c.id === activeId)
    const overCard = cards.find((c) => c.id === overId)

    if (activeCard && overCard && activeCard.columnId === overCard.columnId) {
      const columnCards = getColumnCards(activeCard.columnId)
      const oldIndex = columnCards.findIndex((c) => c.id === activeId)
      const newIndex = columnCards.findIndex((c) => c.id === overId)

      const reorderedColumnCards = arrayMove(columnCards, oldIndex, newIndex)
      
      setCards((prev) => {
        const otherCards = prev.filter((c) => c.columnId !== activeCard.columnId)
        return [...otherCards, ...reorderedColumnCards]
      })
    }
  }

  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columnDefs.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cards={getColumnCards(column.id)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 opacity-90">
              <KanbanCard card={activeCard} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CardDrawer card={selectedCard} onClose={() => setSelectedCard(null)} />
    </>
  )
}
