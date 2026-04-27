"use client"

import { Filter, ArrowUpDown, MoreHorizontal } from "lucide-react"
import type { DeptStats } from "@/types"

interface Department {
  id: string
  name: string
  members: number
  status: "active" | "on-track" | "at-risk" | "planning"
  progress: number
  value: string
}

const defaultDepartments: Department[] = [
  { id: "1", name: "Finance", members: 12, status: "active", progress: 78, value: "$124K" },
  { id: "2", name: "Engineering", members: 28, status: "on-track", progress: 92, value: "$340K" },
  { id: "3", name: "Marketing", members: 8, status: "at-risk", progress: 45, value: "$56K" },
  { id: "4", name: "Operations", members: 15, status: "on-track", progress: 83, value: "$98K" },
  { id: "5", name: "Sales", members: 22, status: "active", progress: 67, value: "$215K" },
  { id: "6", name: "HR", members: 6, status: "planning", progress: 88, value: "$42K" },
]

function mapDeptStats(stats: DeptStats[]): Department[] {
  return stats.map((s) => {
    const total = s.totalCards || 1
    const progress = Math.round((s.doneCount / total) * 100)
    let status: Department["status"] = "active"
    if (s.overdueCount > 0) status = "at-risk"
    else if (progress >= 80) status = "on-track"
    else if (s.inProgressCount === 0 && s.doneCount === 0) status = "planning"
    return {
      id: s.department._id,
      name: s.department.name,
      members: s.memberCount,
      status,
      progress,
      value: `${s.totalCards} tasks`,
    }
  })
}

interface DepartmentsTableProps {
  deptStats?: DeptStats[]
  loading?: boolean
}

const statusConfig = {
  active: { label: "Active", bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]" },
  "on-track": { label: "On track", bg: "bg-[#22c55e]/15", text: "text-[#22c55e]" },
  "at-risk": { label: "At risk", bg: "bg-[#ef4444]/15", text: "text-[#ef4444]" },
  planning: { label: "Planning", bg: "bg-[#71717a]/15", text: "text-[#71717a]" },
}

export function DepartmentsTable({ deptStats, loading }: DepartmentsTableProps) {
  const departments = deptStats && deptStats.length > 0 ? mapDeptStats(deptStats) : defaultDepartments

  if (loading) {
    return (
      <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#ffffff14] flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-[#fafafa]">Departments</h2>
        </div>
        <div className="divide-y divide-[#ffffff08]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <div className="h-3.5 w-3.5 bg-[#27272a] rounded animate-pulse" />
              <div className="h-3 w-24 bg-[#27272a] rounded animate-pulse" />
              <div className="h-3 w-8 bg-[#27272a] rounded animate-pulse ml-auto" />
              <div className="h-4 w-14 bg-[#27272a] rounded-full animate-pulse" />
              <div className="h-1 w-24 bg-[#27272a] rounded animate-pulse" />
              <div className="h-3 w-12 bg-[#27272a] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
      {/* Header with title and actions */}
      <div className="px-4 py-2.5 border-b border-[#ffffff14] flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-[#fafafa]">Departments</h2>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <Filter className="w-3 h-3" strokeWidth={1.5} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors">
            <ArrowUpDown className="w-3 h-3" strokeWidth={1.5} />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[24px_1fr_72px_86px_120px_72px_32px] gap-3 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
        <div className="flex items-center justify-center">
          <input 
            type="checkbox" 
            className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer"
          />
        </div>
        <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Department</span>
        <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Members</span>
        <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Status</span>
        <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Progress</span>
        <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider text-right">Value</span>
        <span></span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#ffffff08]">
        {departments.map((dept) => {
          const status = statusConfig[dept.status]
          return (
            <div
              key={dept.id}
              className="grid grid-cols-[24px_1fr_72px_86px_120px_72px_32px] gap-3 px-4 py-2.5 items-center hover:bg-[#ffffff05] transition-colors group"
            >
              <div className="flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 rounded border-[#3f3f46] bg-transparent accent-[#3b82f6] cursor-pointer"
                />
              </div>
              <span className="text-[12px] font-medium text-[#fafafa]">{dept.name}</span>
              <span className="text-[12px] text-[#71717a]">{dept.members}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text} w-fit`}>
                {status.label}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[4px] bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b82f6] rounded-full transition-all"
                    style={{ width: `${dept.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#52525b] w-7 text-right">{dept.progress}%</span>
              </div>
              <span className="text-[12px] text-[#a1a1aa] text-right font-medium">{dept.value}</span>
              <button className="w-6 h-6 flex items-center justify-center rounded text-[#3f3f46] opacity-0 group-hover:opacity-100 hover:text-[#71717a] hover:bg-[#ffffff08] transition-all">
                <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
