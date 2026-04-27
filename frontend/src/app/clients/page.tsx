"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { Search, Plus, MoreHorizontal } from "lucide-react"

const statusConfig = {
  active: { label: "Active", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
  inactive: { label: "Inactive", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
} as const

type ClientStatus = keyof typeof statusConfig

interface Client {
  id: string
  name: string
  email: string
  initials: string
  company: string
  status: ClientStatus
  projects: number
  value: string
}

const clients: Client[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@acmecorp.com", initials: "SM", company: "Acme Corp", status: "active", projects: 4, value: "$124,500" },
  { id: "2", name: "James Chen", email: "j.chen@techflow.io", initials: "JC", company: "TechFlow Inc", status: "active", projects: 7, value: "$340,200" },
  { id: "3", name: "Emily Rodriguez", email: "emily.r@globalsol.com", initials: "ER", company: "Global Solutions", status: "inactive", projects: 2, value: "$56,800" },
  { id: "4", name: "Michael Okafor", email: "m.okafor@nexusdig.com", initials: "MO", company: "Nexus Digital", status: "active", projects: 5, value: "$98,400" },
  { id: "5", name: "Laura Bennett", email: "l.bennett@sterling.co", initials: "LB", company: "Sterling & Co", status: "active", projects: 3, value: "$215,000" },
  { id: "6", name: "David Park", email: "d.park@vertexlabs.io", initials: "DP", company: "Vertex Labs", status: "active", projects: 6, value: "$178,300" },
  { id: "7", name: "Rachel Thompson", email: "rachel@pinnacle.com", initials: "RT", company: "Pinnacle Group", status: "inactive", projects: 1, value: "$42,600" },
  { id: "8", name: "Alex Novak", email: "a.novak@horizonmedia.co", initials: "AN", company: "Horizon Media", status: "active", projects: 4, value: "$89,750" },
]

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="clients" />
      <Topbar />
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-[13px] font-medium text-[#fafafa]">Clients</h1>
            <button className="flex items-center gap-1.5 h-7 px-3 bg-[#3b82f6] hover:bg-[#2563eb] text-[11px] font-medium text-white rounded-md transition-colors">
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Add Client</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full h-8 pl-9 pr-4 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/20"
            />
          </div>

          {/* Client Table */}
          <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
            {/* Column Headers */}
            <div className="grid grid-cols-[24px_1.4fr_1fr_86px_72px_100px_32px] gap-3 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
              <div className="flex items-center justify-center">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
              </div>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Client</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Company</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Status</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider text-right">Projects</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider text-right">Value</span>
              <span></span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#ffffff08]">
              {clients.map((client) => {
                const status = statusConfig[client.status]
                return (
                  <div
                    key={client.id}
                    className="grid grid-cols-[24px_1.4fr_1fr_86px_72px_100px_32px] gap-3 px-4 py-2.5 items-center hover:bg-[#ffffff05] transition-colors group"
                  >
                    <div className="flex items-center justify-center">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-medium text-[#a1a1aa]">{client.initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-[#fafafa] truncate">{client.name}</p>
                        <p className="text-[11px] text-[#52525b] truncate">{client.email}</p>
                      </div>
                    </div>
                    <span className="text-[12px] text-[#a1a1aa]">{client.company}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text} w-fit`}>
                      {status.label}
                    </span>
                    <span className="text-[12px] text-[#71717a] text-right">{client.projects}</span>
                    <span className="text-[12px] text-[#a1a1aa] font-medium text-right">{client.value}</span>
                    <button className="w-6 h-6 flex items-center justify-center rounded text-[#3f3f46] opacity-0 group-hover:opacity-100 hover:text-[#71717a] hover:bg-[#ffffff08] transition-all">
                      <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
