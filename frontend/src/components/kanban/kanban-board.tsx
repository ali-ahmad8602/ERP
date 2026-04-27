"use client"

import { useState, useEffect } from "react"
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
import { columns as staticColumnDefs, initialCards } from "./data"
import type { Card, ColumnId } from "./types"

interface KanbanBoardProps {
  columns?: { id: ColumnId | string; title: string; cards: Card[] }[]
  cards?: Card[]
  onCardMove?: (cardId: string, columnId: string, order: number) => void
  onCardClick?: (card: Card) => void
  onAddCard?: (columnId: string, title: string) => void
  onComment?: (cardId: string, text: string) => void
  onApprove?: (cardId: string) => void
  onReject?: (cardId: string, reason: string) => void
  onCardUpdated?: (cardId: string, data: any) => void
  autoOpenCardId?: string | null
  readOnly?: boolean
}

export function KanbanBoard({ columns: propColumns, cards: propCards, onCardMove, onCardClick, onAddCard, onComment, onApprove, onReject, onCardUpdated, autoOpenCardId, readOnly }: KanbanBoardProps = {}) {
  const columnDefs = propColumns || staticColumnDefs
  const [localCards, setLocalCards] = useState<Card[]>(initialCards)

  // Use prop cards if provided, otherwise local static state
  const cards = propCards || localCards
  const setCards = propCards ? undefined : setLocalCards

  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [autoOpened, setAutoOpened] = useState(false)
  const [cardNotFound, setCardNotFound] = useState(false)

  // Clear selectedCard if it no longer exists in the cards array
  useEffect(() => {
    if (selectedCard && cards.length > 0) {
      const stillExists = cards.find(c => c.id === selectedCard.id)
      if (!stillExists) {
        setSelectedCard(null)
      } else if (stillExists !== selectedCard) {
        // Update the selected card with fresh data
        setSelectedCard(stillExists)
      }
    }
  }, [cards]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset autoOpened when autoOpenCardId changes
  useEffect(() => {
    setAutoOpened(false)
    setCardNotFound(false)
  }, [autoOpenCardId])

  // Auto-open card from URL param
  useEffect(() => {
    if (autoOpenCardId && !autoOpened && cards.length > 0) {
      const card = cards.find(c => c.id === autoOpenCardId)
      if (card) {
        setSelectedCard(card)
        setAutoOpened(true)
      } else {
        // Card not found after cards have loaded
        setCardNotFound(true)
        setAutoOpened(true)
      }
    }
  }, [autoOpenCardId, cards, autoOpened])

  // Auto-dismiss "card not found" toast after 3 seconds
  useEffect(() => {
    if (!cardNotFound) return
    const timer = setTimeout(() => setCardNotFound(false), 3000)
    return () => clearTimeout(timer)
  }, [cardNotFound])

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

  const getColumnCards = (columnId: ColumnId | string) => {
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

    const draggedCard = cards.find((c) => c.id === activeId)
    if (!draggedCard) return

    // Check if over a column
    const isOverColumn = columnDefs.some((col) => col.id === overId)
    if (isOverColumn) {
      const newColumnId = overId as ColumnId
      if (draggedCard.columnId !== newColumnId) {
        if (setCards) {
          setCards((prev) =>
            prev.map((card) =>
              card.id === activeId ? { ...card, columnId: newColumnId } : card
            )
          )
        }
      }
      return
    }

    // Over another card
    const overCard = cards.find((c) => c.id === overId)
    if (overCard && draggedCard.columnId !== overCard.columnId) {
      if (setCards) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === activeId ? { ...card, columnId: overCard.columnId } : card
          )
        )
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const draggedCard = cards.find((c) => c.id === activeId)
    const overCard = cards.find((c) => c.id === overId)

    // Determine target column: dropping on a column directly or on a card within a column
    const isOverColumn = columnDefs.some((col) => col.id === overId)
    const targetColumnId = isOverColumn ? overId : overCard?.columnId

    if (draggedCard && targetColumnId) {
      const columnCards = getColumnCards(targetColumnId)
      let newOrder = 0

      if (overCard && draggedCard.columnId === overCard.columnId) {
        // Reorder within same column
        const oldIndex = columnCards.findIndex((c) => c.id === activeId)
        const newIndex = columnCards.findIndex((c) => c.id === overId)

        const reorderedColumnCards = arrayMove(columnCards, oldIndex, newIndex)
        newOrder = newIndex

        if (setCards) {
          setCards((prev) => {
            const otherCards = prev.filter((c) => c.columnId !== draggedCard.columnId)
            return [...otherCards, ...reorderedColumnCards]
          })
        }
      } else {
        // Moved to a different column
        newOrder = columnCards.length
      }

      // Call the prop callback for backend sync
      if (onCardMove) {
        onCardMove(activeId, targetColumnId, newOrder)
      }
    }
  }

  const handleCardClick = (card: Card) => {
    if (onCardClick) {
      onCardClick(card)
    }
    setSelectedCard(card)
  }

  return (
    <>
      {cardNotFound && (
        <div className="mb-2 px-3 py-2 bg-[#27272a] border border-[#3f3f46] rounded-md text-[12px] text-[#a1a1aa] text-center animate-pulse">
          Card not found or was deleted
        </div>
      )}
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
              id={column.id as ColumnId}
              title={column.title}
              cards={getColumnCards(column.id)}
              onCardClick={handleCardClick}
              onAddCard={onAddCard}
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

      <CardDrawer card={selectedCard} onClose={() => setSelectedCard(null)} onComment={onComment} onApprove={onApprove} onReject={onReject} onCardUpdated={onCardUpdated} readOnly={readOnly} />
    </>
  )
}
