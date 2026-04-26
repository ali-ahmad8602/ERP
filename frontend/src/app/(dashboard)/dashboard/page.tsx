"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format, isToday as isDateToday, isYesterday } from "date-fns";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuth } from "@/hooks/useAuth";
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  Shield,
  Download,
  Plus,
  ArrowUpRight,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { DeptStats, ActivityEntry } from "@/types";

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

function getDateGroupLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isDateToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDeptStatusLabel(stats: DeptStats) {
  const { totalCards, doneCount, overdueCount, inProgressCount } = stats;
  if (overdueCount > totalCards * 0.2) return "Critical";
  if (inProgressCount > doneCount) return "Active";
  if (doneCount > totalCards * 0.7) return "Scale";
  return "Strategy";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, deptStats, activities, loading, fetchAll } = useDashboardStore();

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  if (loading && !overview) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-6">
          <div className="grid grid-cols-4 gap-4 w-full max-w-xl">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-bg-elevated animate-pulse" />)}
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
            <div className="h-48 rounded-2xl bg-bg-elevated animate-pulse" />
            <div className="h-48 rounded-2xl bg-bg-elevated animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = new Date();

  return (
    <div className="h-full overflow-auto bg-bg-base p-8 animate-fade-in">
      {/* ── Header Row ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight leading-tight">
            {getGreeting()}, {firstName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[13px] text-text-secondary">
              {format(today, "EEEE, MMMM d, yyyy")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-info/10 text-info text-[11px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-info" />
              Stable
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <ArrowUpRight size={14} />
            Export
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={14} />
            New Project
          </Button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            icon={<ClipboardList size={16} />}
            label="Total Active Tasks"
            value={overview.totalCards}
            trend="+13%"
            trendUp
            accent="border-t-2 border-primary"
          />
          <KpiCard
            icon={<AlertTriangle size={16} />}
            label="Overdue Items"
            value={overview.overdueCount}
            trend={overview.overdueCount > 0 ? `${overview.overdueCount}` : "0"}
            trendUp={false}
            accent="border-t-2 border-danger"
          />
          <KpiCard
            icon={<Clock size={16} />}
            label="Pending Approvals"
            value={overview.pendingApprovals}
            subtitle="~hourly"
            accent="border-t-2 border-warning"
          />
          <KpiCard
            icon={<Shield size={16} />}
            label="Compliance Score"
            value="98%"
            trend="+2%"
            trendUp
            accent="border-t-2 border-info"
          />
        </div>
      )}

      {/* ── Main Content (60/40) ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 mb-8">
        {/* Left: Departments Overview */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-text-primary tracking-tight">
              Departments Overview
            </h2>
            <Link
              href="/departments"
              className="text-[11px] font-semibold text-primary uppercase tracking-wider hover:underline no-underline"
            >
              View All
            </Link>
          </div>

          {deptStats.length === 0 && !loading && (
            <Card className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
                <Users size={18} className="text-text-muted" />
              </div>
              <p className="text-[13px] font-semibold text-text-primary mb-1">No departments found</p>
              <p className="text-[12px] text-text-muted">Create one from the sidebar to get started.</p>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deptStats.map((ds) => (
              <DeptCard key={ds.department._id} stats={ds} />
            ))}
          </div>
        </div>

        {/* Right: Global Activity */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[20px] font-bold text-text-primary tracking-tight">
            Global Activity
          </h2>

          <Card padding="none" className="max-h-[520px] overflow-auto">
            {activities.length === 0 && (
              <div className="py-12 text-center text-text-muted text-[13px]">
                No activity yet. Start creating cards!
              </div>
            )}
            <ActivityFeed activities={activities} />
          </Card>

          {activities.length > 0 && (
            <Button variant="ghost" size="sm" className="self-center">
              Load Previous Activity
            </Button>
          )}
        </div>
      </div>

      {/* ── Bottom Section ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Projection */}
        <div className="rounded-[12px] glass-card p-6 shadow-card">
          <h3 className="text-[15px] font-bold text-text-primary tracking-tight mb-1.5">
            Quarterly Projection
          </h3>
          <p className="text-[12px] text-text-muted leading-relaxed mb-5">
            Based on current velocity, the team is on track to complete 87% of planned
            deliverables this quarter.
          </p>

          <div className="flex items-end gap-2 h-16 mb-5">
            {[40, 65, 50, 80, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-md bg-primary/20 dark:bg-white/10"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm">
              <Download size={14} />
              Download
            </Button>
            <Link
              href="/overview"
              className="text-[11px] font-semibold text-text-muted uppercase tracking-wider hover:text-text-primary transition-colors no-underline"
            >
              Overview Plan
            </Link>
          </div>
        </div>

        {/* Critical Deadlines */}
        <div>
          <SectionLabel className="mb-3">Critical Deadlines</SectionLabel>
          <div className="flex flex-col gap-2">
            <DeadlineItem color="#FF3B30" title="Q1 Compliance Audit" date="Mar 31, 2026" priority="urgent" />
            <DeadlineItem color="#FF9500" title="Product Roadmap Review" date="Apr 5, 2026" priority="high" />
            <DeadlineItem color="#0071E3" title="Board Presentation Deck" date="Apr 10, 2026" priority="medium" />
            <DeadlineItem color="#34C759" title="Team Hiring Plan" date="Apr 15, 2026" priority="low" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, trend, trendUp, subtitle, accent }: {
  icon: React.ReactNode; label: string; value: number | string;
  trend?: string; trendUp?: boolean; subtitle?: string; accent?: string;
}) {
  return (
    <Card hover className={cn("flex flex-col gap-2.5", accent)}>
      <div className="text-text-secondary">{icon}</div>
      <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-[28px] font-bold text-text-primary tracking-tight leading-none tabular-nums">{value}</span>
        {trend && (
          <span className={cn(
            "text-[11px] font-semibold px-1.5 py-0.5 rounded-md",
            trendUp ? "bg-info/10 text-info" : "bg-danger/10 text-danger"
          )}>
            {trendUp ? "+" : ""}{trend.startsWith("+") || trend.startsWith("-") ? trend : trend}
          </span>
        )}
        {subtitle && <span className="text-[11px] text-text-muted font-medium">{subtitle}</span>}
      </div>
    </Card>
  );
}

function DeptCard({ stats }: { stats: DeptStats }) {
  const { department: d, totalCards, doneCount, memberCount } = stats;
  const progress = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;
  const statusLabel = getDeptStatusLabel(stats);

  return (
    <Link href={`/dept/${d.slug}`} className="no-underline h-full">
      <Card hover className="h-full flex flex-col gap-3 group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
              style={{ backgroundColor: `${d.color}18`, color: d.color || "var(--color-text-primary)" }}
            >
              {d.icon}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-text-primary">{d.name}</div>
              <div className="text-[12px] text-text-muted">{memberCount} Members &middot; {statusLabel}</div>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-bg-elevated flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={12} className="text-primary" />
          </div>
        </div>

        <div>
          <SectionLabel>Tasks Completed</SectionLabel>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${progress}%`, backgroundColor: d.color || "var(--color-primary)" }}
              />
            </div>
            <span className={cn("text-[12px] font-semibold tabular-nums", progress === 100 ? "text-info" : "text-text-primary")}>
              {progress}%
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ActivityFeed({ activities }: { activities: ActivityEntry[] }) {
  let lastDateLabel = "";

  return (
    <div>
      {activities.map((a) => {
        const dateLabel = getDateGroupLabel(a.createdAt);
        const showHeader = dateLabel !== lastDateLabel;
        lastDateLabel = dateLabel;

        return (
          <div key={a._id}>
            {showHeader && (
              <div className="px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-bg-elevated/40 border-b border-border-subtle">
                {dateLabel}
              </div>
            )}
            <ActivityRow entry={a} />
          </div>
        );
      })}
    </div>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const actionLabel = ACTION_LABELS[entry.action] || entry.action;

  return (
    <div className="flex gap-3 px-4 py-3 transition-colors duration-150 hover:bg-bg-elevated/30 border-b border-border-subtle/50 last:border-0">
      <Avatar name={entry.user.name || "?"} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-text-secondary leading-relaxed">
          <span className="font-semibold text-text-primary">{entry.user.name}</span>{" "}
          <span className="text-text-muted">{actionLabel}</span>{" "}
          <span className="font-medium text-primary">{entry.entityTitle}</span>
          {entry.detail && <span className="text-text-muted"> &mdash; {entry.detail}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] font-medium text-text-muted">{formatTimeAgo(entry.createdAt)}</span>
          {entry.department && (
            <span
              className="text-[10px] px-1.5 py-px rounded-full font-semibold border shrink-0"
              style={{
                color: entry.department.color || "#94A3B8",
                background: `${entry.department.color || "#94A3B8"}1A`,
                borderColor: `${entry.department.color || "#94A3B8"}33`,
              }}
            >
              {entry.department.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DeadlineItem({ color, title, date, priority }: {
  color: string; title: string; date: string; priority: "urgent" | "high" | "medium" | "low";
}) {
  const priorityStyles: Record<string, string> = {
    urgent: "bg-danger/10 text-danger",
    high: "bg-warning/10 text-warning",
    medium: "bg-primary/10 text-primary",
    low: "bg-info/10 text-info",
  };

  return (
    <Card padding="sm" className="flex items-center gap-3">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-text-primary truncate">{title}</div>
        <div className="text-[11px] text-text-muted">{date}</div>
      </div>
      <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md", priorityStyles[priority])}>
        {priority}
      </span>
    </Card>
  );
}
