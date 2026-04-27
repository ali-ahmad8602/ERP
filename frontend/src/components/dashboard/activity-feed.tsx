"use client"

interface ActivityItem {
  id: string
  initials: string
  name: string
  action: string
  target: string
  time: string
}

interface ActivityGroup {
  label: string
  items: ActivityItem[]
}

const activityData: ActivityGroup[] = [
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

export function ActivityFeed() {
  return (
    <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#ffffff14] shrink-0">
        <h2 className="text-[13px] font-medium text-[#fafafa]">Recent Activity</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activityData.map((group) => (
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
                className={`flex items-start gap-2.5 px-4 py-2.5 hover:bg-[#ffffff05] transition-colors ${
                  idx !== group.items.length - 1 ? "border-b border-[#ffffff08]" : ""
                }`}
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
