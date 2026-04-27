"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { PageTopbar } from "@/components/dashboard/page-topbar"
import { CheckCircle2, AlertTriangle, Clock, ListChecks, TrendingUp, TrendingDown } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { analyticsApi } from "@/lib/api"
import type { OrgOverview, DeptStats } from "@/types"

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 48
  const height = 20
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulativePercent = 0
  const radius = 60
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((segment, i) => {
          const percent = total > 0 ? segment.value / total : 0
          const strokeDasharray = `${percent * circumference} ${circumference}`
          const strokeDashoffset = -cumulativePercent * circumference
          cumulativePercent += percent
          return (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 80 80)"
              className="transition-all"
            />
          )
        })}
        <text x="80" y="76" textAnchor="middle" className="fill-[#fafafa] text-[20px] font-semibold">
          {total}
        </text>
        <text x="80" y="94" textAnchor="middle" className="fill-[#52525b] text-[10px]">
          Total
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="text-[11px] text-[#71717a] w-16">{segment.label}</span>
            <span className="text-[11px] text-[#a1a1aa] font-medium">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data }: { data: { name: string; tasks: number }[] }) {
  const maxTasks = Math.max(...data.map(d => d.tasks), 1)

  return (
    <div className="space-y-3">
      {data.map((dept) => (
        <div key={dept.name} className="flex items-center gap-3">
          <span className="text-[11px] text-[#71717a] w-20 truncate">{dept.name}</span>
          <div className="flex-1 h-5 bg-[#27272a] rounded overflow-hidden">
            <div
              className="h-full bg-[#3b82f6] rounded transition-all"
              style={{ width: `${(dept.tasks / maxTasks) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-[#a1a1aa] font-medium w-8 text-right">{dept.tasks}</span>
        </div>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4 flex flex-col animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-20 bg-[#27272a] rounded" />
        <div className="h-3.5 w-3.5 bg-[#27272a] rounded" />
      </div>
      <div className="h-5 w-12 bg-[#27272a] rounded mt-2" />
      <div className="h-3 w-16 bg-[#27272a] rounded mt-2" />
    </div>
  )
}

export default function ReportsPage() {
  useAuth({ required: true })

  const [overview, setOverview] = useState<OrgOverview | null>(null)
  const [deptStats, setDeptStats] = useState<DeptStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [ov, deptRes] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.departments(),
        ])
        if (!cancelled) {
          setOverview(ov)
          setDeptStats(deptRes.departments ?? [])
        }
      } catch {
        // silently handle errors — show empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const kpis = overview
    ? [
        { title: "TOTAL TASKS", value: String(overview.totalCards), trend: `+${overview.createdThisWeek} this week`, trendUp: true, icon: ListChecks, sparkline: [30, 45, 35, 50, 40, 55, 48, overview.totalCards] },
        { title: "COMPLETED", value: String(overview.doneCount), trend: `${overview.doneCount} done`, trendUp: true, icon: CheckCircle2, sparkline: [60, 68, 72, 78, 82, 88, 92, overview.doneCount] },
        { title: "OVERDUE", value: String(overview.overdueCount), trend: `${overview.overdueCount} overdue`, trendUp: overview.overdueCount === 0, icon: AlertTriangle, sparkline: [20, 18, 22, 15, 12, 10, 8, overview.overdueCount] },
        { title: "PENDING", value: String(overview.pendingApprovals), trend: `${overview.pendingApprovals} pending`, trendUp: false, icon: Clock, sparkline: [15, 18, 20, 19, 22, 21, 24, overview.pendingApprovals] },
      ]
    : []

  const taskStatusData = overview
    ? [
        { label: "Done", value: overview.doneCount, color: "#22c55e" },
        { label: "In Progress", value: overview.inProgressCount, color: "#3b82f6" },
        { label: "Overdue", value: overview.overdueCount, color: "#ef4444" },
        { label: "Pending", value: overview.pendingApprovals, color: "#71717a" },
      ]
    : []

  const departmentTasksData = deptStats.map((ds) => ({
    name: ds.department.name,
    tasks: ds.totalCards,
  }))

  const departmentHealth = deptStats.map((ds) => {
    const completion = ds.totalCards > 0 ? Math.round((ds.doneCount / ds.totalCards) * 100) : 0
    return {
      name: ds.department.name,
      tasks: ds.totalCards,
      completion,
      overdue: ds.overdueCount,
      trend: ds.overdueCount > 2 ? "down" as const : "up" as const,
    }
  })

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="reports" />
      <PageTopbar breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Reports" },
      ]} />

      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-[16px] font-semibold text-[#fafafa]">Reports</h1>
            <p className="text-[11px] text-[#52525b] mt-0.5">Overview of task performance and department health</p>
          </div>

          {/* Section 1: KPI Cards */}
          <section className="grid grid-cols-4 gap-3 mb-5">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              kpis.map((kpi) => (
                <div
                  key={kpi.title}
                  className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">
                      {kpi.title}
                    </span>
                    <kpi.icon className="w-3.5 h-3.5 text-[#3f3f46]" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-end justify-between flex-1">
                    <div className="flex flex-col justify-center">
                      <p className="text-[20px] font-semibold text-[#fafafa] leading-none tracking-tight">
                        {kpi.value}
                      </p>
                      <p className={`text-[10px] mt-1.5 ${kpi.trendUp ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                        {kpi.trend}
                      </p>
                    </div>
                    <div className="flex items-end">
                      <MiniSparkline data={kpi.sparkline} positive={kpi.trendUp} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Section 2: Charts */}
          <section className="grid grid-cols-2 gap-4 mb-5">
            {/* Donut Chart */}
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
              <h2 className="text-[12px] font-medium text-[#a1a1aa] mb-4">Task Status Breakdown</h2>
              {loading ? (
                <div className="h-40 bg-[#27272a] rounded animate-pulse" />
              ) : (
                <DonutChart data={taskStatusData} />
              )}
            </div>

            {/* Bar Chart */}
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
              <h2 className="text-[12px] font-medium text-[#a1a1aa] mb-4">Tasks by Department</h2>
              {loading ? (
                <div className="h-40 bg-[#27272a] rounded animate-pulse" />
              ) : (
                <BarChart data={departmentTasksData} />
              )}
            </div>
          </section>

          {/* Section 3: Department Health Table */}
          <section className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#ffffff14]">
              <h2 className="text-[12px] font-medium text-[#a1a1aa]">Department Health</h2>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_80px_100px_80px_60px] gap-4 px-4 py-2 border-b border-[#ffffff0a] bg-[#0a0a0b]">
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Department</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Tasks</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Completion</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Overdue</span>
              <span className="text-[10px] font-medium text-[#52525b] uppercase tracking-wider">Trend</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#ffffff08]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_100px_80px_60px] gap-4 px-4 items-center h-10 animate-pulse">
                    <div className="h-3 w-24 bg-[#27272a] rounded" />
                    <div className="h-3 w-8 bg-[#27272a] rounded" />
                    <div className="h-1 flex-1 bg-[#27272a] rounded" />
                    <div className="h-3 w-6 bg-[#27272a] rounded" />
                    <div className="h-3.5 w-3.5 bg-[#27272a] rounded" />
                  </div>
                ))
              ) : departmentHealth.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-[#52525b]">No department data available</div>
              ) : (
                departmentHealth.map((dept) => (
                  <div
                    key={dept.name}
                    className="grid grid-cols-[1fr_80px_100px_80px_60px] gap-4 px-4 items-center h-10 hover:bg-[#ffffff05] transition-colors"
                  >
                    <span className="text-[12px] font-medium text-[#fafafa]">{dept.name}</span>
                    <span className="text-[12px] text-[#a1a1aa]">{dept.tasks}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[4px] bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3b82f6] rounded-full"
                          style={{ width: `${dept.completion}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#52525b] w-7 text-right">{dept.completion}%</span>
                    </div>
                    <span className={`text-[12px] ${dept.overdue > 2 ? "text-[#ef4444]" : "text-[#71717a]"}`}>
                      {dept.overdue}
                    </span>
                    <div className="flex items-center">
                      {dept.trend === "up" ? (
                        <TrendingUp className="w-3.5 h-3.5 text-[#22c55e]" strokeWidth={1.5} />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-[#ef4444]" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
