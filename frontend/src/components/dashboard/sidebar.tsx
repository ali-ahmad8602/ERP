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
  X
} from "lucide-react"
import { deptApi } from "@/lib/api"
import { usePermissions } from "@/hooks/usePermissions"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
]

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
]

interface Department {
  _id: string
  name: string
  slug: string
}

interface SidebarProps {
  activeRoute?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Sidebar({ activeRoute }: SidebarProps = {}) {
  const pathname = usePathname()
  const { canCreateDept } = usePermissions()
  const [departments, setDepartments] = useState<Department[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDeptName, setNewDeptName] = useState("")
  const [creating, setCreating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    deptApi.list().then((data) => setDepartments(data.departments || [])).catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowCreateModal(false)
        setNewDeptName("")
      }
    }
    if (showCreateModal) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showCreateModal])

  const handleCreateDept = async () => {
    if (!newDeptName.trim()) return
    setCreating(true)
    try {
      const { department } = await deptApi.create({ name: newDeptName.trim() })
      setDepartments((prev) => [...prev, department])
      setNewDeptName("")
      setShowCreateModal(false)
    } catch (err) {
      console.error("Failed to create department:", err)
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
          </div>

          {/* Departments */}
          {departments.length > 0 && (
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
                      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                        active
                          ? "bg-[#ffffff0a] text-[#3b82f6]"
                          : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08]"
                      }`}
                    >
                      <span className="truncate">{dept.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Show + New button if no departments loaded yet */}
          {departments.length === 0 && (
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
            </div>
          )}
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
          <div ref={modalRef} className="w-full max-w-[360px] bg-[#0f0f11] border border-[#27272a] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[#fafafa]">New Department</h3>
              <button
                onClick={() => { setShowCreateModal(false); setNewDeptName("") }}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-1.5 mb-4">
              <label htmlFor="dept-name" className="block text-[11px] font-medium text-[#a1a1aa]">
                Department Name
              </label>
              <input
                id="dept-name"
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateDept() }}
                placeholder="e.g. Engineering"
                autoFocus
                className="w-full h-8 px-3 bg-transparent border border-[#27272a] rounded-md text-[13px] text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => { setShowCreateModal(false); setNewDeptName("") }}
                className="h-8 px-3 rounded-md text-[12px] font-medium text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDept}
                disabled={!newDeptName.trim() || creating}
                className="h-8 px-4 bg-[#3b82f6] hover:bg-[#2563eb] text-[12px] font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
