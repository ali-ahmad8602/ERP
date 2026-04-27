"use client"

import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import type { ActivityEntry } from "@/types"

interface ActivityItem {
  id: string
  initials: string
  name: string
  action: string
  target: string
  time: string
  href?: string
}

interface ActivityGroup {
  label: string
  items: ActivityItem[]
}

const defaultActivityData: ActivityGroup[] = [
  {
    label: "Today",
    items: [
      { id: "1", initials: "SC", name: "Sarah Chen", action: "approved", target: "Invoice #1284", time: "2m" },
      { id: "2", initials: "MR", name: "Mike Ross", action: "created", target: "Expense report", time: "15m" },
      { id: "3", initials: "EW", name: "Emma Wilson", action: "completed", target: "Q4 Budget Review", time: "32m" },
      { id: "4", initials: "JL", name: "James Lee", action: "assigned", target: "Task to Finance", time: "1h" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { id: "5", initials: "LP", name: "Lisa Park", action: "uploaded", target: "Contract v2.pdf", time: "1d" },
      { id: "6", initials: "TH", name: "Tom Harris", action: "commented on", target: "Project Alpha", time: "1d" },
      { id: "7", initials: "NP", name: "Nina Patel", action: "submitted", target: "April timesheet", time: "1d" },
    ],
  },
]

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

function groupActivities(entries: ActivityEntry[]): ActivityGroup[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayItems: ActivityItem[] = []
  const yesterdayItems: ActivityItem[] = []
  const olderItems: ActivityItem[] = []

  for (const e of entries) {
    const d = new Date(e.createdAt)
    let href: string | undefined
    if (e.department?.slug) {
      if (e.entityType === "card" && e.entityId) {
        href = `/dept/${e.department.slug}?cardId=${e.entityId}`
      } else if (e.entityType === "board" && e.entityId) {
        href = `/dept/${e.department.slug}?boardId=${e.entityId}`
      } else {
        href = `/dept/${e.department.slug}`
      }
    }

    const item: ActivityItem = {
      id: e._id,
      initials: getInitials(e.user.name),
      name: e.user.name,
      action: e.action,
      target: e.entityTitle,
      time: timeAgo(e.createdAt),
      href,
    }
    if (d >= today) todayItems.push(item)
    else if (d >= yesterday) yesterdayItems.push(item)
    else olderItems.push(item)
  }

  const groups: ActivityGroup[] = []
  if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems })
  if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems })
  if (olderItems.length > 0) groups.push({ label: "Earlier", items: olderItems })
  return groups
}

interface ActivityFeedProps {
  activities?: ActivityEntry[]
  loading?: boolean
}

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  const router = useRouter()
  if (loading) {
    return (
      <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden flex flex-col h-full">
        <div className="px-4 py-3 border-b border-[#ffffff14] shrink-0">
          <h2 className="text-[13px] font-medium text-[#fafafa]">Recent Activity</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-[#ffffff08]">
              <div className="w-[2px] h-5 bg-[#27272a] rounded-full shrink-0 mt-0.5" />
              <div className="w-5 h-5 rounded-full bg-[#27272a] animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-full bg-[#27272a] rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-6 bg-[#27272a] rounded animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const activityData = activities && activities.length > 0 ? groupActivities(activities) : defaultActivityData
  const showEmpty = activities !== undefined && activities.length === 0

  return (
    <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#ffffff14] shrink-0">
        <h2 className="text-[13px] font-medium text-[#fafafa]">Recent Activity</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Clock className="w-5 h-5 text-[#3f3f46] mb-2" strokeWidth={1.5} />
            <p className="text-[12px] text-[#52525b]">No recent activity</p>
          </div>
        ) : activityData.map((group) => (
          <div key={group.label}>
            {/* Group Label */}
            <div className="px-4 py-1.5 bg-[#0a0a0b]">
              <span className="text-[10px] uppercase tracking-wide text-[#52525b] font-medium">
                {group.label}
              </span>
            </div>

            {/* Items */}
            {group.items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => { if (item.href) router.push(item.href) }}
                role={item.href ? "button" : undefined}
                className={`flex items-start gap-2.5 px-4 py-2.5 hover:bg-[#ffffff05] transition-colors ${
                  idx !== group.items.length - 1 ? "border-b border-[#ffffff08]" : ""
                }${item.href ? " cursor-pointer" : ""}`}
              >
                {/* Left accent line */}
                <div className="w-[2px] h-5 bg-[#27272a] rounded-full shrink-0 mt-0.5" />

                {/* Avatar */}
                <div className="w-5 h-5 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-medium text-[#71717a]">{item.initials}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-snug">
                    <span className="font-semibold text-[#e4e4e7]">{item.name}</span>
                    <span className="text-[#52525b]"> {item.action} </span>
                    <span className="text-[#71717a]">{item.target}</span>
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-[#3f3f46] shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
