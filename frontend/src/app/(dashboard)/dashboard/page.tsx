"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import { Activity, Clock, FileCheck, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { DeptStats, ActivityEntry } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore();
  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  if (loading && !overview) {
    return (
      <div className="flex-1 p-8 overflow-x-hidden animate-fade-in">
        <div className="h-8 w-64 bg-bg-elevated rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-bg-elevated rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-[130px] rounded-[12px] bg-bg-elevated animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-[140px] rounded-[12px] bg-bg-elevated animate-pulse" />)}
          </div>
          <div className="h-[400px] rounded-[12px] bg-bg-elevated animate-pulse" />
        </div>
      </div>
    );
  }

  const kpis = overview ? [
    { label: "Total Tasks", value: overview.totalCards, icon: Activity, color: "text-primary" },
    { label: "Overdue", value: overview.overdueCount, icon: Clock, color: "text-danger" },
    { label: "Pending Approvals", value: overview.pendingApprovals, icon: FileCheck, color: "text-warning" },
    { label: "Compliance", value: overview.complianceItems, icon: CheckCircle2, color: "text-accent" },
  ] : [];

  return (
    <div className="flex-1 p-8 overflow-x-hidden animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1 tracking-tight">Organization Overview</h1>
        <p className="text-sm text-text-secondary">Real-time metrics across all departments.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="rounded-[12px] bg-bg-elevated/80 backdrop-blur-xl border border-white/5 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-[9.5px] uppercase tracking-[0.1em] text-text-secondary font-bold">{k.label}</div>
              <div className={cn("p-2 rounded-md bg-white/5", k.color)}>
                <k.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-bold text-text-primary">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: 2/3 departments + 1/3 activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Department Health */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[9.5px] uppercase tracking-[0.1em] text-text-secondary font-bold mb-4">Department Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptStats.map(ds => {
              const { department: d, totalCards, doneCount, overdueCount, memberCount } = ds;
              const pct = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;
              return (
                <Link key={d._id} href={`/dept/${d.slug}`} className="no-underline">
                  <div className="rounded-[12px] bg-bg-elevated/80 backdrop-blur-xl border border-white/5 p-5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_0_1px_rgba(37,99,235,0.3),0_8px_24px_rgba(0,0,0,0.4)] cursor-pointer h-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-semibold text-text-primary">{d.icon} {d.name}</h3>
                      <span className="text-xs text-text-secondary">{memberCount} Members</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Task Progress</span>
                        <span className="text-text-primary">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {overdueCount > 0 && (
                      <div className="mt-4 text-[11px] text-danger flex items-center gap-1.5 bg-danger/10 w-fit px-2 py-1 border border-danger/20 rounded-md">
                        <Clock size={12} /> {overdueCount} Overdue items
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {deptStats.length === 0 && !loading && (
            <div className="rounded-[12px] bg-bg-elevated/80 border border-white/5 p-6 text-center text-sm text-text-muted">
              No departments yet.
            </div>
          )}
        </div>

        {/* Activity Stream */}
        <div>
          <h2 className="text-[9.5px] uppercase tracking-[0.1em] text-text-secondary font-bold mb-4">Activity Stream</h2>
          <div className="rounded-[12px] bg-bg-elevated/80 backdrop-blur-xl border border-white/5 p-0 h-[400px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-6 text-center text-sm text-text-muted">No activity yet.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {activities.map(a => (
                  <div key={a._id} className="p-4 hover:bg-white/5 transition-colors">
                    <p className="text-sm">
                      <span className="font-semibold text-primary">{a.user.name}</span>{" "}
                      <span className="text-text-secondary">
                        {a.action.replace(/_/g, " ")}{" "}
                      </span>
                      <span className="text-text-primary">{a.entityTitle}</span>
                      {a.detail && <span className="text-text-muted"> — {a.detail}</span>}
                    </p>
                    <span className="text-[10px] text-text-muted">{format(new Date(a.createdAt), "MMM d, yyyy")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
