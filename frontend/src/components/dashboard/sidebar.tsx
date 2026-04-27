"use client"

import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  CreditCard,
  BarChart3,
  FolderOpen,
  HelpCircle,
  Kanban
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/", route: "overview" },
  { icon: Kanban, label: "Workflow", href: "/kanban", route: "kanban" },
  { icon: FileText, label: "Invoices", href: "/invoices", route: "invoices" },
  { icon: Users, label: "Clients", href: "/clients", route: "clients" },
  { icon: CreditCard, label: "Payments", href: "/payments", route: "payments" },
  { icon: BarChart3, label: "Reports", href: "/reports", route: "reports" },
  { icon: FolderOpen, label: "Documents", href: "/documents", route: "documents" },
]

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings", route: "settings" },
  { icon: HelpCircle, label: "Help", href: "/help", route: "help" },
]

import Link from "next/link"

interface SidebarProps {
  activeRoute?: string
}

export function Sidebar({ activeRoute = "overview" }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0a0a0b] border-r border-[#ffffff14] flex flex-col">
      {/* Logo */}
      <div className="h-12 px-4 flex items-center border-b border-[#ffffff14]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#3b82f6] flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white">IM</span>
          </div>
          <span className="text-[13px] font-medium text-[#fafafa]">InvoiceMate</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.route === activeRoute
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors relative ${
                  isActive
                    ? "bg-[#ffffff0a] text-[#3b82f6]"
                    : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#3b82f6] rounded-r" />
                )}
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="py-3 px-2 border-t border-[#ffffff14]">
        <div className="space-y-0.5">
          {bottomItems.map((item) => {
            const isActive = item.route === activeRoute
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors relative ${
                  isActive
                    ? "bg-[#ffffff0a] text-[#3b82f6]"
                    : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#3b82f6] rounded-r" />
                )}
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            )
          })}
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
