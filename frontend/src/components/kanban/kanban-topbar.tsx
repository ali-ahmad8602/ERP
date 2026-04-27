"use client"

import { Search, Bell, Settings, HelpCircle, ChevronRight, Plus, Filter, SlidersHorizontal } from "lucide-react"

export function KanbanTopbar() {
  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 bg-[#09090b] border-b border-[#ffffff14] z-10">
      <div className="h-full max-w-[1120px] mx-auto px-5 flex items-center justify-between">
        {/* Left - Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-[#52525b] hover:text-[#71717a] cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3 text-[#3f3f46]" strokeWidth={1.5} />
          <span className="text-[12px] text-[#a1a1aa]">Workflow Board</span>
          <span className="text-[12px] text-[#3f3f46] ml-2">|</span>
          <span className="text-[11px] text-[#52525b] ml-2">Apr 27, 2026</span>
        </div>

        {/* Center - Actions */}
        <div className="flex items-center gap-2">
          <button className="h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[11px] text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors border border-[#27272a]">
            <Filter className="w-3 h-3" strokeWidth={1.5} />
            <span>Filter</span>
          </button>
          <button className="h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[11px] text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors border border-[#27272a]">
            <SlidersHorizontal className="w-3 h-3" strokeWidth={1.5} />
            <span>View</span>
          </button>
          <button className="h-7 px-2.5 flex items-center gap-1.5 rounded-md text-[11px] text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors">
            <Plus className="w-3 h-3" strokeWidth={2} />
            <span>New Task</span>
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-0.5">
          <div className="relative mr-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-[180px] h-7 pl-8 pr-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[11px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <button className="relative w-7 h-7 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button className="relative w-7 h-7 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="ml-1 w-6 h-6 rounded-full bg-[#27272a] flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-[#ffffff14] transition-all">
            <span className="text-[10px] font-medium text-[#a1a1aa]">JD</span>
          </div>
        </div>
      </div>
    </header>
  )
}
