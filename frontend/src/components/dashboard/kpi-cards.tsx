"use client"

import { CheckCircle2, AlertTriangle, Clock, ListChecks } from "lucide-react"
import type { OrgOverview } from "@/types"

interface KPIData {
  title: string
  value: string
  trend: string
  trendUp: boolean
  icon: React.ElementType
  sparkline: number[]
}

const defaultKpis: KPIData[] = [
  {
    title: "TOTAL TASKS",
    value: "128",
    trend: "+12% from last week",
    trendUp: true,
    icon: ListChecks,
    sparkline: [30, 45, 35, 50, 40, 55, 48, 60],
  },
  {
    title: "OVERDUE",
    value: "7",
    trend: "-3 from last week",
    trendUp: true,
    icon: AlertTriangle,
    sparkline: [20, 18, 22, 15, 12, 10, 8, 7],
  },
  {
    title: "PENDING APPROVALS",
    value: "23",
    trend: "+5 new today",
    trendUp: false,
    icon: Clock,
    sparkline: [15, 18, 20, 19, 22, 21, 24, 23],
  },
  {
    title: "COMPLETED",
    value: "98",
    trend: "+18% this month",
    trendUp: true,
    icon: CheckCircle2,
    sparkline: [60, 68, 72, 78, 82, 88, 92, 98],
  },
]

function buildKpisFromOverview(o: OrgOverview): KPIData[] {
  return [
    {
      title: "TOTAL TASKS",
      value: String(o.totalCards),
      trend: `${o.createdThisWeek} created this week`,
      trendUp: true,
      icon: ListChecks,
      sparkline: [30, 45, 35, 50, 40, 55, 48, o.totalCards],
    },
    {
      title: "OVERDUE",
      value: String(o.overdueCount),
      trend: `${o.complianceItems} compliance items`,
      trendUp: o.overdueCount === 0,
      icon: AlertTriangle,
      sparkline: [20, 18, 22, 15, 12, 10, 8, o.overdueCount],
    },
    {
      title: "PENDING APPROVALS",
      value: String(o.pendingApprovals),
      trend: `${o.inProgressCount} in progress`,
      trendUp: false,
      icon: Clock,
      sparkline: [15, 18, 20, 19, 22, 21, 24, o.pendingApprovals],
    },
    {
      title: "COMPLETED",
      value: String(o.doneCount),
      trend: `${o.createdThisMonth} created this month`,
      trendUp: true,
      icon: CheckCircle2,
      sparkline: [60, 68, 72, 78, 82, 88, 92, o.doneCount],
    },
  ]
}

interface KPICardsProps {
  overview?: OrgOverview | null
  loading?: boolean
}

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

export function KPICards({ overview, loading }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[#0f0f11] border border-[#ffffff14] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 bg-[#27272a] rounded animate-pulse" />
              <div className="h-3.5 w-3.5 bg-[#27272a] rounded animate-pulse" />
            </div>
            <div className="flex items-end justify-between flex-1">
              <div className="flex flex-col justify-center">
                <div className="h-6 w-12 bg-[#27272a] rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-[#27272a] rounded animate-pulse mt-1.5" />
              </div>
              <div className="h-5 w-12 bg-[#27272a] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const kpis = overview ? buildKpisFromOverview(overview) : defaultKpis

  return (
    <div className="grid grid-cols-4 gap-3">
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
              <p className="text-[22px] font-semibold text-[#fafafa] leading-none tracking-tight">
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
      ))}
    </div>
  )
}
