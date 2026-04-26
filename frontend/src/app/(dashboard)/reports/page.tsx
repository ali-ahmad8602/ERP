"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { DeptStats, OrgOverview } from "@/types";

// ─── SVG Chart Components ───────────────────────────────────────────────────

function StatusDonutChart({ overview }: { overview: OrgOverview }) {
  const total = overview.totalCards || 1;
  const segments = [
    { label: "Done",        count: overview.doneCount,        color: "#34C759" },
    { label: "In Progress", count: overview.inProgressCount,  color: "#0071E3" },
    { label: "Overdue",     count: overview.overdueCount,     color: "#FF3B30" },
    { label: "Other",       count: Math.max(0, total - overview.doneCount - overview.inProgressCount - overview.overdueCount), color: "#86868B" },
  ].filter(s => s.count > 0);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-8">
      <div className="relative shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {segments.map((seg, i) => {
            const pct = seg.count / total;
            const dash = pct * circumference;
            const currentOffset = offset;
            offset += dash;
            return (
              <circle
                key={i}
                cx="90" cy="90" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-bold text-text-primary">{total}</span>
          <span className="text-[11px] text-text-muted font-medium">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[13px] text-text-secondary">{seg.label}</span>
            <span className="text-[13px] font-bold text-text-primary ml-auto tabular-nums">{seg.count}</span>
            <span className="text-[11px] text-text-muted w-10 text-right tabular-nums">
              {Math.round((seg.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeptBarChart({ stats }: { stats: DeptStats[] }) {
  const maxCards = Math.max(...stats.map(d => d.totalCards), 1);

  return (
    <div className="flex flex-col gap-3">
      {stats.map((ds) => {
        const pct = Math.round((ds.totalCards / maxCards) * 100);
        const donePct = ds.totalCards > 0 ? Math.round((ds.doneCount / ds.totalCards) * 100) : 0;
        return (
          <div key={ds.department._id} className="flex items-center gap-3">
            <div className="w-28 shrink-0 flex items-center gap-2 min-w-0">
              <span className="text-[14px]">{ds.department.icon}</span>
              <span className="text-[13px] text-text-primary font-medium truncate">{ds.department.name}</span>
            </div>
            <div className="flex-1 h-7 bg-black/[0.03] dark:bg-white/[0.04] rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700 flex items-center"
                style={{ width: `${pct}%`, backgroundColor: ds.department.color || "var(--color-primary)" }}
              >
                {pct > 20 && (
                  <span className="text-[11px] font-bold text-white ml-2.5">{ds.totalCards} tasks</span>
                )}
              </div>
            </div>
            <span className="text-[12px] text-text-muted w-12 text-right shrink-0 tabular-nums">
              {donePct}% done
            </span>
          </div>
        );
      })}
      {stats.length === 0 && (
        <p className="text-[13px] text-text-muted text-center py-8">No department data available</p>
      )}
    </div>
  );
}

function OverdueBreakdownChart({ stats }: { stats: DeptStats[] }) {
  const withOverdue = stats.filter(d => d.overdueCount > 0);
  const maxOverdue = Math.max(...withOverdue.map(d => d.overdueCount), 1);

  if (withOverdue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <CheckCircle2 size={28} className="text-success" />
        <p className="text-[13px] text-text-muted">No overdue items across departments</p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 h-40">
      {withOverdue.map(ds => {
        const pct = Math.round((ds.overdueCount / maxOverdue) * 100);
        return (
          <div key={ds.department._id} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-[12px] font-bold text-danger tabular-nums">{ds.overdueCount}</span>
            <div className="w-full max-w-[48px] rounded-t-lg bg-danger/20 relative overflow-hidden" style={{ height: `${pct}%` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-danger/60 to-danger/20" />
            </div>
            <span className="text-[10px] text-text-muted font-medium truncate max-w-full">{ds.department.icon}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user } = useAuth();
  const { overview, deptStats, loading, fetchAll } = useDashboardStore();

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  if (loading && !overview) {
    return (
      <div className="h-full overflow-auto bg-bg-base p-6">
        <div className="mb-6">
          <div className="h-7 w-48 bg-bg-elevated animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-72 bg-bg-elevated animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-bg-elevated animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-56 rounded-2xl bg-bg-elevated animate-pulse" />
          <div className="h-56 rounded-2xl bg-bg-elevated animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-bg-base p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={18} className="text-primary" />
          <h1 className="text-[20px] font-bold text-text-primary tracking-tight">Reports & Analytics</h1>
        </div>
        <p className="text-[13px] text-text-secondary">
          Organization-wide insights from real-time task and department data.
        </p>
      </div>

      {/* KPI Row */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            icon={<ClipboardList size={18} />}
            label="Total Tasks"
            value={overview.totalCards}
            detail={`${overview.createdThisWeek} this week`}
          />
          <KpiCard
            icon={<CheckCircle2 size={18} />}
            label="Completed"
            value={overview.doneCount}
            detail={overview.totalCards > 0 ? `${Math.round((overview.doneCount / overview.totalCards) * 100)}% completion` : "0%"}
            accent="success"
          />
          <KpiCard
            icon={<AlertTriangle size={18} />}
            label="Overdue"
            value={overview.overdueCount}
            detail={overview.overdueCount > 0 ? "Needs attention" : "All clear"}
            accent={overview.overdueCount > 0 ? "danger" : "success"}
          />
          <KpiCard
            icon={<Clock size={18} />}
            label="Pending Approvals"
            value={overview.pendingApprovals}
            detail={`${overview.complianceItems} compliance items`}
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tasks by Status */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-[16px] font-bold text-text-primary tracking-tight">Tasks by Status</h2>
          </div>
          {overview ? (
            <StatusDonutChart overview={overview} />
          ) : (
            <p className="text-[13px] text-text-muted">No data available</p>
          )}
        </Card>

        {/* Tasks by Department */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-6">
            <Users size={16} className="text-primary" />
            <h2 className="text-[16px] font-bold text-text-primary tracking-tight">Tasks by Department</h2>
          </div>
          <DeptBarChart stats={deptStats} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overdue Breakdown */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={16} className="text-danger" />
            <h2 className="text-[16px] font-bold text-text-primary tracking-tight">Overdue by Department</h2>
          </div>
          <OverdueBreakdownChart stats={deptStats} />
        </Card>

        {/* Completion Summary */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={16} className="text-primary" />
            <h2 className="text-[16px] font-bold text-text-primary tracking-tight">Department Health</h2>
          </div>
          <div className="flex flex-col gap-3">
            {deptStats.map(ds => {
              const pct = ds.totalCards > 0 ? Math.round((ds.doneCount / ds.totalCards) * 100) : 0;
              const status = ds.overdueCount > ds.totalCards * 0.2
                ? "critical"
                : pct > 70
                  ? "healthy"
                  : "active";
              return (
                <div key={ds.department._id} className="flex items-center gap-3 py-2 border-b border-border-subtle last:border-0">
                  <span className="text-[14px]">{ds.department.icon}</span>
                  <span className="text-[13px] font-medium text-text-primary flex-1">{ds.department.name}</span>
                  <div className="w-24 h-2 bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: status === "critical" ? "#FF3B30" : status === "healthy" ? "#34C759" : "#0071E3",
                      }}
                    />
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    status === "critical" && "bg-danger/10 text-danger",
                    status === "healthy" && "bg-success/10 text-success",
                    status === "active" && "bg-info/10 text-info",
                  )}>
                    {status}
                  </span>
                </div>
              );
            })}
            {deptStats.length === 0 && (
              <p className="text-[13px] text-text-muted text-center py-8">No departments found</p>
            )}
          </div>
        </Card>
      </div>

      {/* Monthly Overview */}
      {overview && (
        <Card padding="lg">
          <h2 className="text-[16px] font-bold text-text-primary tracking-tight mb-5">Monthly Snapshot</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <StatBlock label="Created This Month" value={overview.createdThisMonth} />
            <StatBlock label="Created This Week" value={overview.createdThisWeek} />
            <StatBlock label="In Progress" value={overview.inProgressCount} />
            <StatBlock label="Compliance Items" value={overview.complianceItems} />
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail?: string;
  accent?: "success" | "danger";
}) {
  return (
    <Card hover className="flex flex-col gap-3">
      <div className="text-text-secondary">{icon}</div>
      <span className="text-[12px] text-text-muted font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-[28px] font-bold text-text-primary tracking-tight leading-none tabular-nums">{value}</span>
      {detail && (
        <span className={cn(
          "text-[12px] font-medium",
          accent === "success" && "text-success",
          accent === "danger" && "text-danger",
          !accent && "text-text-muted",
        )}>
          {detail}
        </span>
      )}
    </Card>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[28px] font-bold text-text-primary tabular-nums">{value}</div>
      <div className="text-[12px] text-text-muted font-medium mt-1">{label}</div>
    </div>
  );
}
