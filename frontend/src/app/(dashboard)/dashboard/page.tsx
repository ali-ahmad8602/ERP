"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format, isToday as isDateToday, isYesterday } from "date-fns";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { DeptStats, ActivityEntry } from "@/types";

const ACTIONS: Record<string, string> = {
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
  const dy = Math.floor(h / 24); if (dy < 7) return `${dy}d`;
  return format(new Date(d), "MMM d");
}

function dayGroup(d: string) {
  const dt = new Date(d);
  if (isDateToday(dt)) return "Today";
  if (isYesterday(dt)) return "Yesterday";
  return format(dt, "MMM d");
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore();
  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  if (loading && !overview) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-[1280px] mx-auto p-6">
          <div className="h-4 w-36 bg-bg-elevated rounded animate-pulse mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-[120px] rounded-lg bg-bg-elevated animate-pulse" />)}
          </div>
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-[100px] rounded-lg bg-bg-elevated animate-pulse" />)}
            </div>
            <div className="col-span-4 h-[400px] rounded-lg bg-bg-elevated animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const name = user?.name?.split(" ")[0] ?? "there";
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-[1280px] mx-auto p-6">

        {/* Header — tight, left-aligned */}
        <div className="mb-6">
          <h1 className="text-[15px] font-semibold text-text-primary">{greeting}, {name}</h1>
          <p className="text-[11px] text-text-muted mt-1">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>

        {/* KPI row — fixed height, vertically centered */}
        {overview && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Kpi label="Tasks" val={overview.totalCards} sub={`${overview.createdThisWeek} this week`} icon={<ListTodo size={15} />} />
            <Kpi label="Overdue" val={overview.overdueCount} sub={overview.overdueCount > 0 ? "Needs attention" : "Clear"} icon={<AlertTriangle size={15} />} accent={overview.overdueCount > 0 ? "text-danger" : undefined} />
            <Kpi label="Approvals" val={overview.pendingApprovals} sub={`${overview.complianceItems} compliance`} icon={<Clock size={15} />} />
            <Kpi label="Done" val={overview.doneCount} sub={overview.totalCards > 0 ? `${Math.round((overview.doneCount / overview.totalCards) * 100)}% complete` : "—"} icon={<CheckCircle2 size={15} />} accent="text-accent" />
          </div>
        )}

        {/* Main — 12-col: 8 content + 4 activity */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left col: departments */}
          <div className="col-span-8">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-4">Departments</p>
            {deptStats.length === 0 && !loading && (
              <div className="rounded-lg border border-border bg-bg-surface p-4 text-[12px] text-text-muted text-center">
                No departments yet
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {deptStats.map(ds => <DeptCard key={ds.department._id} stats={ds} />)}
            </div>
          </div>

          {/* Right col: activity — contained panel */}
          <div className="col-span-4">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-4">Activity</p>
            <div className="rounded-lg border border-border bg-bg-surface overflow-hidden">
              <div className="max-h-[480px] overflow-auto">
                {activities.length === 0 ? (
                  <div className="p-4 text-center text-[12px] text-text-muted">No activity yet</div>
                ) : (
                  <Feed items={activities} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── KPI Card: h-[120px], flex-col justify-center, p-4 ── */
function Kpi({ label, val, sub, icon, accent }: {
  label: string; val: number; sub: string; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className="h-[120px] rounded-lg border border-border bg-bg-surface p-4 flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-bg-elevated flex items-center justify-center text-text-muted shrink-0">{icon}</div>
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <span className={cn("text-[24px] font-semibold tabular-nums leading-none", accent || "text-text-primary")}>{val}</span>
      <p className="text-[11px] text-text-muted mt-1">{sub}</p>
    </div>
  );
}

/* ── Department card ── */
function DeptCard({ stats }: { stats: DeptStats }) {
  const { department: d, totalCards, doneCount, memberCount, overdueCount, inProgressCount } = stats;
  const pct = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;
  const st = overdueCount > totalCards * 0.2
    ? { t: "At risk", c: "text-danger" }
    : inProgressCount > doneCount
      ? { t: "Active", c: "text-primary" }
      : doneCount > totalCards * 0.7
        ? { t: "On track", c: "text-accent" }
        : { t: "Planning", c: "text-text-muted" };

  return (
    <Link href={`/dept/${d.slug}`} className="no-underline">
      <div className="rounded-lg border border-border bg-bg-surface p-4 transition-colors duration-150 hover:border-text-muted/30">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">{d.icon}</span>
          <span className="text-[13px] font-medium text-text-primary truncate flex-1">{d.name}</span>
          <span className={cn("text-[10px] font-medium shrink-0", st.c)}>{st.t}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1 bg-bg-elevated rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color || "var(--color-primary)" }} />
          </div>
          <span className="text-[10px] text-text-muted tabular-nums w-8 text-right">{pct}%</span>
        </div>
        <p className="text-[11px] text-text-muted">{memberCount} members &middot; {totalCards} tasks</p>
      </div>
    </Link>
  );
}

/* ── Activity feed — inside bordered container ── */
function Feed({ items }: { items: ActivityEntry[] }) {
  let prev = "";
  return (
    <div>
      {items.map(a => {
        const g = dayGroup(a.createdAt);
        const hdr = g !== prev;
        prev = g;
        return (
          <div key={a._id}>
            {hdr && (
              <div className="px-4 py-2 text-[10px] font-medium text-text-muted uppercase tracking-wider bg-bg-elevated/50 border-b border-border">
                {g}
              </div>
            )}
            <div className="flex gap-3 px-4 py-3 border-b border-border-subtle">
              <Avatar name={a.user.name || "?"} size="xs" className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] leading-[1.6]">
                  <span className="font-medium text-text-primary">{a.user.name}</span>{" "}
                  <span className="text-text-muted">{ACTIONS[a.action] || a.action}</span>{" "}
                  <span className="font-medium text-text-secondary">{a.entityTitle}</span>
                </p>
                <span className="text-[10px] text-text-muted">{ago(a.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
