"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { KanbanTopbar } from "@/components/kanban/kanban-topbar"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { useAuth } from "@/hooks/useAuth"
import { useBoardStore } from "@/store/board.store"
import { deptApi } from "@/lib/api"
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
  } = useBoardStore()

  const [ready, setReady] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { departments } = await deptApi.list()
        if (cancelled || !departments.length) return

        const firstDept = departments[0]
        const boards = await fetchBoards(firstDept._id)
        if (cancelled || !boards.length) return

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
  }))

  const handleCardMove = (cardId: string, columnId: string, order: number) => {
    moveCard(cardId, columnId, order)
  }

  const isLoading = authLoading || loadingBoards || loadingCards || !ready

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="kanban" />
      <KanbanTopbar />

      {/* Main Content */}
      <main className="ml-[220px] pt-12 h-screen">
        <div className="h-[calc(100vh-48px)] max-w-[1120px] mx-auto px-5 py-4">
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
              cards={cards}
              onCardMove={handleCardMove}
            />
          )}
        </div>
      </main>
    </div>
  )
}
