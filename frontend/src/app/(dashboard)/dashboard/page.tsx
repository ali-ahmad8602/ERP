"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard, Clock, AlertTriangle, CheckCircle2, Shield,
  TrendingUp, Users, ArrowRight, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";
import type { DeptStats, ActivityEntry } from "@/types";

// ─── Action label map ────────────────────────────────────────────────────────
const ACTION_LABELS: Record<string, string> = {
  card_created: "created a card",
  card_edited: "edited a card",
  card_moved: "moved a card",
  card_archived: "archived a card",
  comment_added: "commented on",
  card_approved: "approved",
  card_rejected: "rejected",
  board_created: "created a board",
  board_updated: "updated a board",
  member_added: "added a member",
  member_removed: "removed a member",
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore();

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  if (loading && !overview) {
    return (
      <div className="flex h-full items-center justify-center bg-bg-base">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-bg-base p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <LayoutDashboard size={18} className="text-primary" />
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Dashboard</h1>
        </div>
        <p className="text-[13px] text-text-muted">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Here&apos;s your organization overview.
        </p>
      </div>

      {/* KPI Row */}
      {overview && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] gap-2.5 mb-7">
          <KpiCard label="Total Tasks" value={overview.totalCards} icon={<TrendingUp size={14} />} color="#0454FC" />
          <KpiCard label="In Progress" value={overview.inProgressCount} icon={<Clock size={14} />} color="#F5A623" />
          <KpiCard label="Overdue" value={overview.overdueCount} icon={<AlertTriangle size={14} />} color="#FF4444" />
          <KpiCard label="Pending Approval" value={overview.pendingApprovals} icon={<Clock size={14} />} color="#A855F7" />
          <KpiCard label="Completed" value={overview.doneCount} icon={<CheckCircle2 size={14} />} color="#22C55E" />
          <KpiCard label="Compliance" value={overview.complianceItems} icon={<Shield size={14} />} color="#0EA5E9" />
        </div>
      )}

      {/* Two-column layout: Departments + Activity */}
      <div className="grid grid-cols-[1fr_380px] gap-5 min-h-0">
        {/* Department Cards */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <SectionLabel className="mb-0">Departments</SectionLabel>
            <span className="text-[11px] text-text-muted">{deptStats.length} total</span>
          </div>

          {deptStats.length === 0 && !loading && (
            <Card className="py-10 text-center text-text-muted text-[13px]">
              No departments yet. Create one from the sidebar.
            </Card>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2.5">
            {deptStats.map(ds => (
              <DeptCard key={ds.department._id} stats={ds} />
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <SectionLabel className="mb-3.5">Recent Activity</SectionLabel>

          <Card padding="none" className="max-h-[520px] overflow-auto">
            {activities.length === 0 && (
              <div className="py-10 text-center text-text-muted text-[13px]">
                No activity yet. Start creating cards!
              </div>
            )}
            {activities.map((a, i) => (
              <ActivityRow key={a._id} entry={a} isLast={i === activities.length - 1} />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center"
          style={{ background: `${color}14`, color }}
        >
          {icon}
        </div>
        <span className="text-[11px] text-text-muted uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="text-[26px] font-bold text-text-primary tracking-tight">
        {value}
      </div>
    </Card>
  );
}

function DeptCard({ stats }: { stats: DeptStats }) {
  const { department: d, totalCards, doneCount, inProgressCount, overdueCount, memberCount } = stats;
  const progress = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

  return (
    <Link href={`/dept/${d.slug}`} className="no-underline">
      <Card hover>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-sm"
              style={{ background: `${d.color}18` }}
            >
              {d.icon}
            </div>
            <div>
              <div className="text-sm font-semibold text-text-primary">{d.name}</div>
              <div className="text-[11px] text-text-muted flex items-center gap-1">
                <Users size={10} /> {memberCount} members
              </div>
            </div>
          </div>
          <ArrowRight size={14} className="text-text-muted" />
        </div>

        {/* Progress bar */}
        <div className="mb-2.5">
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-text-muted">{doneCount}/{totalCards} completed</span>
            <span className={cn(
              "text-[11px] font-semibold",
              progress === 100 ? "text-accent" : "text-text-muted"
            )}>{progress}%</span>
          </div>
          <div className="h-1 bg-bg-elevated rounded overflow-hidden">
            <div
              className="h-full rounded transition-[width] duration-300"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? "#22C55E" : d.color || "#0454FC",
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3">
          <StatPill label="In Progress" value={inProgressCount} color="#F5A623" />
          {overdueCount > 0 && <StatPill label="Overdue" value={overdueCount} color="#FF4444" />}
        </div>
      </Card>
    </Link>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {value} {label}
    </div>
  );
}

function ActivityRow({ entry, isLast }: { entry: ActivityEntry; isLast: boolean }) {
  const actionLabel = ACTION_LABELS[entry.action] || entry.action;

  return (
    <div className={cn(
      "flex gap-2.5 px-4 py-3",
      !isLast && "border-b border-border-subtle"
    )}>
      {/* Avatar */}
      <Avatar name={entry.user.name || "?"} size="md" />

      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-secondary leading-relaxed">
          <span className="font-semibold text-text-primary">{entry.user.name}</span>
          {" "}{actionLabel}{" "}
          <span className="font-medium text-text-primary">{entry.entityTitle}</span>
          {entry.detail && (
            <span className="text-text-muted"> &mdash; {entry.detail}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-text-muted">{formatTimeAgo(entry.createdAt)}</span>
          {entry.department && (
            <span
              className="text-[10px] px-1.5 py-px rounded"
              style={{ color: entry.department.color || "#444", background: `${entry.department.color || "#444"}14` }}
            >
              {entry.department.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
