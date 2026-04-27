"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Bell, Settings, HelpCircle, ChevronRight } from "lucide-react"
import { notificationApi } from "@/lib/api"
import { CommandPalette } from "./command-palette"

interface NotificationDept {
  _id: string
  name: string
  slug: string
}

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  entityType: string
  entityId: string
  department?: NotificationDept
  isRead: boolean
  createdAt: string
}

export function Topbar() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const fetchNotifications = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    notificationApi
      .list(20)
      .then((data) => {
        setNotifications(data.notifications || [])
      })
      .catch(() => {})
  }, [])

  // Initial fetch + polling every 15 seconds
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) fetchNotifications()
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setShowPanel(false)
      }
    }
    if (showPanel) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showPanel])

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {}
  }

  const handleNotificationClick = async (n: Notification) => {
    // Mark as read
    if (!n.isRead) {
      try {
        await notificationApi.markRead(n._id)
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === n._id ? { ...notif, isRead: true } : notif))
        )
      } catch {}
    }

    // Navigate based on entity type
    if (n.department?.slug && n.entityType === "card" && n.entityId) {
      // Navigate to dept page with card auto-open
      setShowPanel(false)
      router.push(`/dept/${n.department.slug}?cardId=${n.entityId}`)
    } else if (n.department?.slug) {
      setShowPanel(false)
      router.push(`/dept/${n.department.slug}`)
    } else {
      // Fallback — just close panel
      setShowPanel(false)
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return "just now"
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHrs = Math.floor(diffMin / 60)
      if (diffHrs < 24) return `${diffHrs}h ago`
      const diffDays = Math.floor(diffHrs / 24)
      return `${diffDays}d ago`
    } catch {
      return ""
    }
  }

  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 bg-[#09090b] border-b border-[#ffffff14] z-10">
      <div className="h-full max-w-[1120px] mx-auto px-5 flex items-center justify-between">
        {/* Left - Breadcrumb */}
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-[#52525b] hover:text-[#71717a] cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3 text-[#3f3f46]" strokeWidth={1.5} />
          <span className="text-[12px] text-[#a1a1aa]">Dashboard</span>
          <span className="text-[12px] text-[#3f3f46] ml-2">|</span>
          <span className="text-[11px] text-[#52525b] ml-2">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>

        {/* Center - Search */}
        <div className="flex-1 flex justify-center px-8">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search..."
              readOnly
              onClick={() => setCmdOpen(true)}
              className="w-full h-8 pl-9 pr-14 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20 cursor-pointer"
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
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setShowPanel(!showPanel)}
              className="relative w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />
              )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
              <div
                ref={panelRef}
                className="absolute right-0 top-full mt-1 w-[340px] bg-[#0f0f11] border border-[#27272a] rounded-lg shadow-xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#27272a]">
                  <span className="text-[12px] font-semibold text-[#fafafa]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <p className="text-[12px] text-[#52525b]">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className="w-full text-left px-3 py-2.5 hover:bg-[#ffffff08] transition-colors border-b border-[#ffffff0a] last:border-b-0 flex items-start gap-2.5"
                      >
                        <div className="mt-1.5 shrink-0">
                          {!n.isRead ? (
                            <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />
                          ) : (
                            <div className="w-1.5 h-1.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] font-medium leading-snug ${n.isRead ? "text-[#71717a]" : "text-[#fafafa]"}`}>
                            {n.title}
                          </p>
                          {n.message && (
                            <p className={`text-[11px] leading-snug mt-0.5 ${n.isRead ? "text-[#52525b]" : "text-[#a1a1aa]"}`}>
                              {n.message}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[#52525b]">{formatTime(n.createdAt)}</span>
                            {n.department && (
                              <span className="text-[10px] text-[#3f3f46]">{n.department.name}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="ml-1.5 w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-[#ffffff14] transition-all">
            <span className="text-[11px] font-medium text-[#a1a1aa]">JD</span>
          </div>
        </div>
      </div>
      {cmdOpen && <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />}
    </header>
  )
}
