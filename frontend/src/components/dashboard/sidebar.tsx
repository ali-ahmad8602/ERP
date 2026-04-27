"use client"

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  CreditCard,
  BarChart3,
  FolderOpen,
  HelpCircle
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: FileText, label: "Invoices", active: false },
  { icon: Users, label: "Clients", active: false },
  { icon: CreditCard, label: "Payments", active: false },
  { icon: BarChart3, label: "Reports", active: false },
  { icon: FolderOpen, label: "Documents", active: false },
]

const bottomItems = [
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help" },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0a0a0b] border-r border-[#ffffff14] flex flex-col">
      {/* Logo */}
      <div className="h-12 px-4 flex items-center border-b border-[#ffffff14]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#3b82f6] flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white">IM</span>
          </div>
          <span className="text-[13px] font-medium text-[#fafafa]">InvoiceMate</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors relative ${
                item.active
                  ? "bg-[#ffffff0a] text-[#3b82f6]"
                  : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
              }`}
            >
              {item.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#3b82f6] rounded-r" />
              )}
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="py-3 px-2 border-t border-[#ffffff14]">
        <div className="space-y-0.5">
          {bottomItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* User */}
        <div className="mt-3 pt-3 border-t border-[#ffffff14]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center">
              <span className="text-[11px] font-medium text-[#a1a1aa]">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#fafafa] truncate">John Doe</p>
              <p className="text-[11px] text-[#52525b] truncate">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
