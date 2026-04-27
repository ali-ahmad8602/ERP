"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Bell, Settings, HelpCircle, ChevronRight } from "lucide-react"
import { notificationApi } from "@/lib/api"

interface Notification {
  _id: string
  message: string
  read: boolean
  createdAt: string
}

export function Topbar() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return
    notificationApi
      .list(10)
      .then((data) => {
        setNotifications(data.notifications || [])
      })
      .catch(() => {})
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
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
    } catch {}
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
                className="absolute right-0 top-full mt-1 w-[320px] bg-[#0f0f11] border border-[#27272a] rounded-lg shadow-xl overflow-hidden z-50"
              >
                {/* Panel Header */}
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

                {/* Notification List */}
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center">
                      <p className="text-[12px] text-[#52525b]">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        onClick={() => handleMarkRead(n._id)}
                        className="w-full text-left px-3 py-2.5 hover:bg-[#ffffff08] transition-colors border-b border-[#ffffff0a] last:border-b-0 flex items-start gap-2.5"
                      >
                        {/* Unread dot */}
                        <div className="mt-1.5 shrink-0">
                          {!n.read ? (
                            <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full" />
                          ) : (
                            <div className="w-1.5 h-1.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] leading-snug ${n.read ? "text-[#71717a]" : "text-[#fafafa]"}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-[#52525b] mt-0.5">
                            {formatTime(n.createdAt)}
                          </p>
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
    </header>
  )
}
