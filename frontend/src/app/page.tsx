"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { DepartmentsTable } from "@/components/dashboard/departments-table"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { useAuth } from "@/hooks/useAuth"
import { useDashboardStore } from "@/store/dashboard.store"

export default function Dashboard() {
  useAuth({ required: true })

  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Sidebar activeRoute="overview" />
      <Topbar />

      {/* Main Content */}
      <main className="ml-[220px] pt-12">
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          {/* KPI Row - 4 equal columns */}
          <section className="mb-5">
            <KPICards overview={overview} loading={loading} />
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
