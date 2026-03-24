"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard, Clock, AlertTriangle, CheckCircle2, Shield,
  TrendingUp, Users, ArrowRight, Loader2,
} from "lucide-react";
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
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", background: "#080808" }}>
        <Loader2 size={24} color="#0454FC" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "auto", background: "#080808", padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <LayoutDashboard size={18} color="#0454FC" />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#F3F3F3", letterSpacing: "-0.02em" }}>Dashboard</h1>
        </div>
        <p style={{ fontSize: 13, color: "#555" }}>
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Here&apos;s your organization overview.
        </p>
      </div>

      {/* KPI Row */}
      {overview && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 10, marginBottom: 28 }}>
          <KpiCard label="Total Tasks" value={overview.totalCards} icon={<TrendingUp size={14} />} color="#0454FC" />
          <KpiCard label="In Progress" value={overview.inProgressCount} icon={<Clock size={14} />} color="#F5A623" />
          <KpiCard label="Overdue" value={overview.overdueCount} icon={<AlertTriangle size={14} />} color="#FF4444" />
          <KpiCard label="Pending Approval" value={overview.pendingApprovals} icon={<Clock size={14} />} color="#A855F7" />
          <KpiCard label="Completed" value={overview.doneCount} icon={<CheckCircle2 size={14} />} color="#22C55E" />
          <KpiCard label="Compliance" value={overview.complianceItems} icon={<Shield size={14} />} color="#0EA5E9" />
        </div>
      )}

      {/* Two-column layout: Departments + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, minHeight: 0 }}>
        {/* Department Cards */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Departments</h2>
            <span style={{ fontSize: 11, color: "#444" }}>{deptStats.length} total</span>
          </div>

          {deptStats.length === 0 && !loading && (
            <div style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 13, background: "#0C0C0C", borderRadius: 12, border: "1px solid #1A1A1A" }}>
              No departments yet. Create one from the sidebar.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {deptStats.map(ds => (
              <DeptCard key={ds.department._id} stats={ds} />
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Recent Activity</h2>

          <div style={{
            background: "#0C0C0C", border: "1px solid #1A1A1A", borderRadius: 12,
            maxHeight: 520, overflow: "auto",
          }}>
            {activities.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "#444", fontSize: 13 }}>
                No activity yet. Start creating cards!
              </div>
            )}
            {activities.map((a, i) => (
              <ActivityRow key={a._id} entry={a} isLast={i === activities.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: "#0C0C0C", border: "1px solid #1A1A1A", borderRadius: 12,
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center",
          color,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#F3F3F3", letterSpacing: "-0.03em" }}>
        {value}
      </div>
    </div>
  );
}

function DeptCard({ stats }: { stats: DeptStats }) {
  const { department: d, totalCards, doneCount, inProgressCount, overdueCount, memberCount } = stats;
  const progress = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

  return (
    <Link href={`/dept/${d.slug}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#0C0C0C", border: "1px solid #1A1A1A", borderRadius: 12,
        padding: "16px 18px", cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.background = "#0F0F0F"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1A1A"; e.currentTarget.style.background = "#0C0C0C"; }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `${d.color}18`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>
              {d.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#E0E0E0" }}>{d.name}</div>
              <div style={{ fontSize: 11, color: "#444", display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={10} /> {memberCount} members
              </div>
            </div>
          </div>
          <ArrowRight size={14} color="#333" />
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#555" }}>{doneCount}/{totalCards} completed</span>
            <span style={{ fontSize: 11, color: progress === 100 ? "#22C55E" : "#555", fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: 4, background: "#1A1A1A", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, transition: "width 0.3s",
              width: `${progress}%`,
              background: progress === 100 ? "#22C55E" : d.color || "#0454FC",
            }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12 }}>
          <StatPill label="In Progress" value={inProgressCount} color="#F5A623" />
          {overdueCount > 0 && <StatPill label="Overdue" value={overdueCount} color="#FF4444" />}
        </div>
      </div>
    </Link>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {value} {label}
    </div>
  );
}

function ActivityRow({ entry, isLast }: { entry: ActivityEntry; isLast: boolean }) {
  const actionLabel = ACTION_LABELS[entry.action] || entry.action;

  return (
    <div style={{
      display: "flex", gap: 10, padding: "12px 16px",
      borderBottom: isLast ? "none" : "1px solid #141414",
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 600, color: "#666",
      }}>
        {entry.user.name?.charAt(0).toUpperCase() || "?"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#AAAAAA", lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600, color: "#D0D0D0" }}>{entry.user.name}</span>
          {" "}{actionLabel}{" "}
          <span style={{ fontWeight: 500, color: "#D0D0D0" }}>{entry.entityTitle}</span>
          {entry.detail && (
            <span style={{ color: "#555" }}> &mdash; {entry.detail}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: 10, color: "#444" }}>{formatTimeAgo(entry.createdAt)}</span>
          {entry.department && (
            <span style={{ fontSize: 10, color: entry.department.color || "#444", background: `${entry.department.color || "#444"}14`, padding: "1px 6px", borderRadius: 4 }}>
              {entry.department.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
