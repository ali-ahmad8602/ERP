"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
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
  Loader2,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Department status labels ────────────────────────────────────────────────
function getDeptStatusLabel(stats: DeptStats) {
  const { totalCards, doneCount, overdueCount, inProgressCount } = stats;
  if (overdueCount > totalCards * 0.2) return "Critical";
  if (inProgressCount > doneCount) return "Active";
  if (doneCount > totalCards * 0.7) return "Scale";
  return "Strategy";
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const { overview, deptStats, activities, loading, fetchAll } =
    useDashboardStore();

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  // Loading state
  if (loading && !overview) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-text-muted font-medium animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const today = new Date();

  return (
    <div className="h-full overflow-auto bg-bg-base/30 p-8 lg:p-10">
      {/* ── Header Row ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-heading font-bold text-text-primary tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-body text-text-secondary">
              {format(today, "EEEE, MMMM d, yyyy")}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-badge)] bg-info/10 text-info text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-info" />
              Org Health: Stable
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <ArrowUpRight size={15} />
            Export Intel
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={15} />
            New Project
          </Button>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <KpiCard
            icon={<ClipboardList size={18} />}
            label="Total Active Tasks"
            value={overview.totalCards}
            trend="+13%"
            trendUp
          />
          <KpiCard
            icon={<AlertTriangle size={18} />}
            label="Overdue Items"
            value={overview.overdueCount}
            trend={overview.overdueCount > 0 ? `${overview.overdueCount}` : "0"}
            trendUp={false}
          />
          <KpiCard
            icon={<Clock size={18} />}
            label="Pending Approvals"
            value={overview.pendingApprovals}
            subtitle="~hourly"
          />
          <KpiCard
            icon={<Shield size={18} />}
            label="Compliance Score"
            value="98%"
            trend="+2%"
            trendUp
          />
        </div>
      )}

      {/* ── Main Content (60/40) ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mb-10">
        {/* Left: Departments Overview */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-subheading font-bold text-text-primary tracking-tight">
              Departments Overview
            </h2>
            <Link
              href="/departments"
              className="text-[11px] font-bold text-primary uppercase tracking-wider hover:underline"
            >
              View All Intel
            </Link>
          </div>

          {deptStats.length === 0 && !loading && (
            <Card className="py-16 text-center text-text-muted text-body flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-bg-base flex items-center justify-center mb-4">
                <Users size={20} className="text-text-secondary" />
              </div>
              <p className="font-medium text-text-primary mb-1">
                No departments found
              </p>
              <p>Create one from the sidebar to get started.</p>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {deptStats.map((ds) => (
              <DeptCard key={ds.department._id} stats={ds} />
            ))}
          </div>
        </div>

        {/* Right: Global Activity */}
        <div className="flex flex-col gap-5">
          <h2 className="text-subheading font-bold text-text-primary tracking-tight">
            Global Activity
          </h2>

          <Card
            padding="none"
            className="max-h-[520px] overflow-auto"
          >
            {activities.length === 0 && (
              <div className="py-16 text-center text-text-muted text-body">
                No activity yet. Start creating cards!
              </div>
            )}
            <div className="divide-y divide-border/50">
              {activities.map((a) => (
                <ActivityRow key={a._id} entry={a} />
              ))}
            </div>
          </Card>

          {activities.length > 0 && (
            <Button variant="ghost" size="sm" className="self-center">
              Load Previous Activity
            </Button>
          )}
        </div>
      </div>

      {/* ── Bottom Section (2 columns) ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quarterly Projection */}
        <div className="rounded-[20px] bg-[#1C1C1E] p-8 text-white shadow-card">
          <h3 className="text-subheading font-bold tracking-tight mb-2">
            Quarterly Projection
          </h3>
          <p className="text-small text-[#86868B] leading-relaxed mb-6">
            Based on current velocity and resource allocation, the team is on
            track to complete 87% of planned deliverables this quarter. Focus
            areas remain compliance and cross-department alignment.
          </p>

          {/* Mini bar chart placeholder */}
          <div className="flex items-end gap-3 h-20 mb-6">
            {[40, 65, 50, 80, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-md bg-white/10"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="primary"
              size="sm"
              className="bg-white text-[#1C1C1E] hover:bg-white/90"
            >
              <Download size={15} />
              Download Analysis
            </Button>
            <Link
              href="/overview"
              className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider hover:text-white transition-colors"
            >
              Current Overview Plan
            </Link>
          </div>
        </div>

        {/* Critical Deadlines */}
        <div>
          <SectionLabel className="mb-4">Critical Deadlines</SectionLabel>

          <div className="flex flex-col gap-3">
            <DeadlineItem
              color="#FF3B30"
              title="Q1 Compliance Audit"
              date="Mar 31, 2026"
              priority="urgent"
            />
            <DeadlineItem
              color="#FF9500"
              title="Product Roadmap Review"
              date="Apr 5, 2026"
              priority="high"
            />
            <DeadlineItem
              color="#0071E3"
              title="Board Presentation Deck"
              date="Apr 10, 2026"
              priority="medium"
            />
            <DeadlineItem
              color="#34C759"
              title="Team Hiring Plan Finalization"
              date="Apr 15, 2026"
              priority="low"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}) {
  return (
    <Card hover className="flex flex-col gap-3">
      <div className="text-text-secondary">{icon}</div>
      <span className="text-[12px] text-text-muted font-semibold uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-end gap-2.5">
        <span className="text-display font-bold text-text-primary tracking-tight leading-none">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-[12px] font-bold px-2 py-0.5 rounded-[var(--radius-badge)]",
              trendUp
                ? "bg-info/10 text-info"
                : "bg-danger/10 text-danger"
            )}
          >
            {trendUp ? "+" : ""}
            {trend.startsWith("+") || trend.startsWith("-") ? trend : trend}
          </span>
        )}
        {subtitle && (
          <span className="text-[12px] text-text-muted font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
}

function DeptCard({ stats }: { stats: DeptStats }) {
  const {
    department: d,
    totalCards,
    doneCount,
    memberCount,
  } = stats;
  const progress = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;
  const statusLabel = getDeptStatusLabel(stats);

  return (
    <Link href={`/dept/${d.slug}`} className="no-underline h-full">
      <Card hover className="h-full flex flex-col gap-4 group">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
              style={{
                backgroundColor: `${d.color}18`,
                color: d.color || "var(--color-text-primary)",
              }}
            >
              {d.icon}
            </div>
            <div>
              <div className="text-body font-bold text-text-primary">
                {d.name}
              </div>
              <div className="text-[12px] text-text-muted">
                {memberCount} Members &middot; {statusLabel}
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-bg-base flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={13} className="text-primary" />
          </div>
        </div>

        {/* Progress */}
        <div>
          <SectionLabel>Tasks Completed</SectionLabel>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${progress}%`,
                  backgroundColor: d.color || "var(--color-primary)",
                }}
              />
            </div>
            <span
              className={cn(
                "text-small font-bold tabular-nums",
                progress === 100 ? "text-info" : "text-text-primary"
              )}
            >
              {progress}%
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const actionLabel = ACTION_LABELS[entry.action] || entry.action;

  return (
    <div className="flex gap-3 px-5 py-4 transition-colors hover:bg-bg-elevated/30">
      <Avatar name={entry.user.name || "?"} size="md" />

      <div className="flex-1 min-w-0">
        <div className="text-small text-text-secondary leading-relaxed">
          <span className="font-bold text-text-primary">
            {entry.user.name}
          </span>{" "}
          {actionLabel}{" "}
          <span className="font-semibold text-primary">
            {entry.entityTitle}
          </span>
          {entry.detail && (
            <span className="text-text-muted"> &mdash; {entry.detail}</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            {formatTimeAgo(entry.createdAt)}
          </span>
          {entry.department && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
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

function DeadlineItem({
  color,
  title,
  date,
  priority,
}: {
  color: string;
  title: string;
  date: string;
  priority: "urgent" | "high" | "medium" | "low";
}) {
  const priorityStyles: Record<string, string> = {
    urgent: "bg-danger/10 text-danger",
    high: "bg-warning/10 text-warning",
    medium: "bg-primary/10 text-primary",
    low: "bg-info/10 text-info",
  };

  return (
    <Card padding="sm" className="flex items-center gap-3">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-body font-semibold text-text-primary truncate">
          {title}
        </div>
        <div className="text-[12px] text-text-muted">{date}</div>
      </div>
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[var(--radius-badge)]",
          priorityStyles[priority]
        )}
      >
        {priority}
      </span>
    </Card>
  );
}
