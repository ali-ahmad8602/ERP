"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import { CheckSquare, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { DepartmentCard } from "@/components/dashboard/department-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import type { DeptStats } from "@/types";

function getStatus(s: DeptStats): "at-risk" | "active" | "on-track" | "planning" {
  const { totalCards, doneCount, overdueCount, inProgressCount } = s;
  if (overdueCount > totalCards * 0.2) return "at-risk";
  if (inProgressCount > doneCount) return "active";
  if (doneCount > totalCards * 0.7) return "on-track";
  return "planning";
}

function getCurrentDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore();

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  // Skeleton
  if (loading && !overview) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1120px] mx-auto p-5">
          <div className="mb-5">
            <div className="h-4 w-24 bg-[#18181B] rounded animate-pulse mb-1" />
            <div className="h-3 w-40 bg-[#18181B] rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[1,2,3,4].map(i => <div key={i} className="h-[88px] bg-[#0F0F11] border border-[#ffffff10] rounded-lg animate-pulse" />)}
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-[96px] bg-[#0F0F11] border border-[#ffffff10] rounded-lg animate-pulse" />)}
            </div>
            <div className="col-span-4 h-[360px] bg-[#0F0F11] border border-[#ffffff10] rounded-lg animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // Build KPI data from real backend
  const kpiData = overview ? [
    {
      icon: CheckSquare,
      label: "Total Tasks",
      value: overview.totalCards.toLocaleString(),
      trend: { value: `${overview.createdThisWeek}`, positive: true },
      subtitle: "this week",
      sparklineData: [0, 0, 0, 0, 0, overview.createdThisWeek, overview.totalCards],
    },
    {
      icon: AlertCircle,
      label: "Overdue",
      value: overview.overdueCount.toString(),
      trend: overview.overdueCount > 0 ? { value: `${overview.overdueCount}`, positive: false } : undefined,
      subtitle: overview.overdueCount > 0 ? "needs attention" : "all clear",
      sparklineData: [0, 0, 0, 0, 0, 0, overview.overdueCount],
    },
    {
      icon: Clock,
      label: "Pending Approvals",
      value: overview.pendingApprovals.toString(),
      subtitle: "awaiting review",
      sparklineData: [0, 0, 0, 0, 0, 0, overview.pendingApprovals],
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: overview.doneCount.toLocaleString(),
      trend: overview.totalCards > 0
        ? { value: `${Math.round((overview.doneCount / overview.totalCards) * 100)}%`, positive: true }
        : undefined,
      subtitle: "completion rate",
      sparklineData: [0, 0, 0, 0, 0, 0, overview.doneCount],
    },
  ] : [];

  // Build department data from real backend
  const departmentCards = deptStats.map(ds => {
    const { department: d, totalCards, doneCount, memberCount } = ds;
    const pct = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;
    return {
      emoji: d.icon || "📁",
      name: d.name,
      slug: d.slug,
      status: getStatus(ds),
      progress: pct,
      members: memberCount,
    };
  });

  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-[1120px] mx-auto p-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[16px] font-semibold text-[#FAFAFA]">Overview</h1>
          <p className="text-[11px] text-[#52525B] mt-0.5">{getCurrentDate()}</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {kpiData.map(kpi => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Departments - 8 columns */}
          <div className="col-span-8">
            <div className="mb-3">
              <h2 className="text-[13px] font-medium text-[#FAFAFA]">Departments</h2>
            </div>
            {departmentCards.length === 0 && (
              <div className="bg-[#0F0F11] border border-[#ffffff10] rounded-lg p-6 text-center text-[12px] text-[#52525B]">
                No departments yet
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {departmentCards.map(dept => (
                <DepartmentCard key={dept.slug} {...dept} />
              ))}
            </div>
          </div>

          {/* Activity Feed - 4 columns */}
          <div className="col-span-4">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </main>
  );
}
