"use client"

import { Search, Bell, Settings, HelpCircle, ChevronRight } from "lucide-react"

interface PageTopbarProps {
  breadcrumbs: { label: string; href?: string }[]
}

export function PageTopbar({ breadcrumbs }: PageTopbarProps) {
  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 bg-[#09090b] border-b border-[#ffffff14] z-10">
      <div className="h-full max-w-[1120px] mx-auto px-5 flex items-center justify-between">
        {/* Left - Breadcrumb */}
        <div className="flex items-center gap-1.5">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-[#3f3f46]" strokeWidth={1.5} />}
              {crumb.href ? (
                <a href={crumb.href} className="text-[12px] text-[#52525b] hover:text-[#71717a] cursor-pointer transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[12px] text-[#a1a1aa]">{crumb.label}</span>
              )}
            </div>
          ))}
          <span className="text-[12px] text-[#3f3f46] ml-2">|</span>
          <span className="text-[11px] text-[#52525b] ml-2">Apr 27, 2026</span>
        </div>

        {/* Center - Search */}
        <div className="flex-1 flex justify-center px-8">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-8 pl-9 pr-14 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[#27272a] rounded text-[10px] text-[#52525b] font-medium border border-[#ffffff14]">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-0.5">
          <button className="relative w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="ml-1.5 w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-[#ffffff14] transition-all">
            <span className="text-[11px] font-medium text-[#a1a1aa]">JD</span>
          </div>
        </div>
      </div>
    </header>
  )
}
