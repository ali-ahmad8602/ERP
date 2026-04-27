"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { DepartmentsTable } from "@/components/dashboard/departments-table"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardStore } from "@/store/dashboard.store"
import { deptApi } from "@/lib/api"
import { safeDepartment } from "@/lib/safe"

interface DeptOption {
  _id: string
  name: string
}

export default function Dashboard() {
  useAuth({ required: true })

  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore()

  const [departments, setDepartments] = useState<DeptOption[]>([])
  const [selectedDept, setSelectedDept] = useState("")
  const [timeRange, setTimeRange] = useState("30")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    deptApi.list().then((res) => {
      const deps = (res.departments ?? []).map((d: any) => safeDepartment(d))
      setDepartments(deps)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetchAll().then(() => setLastUpdated(new Date())).catch(() => {})
  }, [fetchAll, selectedDept, timeRange])

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="overview" />
      <Topbar />

      {/* Main Content */}
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* Filter Row */}
          <div className="flex items-center gap-2 mb-4">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-8 px-3 bg-[#18181b] border border-[#ffffff14] rounded-md text-[12px] text-[#a1a1aa] focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          {/* KPI Row - 4 equal columns */}
          <section className="mb-5">
            <KPICards overview={overview} loading={loading} />
            {lastUpdated && (
              <span className="text-[10px] text-[#3f3f46] mt-1.5 block">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </section>

          {/* Main Grid: 8 cols departments + 4 cols activity */}
          <section className="grid grid-cols-12 gap-5">
            {/* Departments Table - 8 columns */}
            <div className="col-span-8">
              <DepartmentsTable deptStats={deptStats} loading={loading} />
            </div>

            {/* Activity Feed - 4 columns */}
            <div className="col-span-4">
              <ActivityFeed activities={activities} loading={loading} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
