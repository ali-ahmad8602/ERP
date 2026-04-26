"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { DeptStats, ActivityEntry } from "@/types";

const ACT: Record<string, string> = {
  card_created: "created", card_edited: "edited", card_moved: "moved",
  card_archived: "archived", comment_added: "commented on",
  card_approved: "approved", card_rejected: "rejected",
  board_created: "created board", board_updated: "updated board",
  member_added: "added member to", member_removed: "removed member from",
};

function ago(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "now"; if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const dy = Math.floor(h / 24); return dy < 7 ? `${dy}d` : format(new Date(d), "MMM d");
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview: o, deptStats, activities, loading, fetchAll } = useDashboardStore();
  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  /* Skeleton */
  if (loading && !o) return (
    <div className="p-6 max-w-[1120px] mx-auto animate-fade-in">
      <div className="h-5 w-40 bg-bg-elevated rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-4 gap-3 mb-6">{[1,2,3,4].map(i=><div key={i} className="h-[76px] rounded-[8px] bg-bg-elevated animate-pulse"/>)}</div>
      <div className="grid grid-cols-12 gap-4"><div className="col-span-8 h-[280px] rounded-[8px] bg-bg-elevated animate-pulse"/><div className="col-span-4 h-[280px] rounded-[8px] bg-bg-elevated animate-pulse"/></div>
    </div>
  );

  const kpis = o ? [
    { label: "Total tasks",  value: o.totalCards,       icon: TrendingUp,    color: "text-primary" },
    { label: "Overdue",      value: o.overdueCount,     icon: AlertTriangle, color: o.overdueCount > 0 ? "text-danger" : "text-text-muted" },
    { label: "Approvals",    value: o.pendingApprovals, icon: Clock,         color: "text-warning" },
    { label: "Completed",    value: o.doneCount,        icon: CheckCircle2,  color: "text-accent" },
  ] : [];

  return (
    <div className="p-6 max-w-[1120px] mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[16px] font-semibold text-text-primary tracking-tight">Overview</h1>
          <p className="text-[11px] text-text-muted mt-0.5">{format(new Date(), "EEEE, MMM d yyyy")}</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {kpis.map(k => (
          <Card key={k.label} padding="sm" glass>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-text-muted font-medium">{k.label}</span>
              <k.icon size={13} className={k.color} />
            </div>
            <span className={cn("text-[22px] font-semibold tabular-nums leading-none", k.color === "text-text-muted" ? "text-text-primary" : k.color)}>{k.value}</span>
          </Card>
        ))}
      </div>

      {/* Main: 8/4 split */}
      <div className="grid grid-cols-12 gap-4">

        {/* Departments — col 1-8 */}
        <div className="col-span-8">
          <div className="text-[11px] font-medium text-text-muted uppercase tracking-[0.04em] mb-3">Departments</div>
          {deptStats.length === 0 && (
            <Card padding="lg" className="text-center text-[12px] text-text-muted">No departments yet</Card>
          )}
          <div className="grid grid-cols-2 gap-3">
            {deptStats.map(ds => <DeptRow key={ds.department._id} s={ds} />)}
          </div>
        </div>

        {/* Activity — col 9-12 */}
        <div className="col-span-4">
          <div className="text-[11px] font-medium text-text-muted uppercase tracking-[0.04em] mb-3">Activity</div>
          <Card padding="none" glass className="max-h-[420px] overflow-auto">
            {activities.length === 0
              ? <div className="p-4 text-center text-[12px] text-text-muted">No activity yet</div>
              : <div className="divide-y divide-border">{activities.map(a => <ActivityRow key={a._id} a={a} />)}</div>
            }
          </Card>
        </div>
      </div>
    </div>
  );
}

function DeptRow({ s }: { s: DeptStats }) {
  const { department: d, totalCards, doneCount, overdueCount, memberCount } = s;
  const pct = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;
  return (
    <Link href={`/dept/${d.slug}`} className="no-underline">
      <Card hover padding="sm" glass>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[14px]">{d.icon}</span>
            <span className="text-[13px] font-medium text-text-primary truncate">{d.name}</span>
          </div>
          <span className="text-[10px] text-text-muted shrink-0">{memberCount} mbr</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-1 bg-bg-base rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-text-muted tabular-nums w-7 text-right">{pct}%</span>
        </div>
        {overdueCount > 0 && (
          <div className="mt-2 text-[10px] text-danger flex items-center gap-1">
            <AlertTriangle size={10} /> {overdueCount} overdue
          </div>
        )}
      </Card>
    </Link>
  );
}

function ActivityRow({ a }: { a: ActivityEntry }) {
  return (
    <div className="flex gap-2 px-3 py-2.5 hover:bg-bg-elevated/50 transition-colors duration-100">
      <Avatar name={a.user.name || "?"} size="xs" className="mt-px shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] leading-[1.5]">
          <span className="font-medium text-text-primary">{a.user.name}</span>{" "}
          <span className="text-text-muted">{ACT[a.action] || a.action}</span>{" "}
          <span className="text-text-secondary">{a.entityTitle}</span>
        </p>
        <span className="text-[10px] text-text-muted">{ago(a.createdAt)}</span>
      </div>
    </div>
  );
}
