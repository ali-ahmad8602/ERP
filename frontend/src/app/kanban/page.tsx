import { Sidebar } from "@/components/dashboard/sidebar"
import { KanbanTopbar } from "@/components/kanban/kanban-topbar"
import { KanbanBoard } from "@/components/kanban/kanban-board"

export default function KanbanPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="kanban" />
      <KanbanTopbar />
      
      {/* Main Content */}
      <main className="ml-[220px] pt-12 h-screen">
        <div className="h-[calc(100vh-48px)] max-w-[1120px] mx-auto px-5 py-4">
          <KanbanBoard />
        </div>
      </main>
    </div>
  )
}
