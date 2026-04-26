"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format, isToday as isDateToday, isYesterday } from "date-fns";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, AlertTriangle, Clock, Shield, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { DeptStats, ActivityEntry } from "@/types";

const ACTION_LABELS: Record<string, string> = {
  card_created: "created", card_edited: "edited", card_moved: "moved",
  card_archived: "archived", comment_added: "commented on", card_approved: "approved",
  card_rejected: "rejected", board_created: "created board", board_updated: "updated board",
  member_added: "added member to", member_removed: "removed member from",
};

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return format(new Date(dateStr), "MMM d");
}

function dateGroup(dateStr: string) {
  const d = new Date(dateStr);
  if (isDateToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

function deptStatus(s: DeptStats) {
  if (s.overdueCount > s.totalCards * 0.2) return { label: "At risk", color: "text-danger" };
  if (s.inProgressCount > s.doneCount) return { label: "Active", color: "text-primary" };
  if (s.doneCount > s.totalCards * 0.7) return { label: "On track", color: "text-accent" };
  return { label: "Planning", color: "text-text-muted" };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore();

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  if (loading && !overview) {
    return (
      <div className="h-full overflow-auto bg-bg-base">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          <div className="h-6 w-48 bg-bg-elevated animate-pulse rounded mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-[10px] bg-bg-elevated animate-pulse" />)}</div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-[10px] bg-bg-elevated animate-pulse" />)}</div>
            <div className="col-span-4 h-80 rounded-[10px] bg-bg-elevated animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="h-full overflow-auto bg-bg-base">
      <div className="max-w-[1280px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, {firstName}</h1>
            <p className="text-[12px] text-text-muted mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
          <Button variant="secondary" size="sm"><ArrowUpRight size={13} /> Export</Button>
        </div>

        {/* KPIs — fixed height, centered content */}
        {overview && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <KpiCard icon={<ClipboardList size={15} />} label="Total Tasks" value={overview.totalCards} sub={`${overview.createdThisWeek} this week`} />
            <KpiCard icon={<AlertTriangle size={15} />} label="Overdue" value={overview.overdueCount} sub={overview.overdueCount > 0 ? "Needs attention" : "All clear"} variant={overview.overdueCount > 0 ? "danger" : undefined} />
            <KpiCard icon={<Clock size={15} />} label="Approvals" value={overview.pendingApprovals} sub={`${overview.complianceItems} compliance`} />
            <KpiCard icon={<Shield size={15} />} label="Done" value={overview.doneCount} sub={overview.totalCards > 0 ? `${Math.round((overview.doneCount / overview.totalCards) * 100)}% complete` : "0%"} variant="accent" />
          </div>
        )}

        {/* Main — 12-col grid: 8 left + 4 right */}
        <div className="grid grid-cols-12 gap-6">
          {/* Departments — col 1-8 */}
          <div className="col-span-8">
            <h2 className="text-[13px] font-semibold text-text-primary mb-4">Departments</h2>
            {deptStats.length === 0 && !loading && (
              <Card className="py-8 text-center"><p className="text-[13px] text-text-muted">No departments yet</p></Card>
            )}
            <div className="grid grid-cols-2 gap-4">
              {deptStats.map(ds => <DeptCard key={ds.department._id} stats={ds} />)}
            </div>
          </div>

          {/* Activity — col 9-12 */}
          <div className="col-span-4">
            <h2 className="text-[13px] font-semibold text-text-primary mb-4">Activity</h2>
            <div className="bg-bg-surface border border-border rounded-[10px] overflow-hidden">
              <div className="max-h-[520px] overflow-auto">
                {activities.length === 0 && <div className="py-8 text-center text-[12px] text-text-muted">No activity yet</div>}
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── KPI Card: fixed height, vertically centered ── */
function KpiCard({ icon, label, value, sub, variant }: {
  icon: React.ReactNode; label: string; value: number | string; sub?: string; variant?: "danger" | "accent";
}) {
  return (
    <div className="h-[88px] bg-bg-surface border border-border rounded-[10px] shadow-card px-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0 text-text-muted">{icon}</div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-xl font-semibold tabular-nums leading-none", variant === "danger" ? "text-danger" : variant === "accent" ? "text-accent" : "text-text-primary")}>{value}</span>
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{label}</span>
        </div>
        {sub && <p className="text-[10px] text-text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Dept Card ── */
function DeptCard({ stats }: { stats: DeptStats }) {
  const { department: d, totalCards, doneCount, memberCount } = stats;
  const pct = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;
  const status = deptStatus(stats);
  return (
    <Link href={`/dept/${d.slug}`} className="no-underline">
      <Card hover className="group">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[14px]">{d.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-text-primary truncate">{d.name}</div>
            <div className="text-[11px] text-text-muted">{memberCount} members</div>
          </div>
          <span className={cn("text-[10px] font-medium", status.color)}>{status.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, backgroundColor: d.color || "var(--color-primary)" }} />
          </div>
          <span className="text-[11px] font-medium text-text-secondary tabular-nums">{pct}%</span>
        </div>
      </Card>
    </Link>
  );
}

/* ── Activity Feed ── */
function ActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  let lastGroup = "";
  return (
    <div>
      {activities.map(a => {
        const group = dateGroup(a.createdAt);
        const showHeader = group !== lastGroup;
        lastGroup = group;
        return (
          <div key={a._id}>
            {showHeader && <div className="px-4 py-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-bg-elevated/50 border-y border-border">{group}</div>}
            <div className="flex gap-3 px-4 py-3 border-b border-border-subtle hover:bg-bg-elevated/20 transition-colors duration-100">
              <Avatar name={a.user.name || "?"} size="sm" className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] leading-[1.6]">
                  <span className="font-medium text-text-primary">{a.user.name}</span>{" "}
                  <span className="text-text-muted">{ACTION_LABELS[a.action] || a.action}</span>{" "}
                  <span className="font-medium text-primary">{a.entityTitle}</span>
                  {a.detail && <span className="text-text-muted"> — {a.detail}</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-muted">{timeAgo(a.createdAt)}</span>
                  {a.department && <span className="text-[10px] text-text-muted">{a.department.name}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
