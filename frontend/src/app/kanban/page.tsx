"use client"

import { useEffect, useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { KanbanTopbar } from "@/components/kanban/kanban-topbar"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { useAuth } from "@/hooks/useAuth"
import { useBoardStore } from "@/store/board.store"
import { deptApi } from "@/lib/api"
import { LayoutGrid } from "lucide-react"
import type { Card, ColumnId } from "@/components/kanban/types"

export default function KanbanPage() {
  const { user, loading: authLoading } = useAuth({ required: true })
  const {
    activeBoard,
    cards: rawCards,
    loadingBoards,
    loadingCards,
    fetchBoards,
    fetchBoard,
    fetchCards,
    moveCard,
    createCard,
  } = useBoardStore()

  const [ready, setReady] = useState(false)
  const [empty, setEmpty] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  // Kanban filters
  const [filterPriority, setFilterPriority] = useState("")
  const [filterAssignee, setFilterAssignee] = useState("")
  const [filterDue, setFilterDue] = useState("")

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { departments } = await deptApi.list()
        if (cancelled) return
        if (!departments || !departments.length) { setEmpty(true); return }

        const firstDept = departments[0]
        const boards = await fetchBoards(firstDept._id)
        if (cancelled) return
        if (!boards || !boards.length) { setEmpty(true); return }

        const firstBoard = boards[0]
        await Promise.all([fetchBoard(firstBoard._id), fetchCards(firstBoard._id)])
        if (!cancelled) setReady(true)
      } catch (err) {
        console.error("Failed to initialize kanban board:", err)
      }
    }

    init()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Map backend columns to the format KanbanBoard expects
  const columns = activeBoard?.columns
    ?.sort((a: any, b: any) => a.order - b.order)
    .map((col: any) => ({
      id: col._id as ColumnId,
      title: col.name,
      cards: [] as Card[],
    }))

  // Map backend cards to the Card type KanbanBoard expects
  const cards: Card[] = rawCards.map((c: any) => ({
    id: c._id,
    title: c.title,
    description: c.description || "",
    priority: (c.priority || "medium") as Card["priority"],
    dueDate: c.dueDate ? new Date(c.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
    assignees: (c.assignees || []).map((a: any) => ({
      id: a._id,
      name: a.name,
      initials: a.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    })),
    comments: (c.comments || []).map((cm: any) => ({
      id: cm._id,
      author: {
        id: cm.author?._id || cm.author?.name || "unknown",
        name: cm.author?.name || "Unknown",
        initials: (cm.author?.name || "U")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      },
      content: cm.text,
      createdAt: new Date(cm.createdAt).toLocaleDateString(),
    })),
    attachments: (c.attachments || []).map((att: any) => ({
      id: att._id,
      name: att.name,
      size: "",
      type: att.url?.split(".").pop() || "",
    })),
    amount: undefined,
    referenceId: undefined,
    columnId: c.column as ColumnId,
    auditLog: c.auditLog ?? [],
    approval: c.approval ?? undefined,
  }))

  // Client-side filtering
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Priority filter
      if (filterPriority && card.priority !== filterPriority) return false

      // Assignee filter
      if (filterAssignee.trim()) {
        const q = filterAssignee.trim().toLowerCase()
        const match = card.assignees.some((a) => a.name.toLowerCase().includes(q))
        if (!match) return false
      }

      // Due filter
      if (filterDue === "overdue") {
        if (!card.dueDate) return false
        const due = new Date(card.dueDate)
        if (isNaN(due.getTime()) || due >= new Date()) return false
      } else if (filterDue === "this-week") {
        if (!card.dueDate) return false
        const due = new Date(card.dueDate)
        if (isNaN(due.getTime())) return false
        const now = new Date()
        const endOfWeek = new Date(now)
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
        endOfWeek.setHours(23, 59, 59, 999)
        if (due > endOfWeek) return false
      }

      return true
    })
  }, [cards, filterPriority, filterAssignee, filterDue])

  const handleCardMove = (cardId: string, columnId: string, order: number) => {
    moveCard(cardId, columnId, order)
  }

  const handleAddCard = async (columnId: string, title: string) => {
    if (!activeBoard) return
    try {
      await createCard({ title, board: activeBoard._id, column: columnId })
    } catch (err) {
      console.error("Failed to create card:", err)
    }
  }

  const isLoading = authLoading || loadingBoards || loadingCards || (!ready && !empty)

  if (empty) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Sidebar activeRoute="kanban" />
        <KanbanTopbar />
        <main className="ml-[220px] pt-12 h-screen">
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <LayoutGrid className="w-8 h-8 text-[#3f3f46] mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-[#71717a] mb-1">No departments or boards found</p>
            <p className="text-[11px] text-[#3f3f46]">Create a department first to start tracking work</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="kanban" />
      <KanbanTopbar />

      {/* Main Content */}
      <main className="ml-[220px] pt-12 h-screen">
        <div className="h-[calc(100vh-48px)] max-w-[1120px] mx-auto px-5 py-4">
          {/* Kanban Filters */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="text"
              placeholder="Filter by assignee..."
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
            />
            <select
              value={filterDue}
              onChange={(e) => setFilterDue(e.target.value)}
              className="h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="">All Dates</option>
              <option value="overdue">Overdue</option>
              <option value="this-week">This week</option>
            </select>
          </div>
          {isLoading ? (
            <div className="flex gap-4 h-full">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[260px] bg-[#0a0a0b] border border-[#27272a] rounded-lg animate-pulse"
                >
                  <div className="px-3 py-2.5 border-b border-[#27272a]">
                    <div className="h-4 w-20 bg-[#27272a] rounded" />
                  </div>
                  <div className="p-2 space-y-2">
                    {[...Array(2 + (i % 3))].map((_, j) => (
                      <div key={j} className="h-24 bg-[#27272a]/50 rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard
              columns={columns}
              cards={filteredCards}
              onCardMove={handleCardMove}
              onAddCard={handleAddCard}
            />
          )}
        </div>
      </main>
    </div>
  )
}
