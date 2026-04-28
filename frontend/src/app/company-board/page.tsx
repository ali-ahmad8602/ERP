"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/store/auth.store"
import { boardApi, cardApi } from "@/lib/api"
import { LayoutGrid, Lock, Users, Calendar, ArrowRight } from "lucide-react"

interface CompanyBoard {
  _id: string
  name: string
  description?: string
  department?: { _id: string; name: string; slug: string; icon?: string }
  isCompanyBoard: boolean
  columns: any[]
  settings: { isLocked?: boolean; requiresApproval?: boolean }
  createdAt: string
  cardCount?: number
}

export default function CompanyBoardPage() {
  const router = useRouter()
  const { loading: authLoading } = useAuth({ required: true })
  const authUser = useAuthStore((s) => s.user)
  const [boards, setBoards] = useState<CompanyBoard[]>([])
  const [loading, setLoading] = useState(true)
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({})

  const orgRole = authUser?.orgRole || "user"
  const canAccess = ["super_admin", "org_admin", "top_management"].includes(orgRole)

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && authUser && !canAccess) {
      router.replace("/")
    }
  }, [authLoading, authUser, canAccess, router])

  // Fetch company boards
  useEffect(() => {
    if (!canAccess) return
    setLoading(true)
    boardApi.listCompany()
      .then(async (res) => {
        const bds = res.boards || []
        setBoards(bds)

        // Fetch card counts for each board
        const counts: Record<string, number> = {}
        await Promise.allSettled(
          bds.map(async (b) => {
            try {
              const { cards } = await cardApi.list(b._id)
              counts[b._id] = (cards || []).length
            } catch {
              counts[b._id] = 0
            }
          })
        )
        setCardCounts(counts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [canAccess])

  // Block render for non-authorized
  if (authLoading) return null
  if (!canAccess) return null

  const handleBoardClick = (board: CompanyBoard) => {
    if (board.department?.slug) {
      router.push(`/dept/${board.department.slug}?boardId=${board._id}`)
    } else {
      // Company board without department — open kanban directly
      router.push(`/kanban?boardId=${board._id}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar />
      <Topbar />

      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-[16px] font-semibold text-[#fafafa]">Company Boards</h1>
            <p className="text-[11px] text-[#52525b] mt-0.5">Executive-level workspace overview</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4 animate-pulse">
                  <div className="h-4 w-32 bg-[#27272a] rounded mb-3" />
                  <div className="h-3 w-48 bg-[#27272a] rounded mb-4" />
                  <div className="flex gap-4">
                    <div className="h-3 w-16 bg-[#27272a] rounded" />
                    <div className="h-3 w-16 bg-[#27272a] rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && boards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutGrid className="w-8 h-8 text-[#3f3f46] mb-3" strokeWidth={1.5} />
              <h3 className="text-[13px] font-medium text-[#fafafa] mb-1">No company boards available</h3>
              <p className="text-[11px] text-[#52525b] max-w-[280px]">
                Company boards are used for strategic initiatives and cross-department projects.
                Create one from any department&apos;s board settings.
              </p>
            </div>
          )}

          {/* Board Grid */}
          {!loading && boards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => {
                const count = cardCounts[board._id] ?? 0
                const colCount = (board.columns || []).length
                const isLocked = board.settings?.isLocked
                const created = board.createdAt ? new Date(board.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""

                return (
                  <button
                    key={board._id}
                    onClick={() => handleBoardClick(board)}
                    className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4 text-left hover:border-[#3f3f46] transition-colors group"
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-medium text-[#fafafa] truncate group-hover:text-[#3b82f6] transition-colors">
                          {board.name}
                        </h3>
                        {board.department && (
                          <p className="text-[11px] text-[#52525b] mt-0.5 truncate">
                            {board.department.icon || "📁"} {board.department.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isLocked && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#f59e0b]/15 text-[#f59e0b]">
                            <Lock className="w-2.5 h-2.5" strokeWidth={1.5} />
                            Locked
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-[#3f3f46] group-hover:text-[#3b82f6] transition-colors" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#ffffff0a]">
                      <div className="flex items-center gap-1.5 text-[#52525b]">
                        <LayoutGrid className="w-3 h-3" strokeWidth={1.5} />
                        <span className="text-[11px]">{count} cards</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#52525b]">
                        <Users className="w-3 h-3" strokeWidth={1.5} />
                        <span className="text-[11px]">{colCount} columns</span>
                      </div>
                      {created && (
                        <div className="flex items-center gap-1.5 text-[#3f3f46] ml-auto">
                          <Calendar className="w-3 h-3" strokeWidth={1.5} />
                          <span className="text-[10px]">{created}</span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
