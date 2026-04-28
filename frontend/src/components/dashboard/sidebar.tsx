"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  HelpCircle,
  Plus,
  X,
  Briefcase
} from "lucide-react"
import { deptApi } from "@/lib/api"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/store/auth.store"
import { useToast } from "@/components/ui/action-toast"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
]

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
]

const PRESET_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316",
]

const PRESET_ICONS = ["🏢", "💼", "⚙️", "📊", "🛡️", "💰", "🎯", "📋", "🔬", "📞", "🎨", "🚀"]

interface Department {
  _id: string
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
}

interface SidebarProps {
  activeRoute?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Sidebar({ activeRoute }: SidebarProps = {}) {
  const pathname = usePathname()
  const { canCreateDept } = usePermissions()
  const authUser = useAuthStore((s) => s.user)
  const { show } = useToast()
  const canAccessCompanyBoard = ["super_admin", "org_admin", "top_management"].includes(authUser?.orgRole || "")
  const [departments, setDepartments] = useState<Department[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formIcon, setFormIcon] = useState("🏢")
  const [formColor, setFormColor] = useState("#3b82f6")
  const [formDesc, setFormDesc] = useState("")

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    deptApi.list().then((data) => setDepartments(data.departments || [])).catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal()
      }
    }
    if (showCreateModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showCreateModal])

  const closeModal = () => {
    setShowCreateModal(false)
    setFormName("")
    setFormIcon("🏢")
    setFormColor("#3b82f6")
    setFormDesc("")
  }

  const handleCreateDept = async () => {
    if (!formName.trim()) return
    setCreating(true)
    try {
      const payload: any = { name: formName.trim() }
      if (formIcon) payload.icon = formIcon
      if (formColor) payload.color = formColor
      if (formDesc.trim()) payload.description = formDesc.trim()

      const { department } = await deptApi.create(payload)
      setDepartments((prev) => [...prev, department])
      show("Department created")
      closeModal()
    } catch (err: any) {
      show(err.message || "Failed to create department", "error")
    } finally {
      setCreating(false)
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
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
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors relative ${
                    active
                      ? "bg-[#ffffff0a] text-[#3b82f6]"
                      : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#3b82f6] rounded-r" />
                  )}
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            {canAccessCompanyBoard && (() => {
              const active = isActive("/company-board")
              return (
                <Link
                  href="/company-board"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors relative ${
                    active
                      ? "bg-[#ffffff0a] text-[#3b82f6]"
                      : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#3b82f6] rounded-r" />
                  )}
                  <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                  <span>Company Board</span>
                </Link>
              )
            })()}
          </div>

          {/* Departments */}
          <div className="mt-4 pt-3 border-t border-[#ffffff14]">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">
                Departments
              </span>
              {canCreateDept && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-4 h-4 flex items-center justify-center rounded text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
                >
                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {departments.map((dept) => {
                const deptHref = `/dept/${dept.slug}`
                const active = pathname.startsWith(deptHref)
                return (
                  <Link
                    key={dept._id}
                    href={deptHref}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                      active
                        ? "bg-[#ffffff0a] text-[#3b82f6]"
                        : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
                    }`}
                  >
                    {dept.icon && (
                      <span className="text-[12px] shrink-0">{dept.icon}</span>
                    )}
                    {dept.color && !dept.icon && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: dept.color }}
                      />
                    )}
                    <span className="truncate">{dept.name}</span>
                  </Link>
                )
              })}
              {departments.length === 0 && (
                <p className="px-3 py-2 text-[11px] text-[#3f3f46]">No departments yet</p>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="py-3 px-2 border-t border-[#ffffff14]">
          <div className="space-y-0.5">
            {bottomItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-colors relative ${
                    active
                      ? "bg-[#ffffff0a] text-[#3b82f6]"
                      : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
                  }`}
                >
                  {active && (
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

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div ref={modalRef} className="w-full max-w-[400px] bg-[#0f0f11] border border-[#27272a] rounded-lg p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[14px] font-semibold text-[#fafafa]">New Department</h3>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Icon Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-[#a1a1aa] mb-1.5">Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setFormIcon(icon)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-[16px] transition-colors ${
                      formIcon === icon
                        ? "bg-[#3b82f6]/20 ring-1 ring-[#3b82f6]"
                        : "bg-[#18181b] hover:bg-[#27272a]"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label htmlFor="dept-name" className="block text-[11px] font-medium text-[#a1a1aa] mb-1.5">
                Name <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="dept-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && formName.trim()) handleCreateDept() }}
                placeholder="e.g. Engineering"
                autoFocus
                className="w-full h-8 px-3 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors"
              />
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-[#a1a1aa] mb-1.5">Color</label>
              <div className="flex gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormColor(color)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      formColor === color ? "ring-2 ring-white/40 scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <label htmlFor="dept-desc" className="block text-[11px] font-medium text-[#a1a1aa] mb-1.5">
                Description <span className="text-[#52525b]">(optional)</span>
              </label>
              <textarea
                id="dept-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="What does this department do?"
                rows={2}
                className="w-full px-3 py-2 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={closeModal}
                className="h-8 px-3 rounded-md text-[12px] font-medium text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDept}
                disabled={!formName.trim() || creating}
                className="h-8 px-4 bg-[#3b82f6] hover:bg-[#2563eb] text-[12px] font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
