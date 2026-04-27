"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { BoardSettingsPanel } from "@/components/kanban/board-settings-panel"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { useBoardStore } from "@/store/board.store"
import { deptApi, cardApi, boardApi } from "@/lib/api"
import { safeCard } from "@/lib/safe"
import { Plus, Users, LayoutGrid, MoreHorizontal, Settings } from "lucide-react"
import type { Card, ColumnId } from "@/components/kanban/types"

interface Department {
  _id: string
  name: string
  slug: string
  icon: string
  color: string
  description?: string
  members: any[]
  heads: any[]
}

export default function DeptDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth({ required: true })
  const { isAdmin, canEditBoard, canEditCards, canComment } = usePermissions()

  const {
    boards,
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

  const [dept, setDept] = useState<Department | null>(null)
  const [deptLoading, setDeptLoading] = useState(true)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [dropdownBoardId, setDropdownBoardId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownBoardId(null)
      }
    }
    if (dropdownBoardId) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownBoardId])

  // Reset selected board when slug changes to avoid stale state
  useEffect(() => {
    setSelectedBoardId(null)
  }, [slug])

  // 1. Fetch department by slug
  useEffect(() => {
    if (!slug) return
    let cancelled = false

    async function loadDept() {
      setDeptLoading(true)
      try {
        const { departments } = await deptApi.list()
        const found = departments.find((d: any) => d.slug === slug)
        if (!cancelled && found) {
          setDept(found)
        }
      } catch (err) {
        console.error("Failed to load department:", err)
      } finally {
        if (!cancelled) setDeptLoading(false)
      }
    }

    loadDept()
    return () => { cancelled = true }
  }, [slug])

  // 2. Fetch boards when dept is loaded
  useEffect(() => {
    if (!dept?._id) return
    fetchBoards(dept._id)
  }, [dept?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Select board from URL or default to first
  useEffect(() => {
    if (boards.length === 0) return
    const urlBoardId = searchParams.get("boardId")
    const targetId = urlBoardId && boards.find(b => b._id === urlBoardId)
      ? urlBoardId
      : boards[0]._id
    if (targetId !== selectedBoardId) {
      setSelectedBoardId(targetId)
    }
  }, [boards, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Fetch board details + cards when selected board changes
  useEffect(() => {
    if (!selectedBoardId) return
    fetchBoard(selectedBoardId)
    fetchCards(selectedBoardId)
  }, [selectedBoardId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Switch board handler
  const switchBoard = (boardId: string) => {
    setSelectedBoardId(boardId)
    router.push(`/dept/${slug}?boardId=${boardId}`, { scroll: false })
  }

  // New board handler
  const handleCreateBoard = async () => {
    if (!dept) return
    const name = window.prompt("Board name:")
    if (!name?.trim()) return
    try {
      const { board } = await boardApi.create({ name: name.trim(), department: dept._id })
      await fetchBoards(dept._id)
      switchBoard(board._id)
    } catch (err) {
      console.error("Failed to create board:", err)
    }
  }

  // Rename board handler
  const handleRenameBoard = async (boardId: string, currentName: string) => {
    const name = window.prompt("Rename board:", currentName)
    if (!name?.trim() || name === currentName) return
    setDropdownBoardId(null)
    try {
      await boardApi.update(boardId, { name: name.trim() })
      if (dept) await fetchBoards(dept._id)
      if (selectedBoardId === boardId) fetchBoard(boardId)
    } catch (err) {
      console.error("Failed to rename board:", err)
    }
  }

  // Delete board handler
  const handleDeleteBoard = async (boardId: string, boardName: string) => {
    const confirmed = window.confirm(`Delete board "${boardName}"? This cannot be undone.`)
    if (!confirmed) return
    setDropdownBoardId(null)
    try {
      await boardApi.delete(boardId)
      if (dept) {
        const { boards: remaining } = await boardApi.list(dept._id)
        await fetchBoards(dept._id)
        if (remaining.length > 0) {
          switchBoard(remaining[0]._id)
        } else {
          setSelectedBoardId(null)
        }
      }
    } catch (err) {
      console.error("Failed to delete board:", err)
    }
  }

  // Board settings callbacks
  const handleBoardUpdated = async () => {
    if (selectedBoardId) fetchBoard(selectedBoardId)
    if (dept) fetchBoards(dept._id)
  }

  const handleBoardDeleted = async () => {
    setShowSettings(false)
    if (dept) {
      await fetchBoards(dept._id)
      const remaining = useBoardStore.getState().boards
      if (remaining.length > 0) {
        switchBoard(remaining[0]._id)
      } else {
        setSelectedBoardId(null)
      }
    }
  }

  // Map backend columns -> KanbanBoard format
  const columns = activeBoard?.columns
    ?.sort((a: any, b: any) => a.order - b.order)
    .map((col: any) => ({
      id: col._id as ColumnId,
      title: col.name,
      cards: [] as Card[],
    }))

  // Map backend cards -> Card type (via safeCard for null safety)
  const cards: Card[] = rawCards.map((raw: any) => {
    const c = safeCard(raw)
    return {
      id: c._id,
      title: c.title,
      description: c.description,
      priority: c.priority as Card["priority"],
      dueDate: c.dueDate
        ? new Date(c.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "",
      assignees: c.assignees.map((a: any) => ({
        id: a._id || a.id || "",
        name: a.name || "Unknown",
        initials: (a.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
      })),
      comments: c.comments.map((cm: any) => ({
        id: cm._id || cm.id || "",
        author: {
          id: cm.author?._id || "unknown",
          name: cm.author?.name || "Unknown",
          initials: (cm.author?.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        },
        content: cm.text || cm.content || "",
        createdAt: cm.createdAt ? new Date(cm.createdAt).toLocaleDateString() : "",
      })),
      attachments: c.attachments.map((att: any) => ({
        id: att._id || att.id || "",
        name: att.name || "file",
        size: att.size || "",
        type: att.url?.split(".").pop() || att.type || "",
        url: att.url || "",
      })),
      labels: c.labels,
      columnId: c.column as ColumnId,
      auditLog: c.auditLog,
      approval: c.approval ?? undefined,
    }
  })

  // Board lock & RBAC checks
  const boardIsLocked = activeBoard?.settings?.isLocked === true
  const boardId = selectedBoardId || ""
  const userCanEditCards = canEditCards(boardId)
  const userCanEditBoard = canEditBoard(boardId) || isAdmin
  const userCanComment = canComment(boardId)
  const showCardMove = !boardIsLocked && userCanEditCards
  const showAddCard = !boardIsLocked && userCanEditCards

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

  const handleComment = async (cardId: string, text: string) => {
    try {
      await cardApi.comment(cardId, text)
      if (selectedBoardId) fetchCards(selectedBoardId)
    } catch (err) {
      console.error("Failed to add comment:", err)
    }
  }

  const handleApprove = async (cardId: string) => {
    try {
      await cardApi.approve(cardId)
      if (selectedBoardId) fetchCards(selectedBoardId)
    } catch (err) {
      console.error("Failed to approve:", err)
    }
  }

  const handleReject = async (cardId: string, reason: string) => {
    try {
      await cardApi.reject(cardId, reason)
      if (selectedBoardId) fetchCards(selectedBoardId)
    } catch (err) {
      console.error("Failed to reject:", err)
    }
  }

  const handleCardUpdated = async () => {
    if (selectedBoardId) fetchCards(selectedBoardId)
  }

  const isLoading = authLoading || deptLoading || loadingBoards
  const memberCount = dept ? (dept.members?.length ?? 0) + (dept.heads?.length ?? 0) : 0

  // Skeleton
  if (isLoading && !dept) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Sidebar />
        <Topbar />
        <main className="ml-[220px] pt-12 h-screen">
          <div className="max-w-[1120px] mx-auto px-6 py-5">
            <div className="h-5 w-48 bg-[#18181b] rounded animate-pulse mb-2" />
            <div className="h-3 w-72 bg-[#18181b] rounded animate-pulse mb-6" />
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-28 bg-[#18181b] rounded-md animate-pulse" />
              ))}
            </div>
            <div className="flex gap-4 h-[calc(100vh-200px)]">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-[260px] shrink-0 bg-[#0a0a0b] border border-[#27272a] rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Dept not found
  if (!dept && !deptLoading) {
    return (
      <div className="min-h-screen bg-[#09090b]">
        <Sidebar />
        <Topbar />
        <main className="ml-[220px] pt-12 h-screen">
          <div className="max-w-[1120px] mx-auto px-6 py-5">
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <LayoutGrid className="w-8 h-8 text-[#3f3f46] mb-3" strokeWidth={1.5} />
              <p className="text-[13px] text-[#71717a]">Department not found</p>
              <button
                onClick={() => router.push("/")}
                className="mt-3 h-8 px-4 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar />
      <Topbar />

      <main className="ml-[220px] pt-12 h-screen">
        <div className="h-[calc(100vh-48px)] max-w-[1120px] mx-auto px-6 flex flex-col">

          {/* Department Header */}
          <div className="py-4 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {dept?.icon && <span className="text-[16px]">{dept.icon}</span>}
                <h1 className="text-[16px] font-semibold text-[#fafafa]">{dept?.name}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#52525b]">
                  <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{memberCount} members</span>
                </div>
                <button
                  onClick={() => router.push(`/dept/${slug}/members`)}
                  className="h-7 px-2.5 bg-[#18181b] border border-[#ffffff14] rounded-md text-[11px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#ffffff20] transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
            {dept?.description && (
              <p className="text-[12px] text-[#52525b] mb-3">{dept.description}</p>
            )}

            {/* Board Tabs + Toolbar */}
            <div className="flex items-center justify-between border-b border-[#ffffff0a]">
              <div className="flex items-center gap-1">
                {boards.map(board => (
                  <div key={board._id} className="relative group flex items-center">
                    <button
                      onClick={() => switchBoard(board._id)}
                      className={`px-3 py-2 text-[12px] font-medium transition-colors relative ${
                        selectedBoardId === board._id
                          ? "text-[#fafafa]"
                          : "text-[#52525b] hover:text-[#a1a1aa]"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {board.name}
                        {selectedBoardId === board._id && activeBoard?.settings?.isLocked && (
                          <span className="text-[10px]" title="Board is locked">{"\uD83D\uDD12"}</span>
                        )}
                      </span>
                      {selectedBoardId === board._id && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3b82f6] rounded-t" />
                      )}
                    </button>
                    {/* Context menu trigger */}
                    {userCanEditBoard && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDropdownBoardId(dropdownBoardId === board._id ? null : board._id)
                          }}
                          className="w-5 h-5 flex items-center justify-center rounded text-[#52525b] opacity-0 group-hover:opacity-100 hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-all"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        {dropdownBoardId === board._id && (
                          <div
                            ref={dropdownRef}
                            className="absolute top-full left-0 mt-1 w-[120px] bg-[#18181b] border border-[#27272a] rounded-md shadow-lg z-50 py-1"
                          >
                            <button
                              onClick={() => handleRenameBoard(board._id, board.name)}
                              className="w-full text-left px-3 py-1.5 text-[11px] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#ffffff08] transition-colors"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => handleDeleteBoard(board._id, board.name)}
                              className="w-full text-left px-3 py-1.5 text-[11px] text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {boards.length === 0 && !loadingBoards && (
                  <span className="px-3 py-2 text-[12px] text-[#3f3f46]">No boards</span>
                )}

                {/* New Board button */}
                {userCanEditBoard && (
                  <button
                    onClick={handleCreateBoard}
                    className="h-7 px-2 bg-[#18181b] border border-[#ffffff14] rounded-md text-[11px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#ffffff20] transition-colors flex items-center gap-1 ml-1"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />
                    Board
                  </button>
                )}
              </div>

              {/* Toolbar right side */}
              <div className="flex items-center gap-1">
                {userCanEditBoard && selectedBoardId && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
                    title="Board Settings"
                  >
                    <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Board Content */}
          <div className="flex-1 overflow-hidden py-2 animate-fade-in">
            {loadingCards ? (
              <div className="flex gap-4 h-full">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-[260px] shrink-0 bg-[#0a0a0b] border border-[#27272a] rounded-lg animate-pulse">
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
            ) : boards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <LayoutGrid className="w-8 h-8 text-[#3f3f46] mb-3" strokeWidth={1.5} />
                <p className="text-[13px] text-[#71717a] mb-1">No boards in this department yet</p>
                <p className="text-[11px] text-[#3f3f46]">Create a board to start tracking work</p>
              </div>
            ) : cards.length === 0 && !loadingCards ? (
              <KanbanBoard
                columns={columns}
                cards={[]}
                onCardMove={showCardMove ? handleCardMove : undefined}
                onAddCard={showAddCard ? handleAddCard : undefined}
                onComment={userCanComment ? handleComment : undefined}
                onApprove={handleApprove}
                onReject={handleReject}
                autoOpenCardId={searchParams.get("cardId")}
                onCardUpdated={handleCardUpdated}
              />
            ) : (
              <KanbanBoard
                columns={columns}
                cards={cards}
                onCardMove={showCardMove ? handleCardMove : undefined}
                onAddCard={showAddCard ? handleAddCard : undefined}
                onComment={userCanComment ? handleComment : undefined}
                onApprove={handleApprove}
                onReject={handleReject}
                autoOpenCardId={searchParams.get("cardId")}
                onCardUpdated={handleCardUpdated}
              />
            )}
          </div>
        </div>
      </main>

      {/* Board Settings Panel */}
      {showSettings && activeBoard && (
        <BoardSettingsPanel
          board={activeBoard}
          onClose={() => setShowSettings(false)}
          onBoardUpdated={handleBoardUpdated}
          onBoardDeleted={handleBoardDeleted}
        />
      )}
    </div>
  )
}
