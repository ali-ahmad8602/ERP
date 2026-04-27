"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { PageTopbar } from "@/components/dashboard/page-topbar"
import { CheckCircle2, AlertTriangle, Clock, ListChecks, TrendingUp, TrendingDown } from "lucide-react"

// KPI Data
const kpis = [
  { title: "TOTAL TASKS", value: "128", trend: "+12%", trendUp: true, icon: ListChecks, sparkline: [30, 45, 35, 50, 40, 55, 48, 60] },
  { title: "COMPLETED", value: "98", trend: "+18%", trendUp: true, icon: CheckCircle2, sparkline: [60, 68, 72, 78, 82, 88, 92, 98] },
  { title: "OVERDUE", value: "7", trend: "-3", trendUp: true, icon: AlertTriangle, sparkline: [20, 18, 22, 15, 12, 10, 8, 7] },
  { title: "PENDING", value: "23", trend: "+5", trendUp: false, icon: Clock, sparkline: [15, 18, 20, 19, 22, 21, 24, 23] },
]

// Chart Data
const taskStatusData = [
  { label: "Done", value: 98, color: "#22c55e" },
  { label: "In Progress", value: 18, color: "#3b82f6" },
  { label: "Overdue", value: 7, color: "#ef4444" },
  { label: "Pending", value: 5, color: "#71717a" },
]

const departmentTasksData = [
  { name: "Finance", tasks: 24 },
  { name: "Engineering", tasks: 42 },
  { name: "Marketing", tasks: 18 },
  { name: "Operations", tasks: 28 },
  { name: "Sales", tasks: 16 },
]

// Department Health Data
const departmentHealth = [
  { name: "Finance", tasks: 24, completion: 78, overdue: 2, trend: "up" },
  { name: "Engineering", tasks: 42, completion: 92, overdue: 1, trend: "up" },
  { name: "Marketing", tasks: 18, completion: 45, overdue: 4, trend: "down" },
  { name: "Operations", tasks: 28, completion: 83, overdue: 2, trend: "up" },
  { name: "Sales", tasks: 16, completion: 67, overdue: 3, trend: "down" },
  { name: "HR", tasks: 12, completion: 88, overdue: 0, trend: "up" },
]

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

function DonutChart() {
  const total = taskStatusData.reduce((sum, d) => sum + d.value, 0)
  let cumulativePercent = 0
  const radius = 60
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {taskStatusData.map((segment, i) => {
          const percent = segment.value / total
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
        {taskStatusData.map((segment) => (
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

function BarChart() {
  const maxTasks = Math.max(...departmentTasksData.map(d => d.tasks))

  return (
    <div className="space-y-3">
      {departmentTasksData.map((dept) => (
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

export default function ReportsPage() {
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
            {kpis.map((kpi) => (
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
                      {kpi.trend} vs last week
                    </p>
                  </div>
                  <div className="flex items-end">
                    <MiniSparkline data={kpi.sparkline} positive={kpi.trendUp} />
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Section 2: Charts */}
          <section className="grid grid-cols-2 gap-4 mb-5">
            {/* Donut Chart */}
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
              <h2 className="text-[12px] font-medium text-[#a1a1aa] mb-4">Task Status Breakdown</h2>
              <DonutChart />
            </div>

            {/* Bar Chart */}
            <div className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4">
              <h2 className="text-[12px] font-medium text-[#a1a1aa] mb-4">Tasks by Department</h2>
              <BarChart />
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
              {departmentHealth.map((dept) => (
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
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
