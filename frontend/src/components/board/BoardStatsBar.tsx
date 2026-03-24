"use client";
import { AlertCircle, Clock, Zap, CheckCircle2, LayoutList } from "lucide-react";
import { isPast, isToday } from "date-fns";
import type { Card, Column } from "@/types";

interface BoardStatsBarProps {
  cards: Card[];
  columns: Column[];
}

export function BoardStatsBar({ cards, columns }: BoardStatsBarProps) {
  const active = cards;
  const doneCol = columns.find(c => c.name.toLowerCase() === "done");
  const inProgressCol = columns.find(c => c.name.toLowerCase().includes("progress"));

  const total      = active.length;
  const done       = doneCol   ? active.filter(c => c.column === doneCol._id).length   : 0;
  const inProgress = inProgressCol ? active.filter(c => c.column === inProgressCol._id).length : 0;
  const overdue    = active.filter(c => c.dueDate && isPast(new Date(c.dueDate)) && !isToday(new Date(c.dueDate))).length;
  const compliance = active.filter(c => c.isComplianceTagged).length;
  const pendingApproval = active.filter(c => c.approval?.required && c.approval.status === "pending").length;

  const stats = [
    { icon: <LayoutList size={12} />,  label: "Total",       value: total,         color: "#666666" },
    { icon: <Zap size={12} />,         label: "In Progress", value: inProgress,    color: "#0454FC" },
    { icon: <CheckCircle2 size={12} />,label: "Done",        value: done,          color: "#00E5A0" },
    { icon: <Clock size={12} />,       label: "Overdue",     value: overdue,       color: overdue > 0 ? "#FF4444" : "#444444" },
    { icon: <AlertCircle size={12} />, label: "Needs Approval", value: pendingApproval, color: pendingApproval > 0 ? "#F5A623" : "#444444" },
    ...(compliance > 0 ? [{ icon: <AlertCircle size={12} />, label: "Compliance", value: compliance, color: "#F5A623" }] : []),
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 0,
      padding: "0 20px", height: 36,
      background: "#090909", borderBottom: "1px solid #1E1E1E",
      overflowX: "auto", flexShrink: 0,
    }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
          {i > 0 && (
            <div style={{ width: 1, height: 14, background: "#2A2A2A", margin: "0 12px" }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: s.color }}>
            {s.icon}
            <span style={{ fontSize: 12, fontWeight: 600, color: s.value > 0 || s.label === "Total" ? s.color : "#333" }}>
              {s.value}
            </span>
            <span style={{ fontSize: 11, color: "#444444", whiteSpace: "nowrap" }}>{s.label}</span>
          </div>
        </div>
      ))}

      {/* Progress bar: done / total */}
      {total > 0 && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 4, background: "#1A1A1A", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              width: `${Math.round((done / total) * 100)}%`,
              height: "100%", background: "#00E5A0",
              borderRadius: 4, transition: "width 0.4s ease",
            }} />
          </div>
          <span style={{ fontSize: 11, color: "#444444", whiteSpace: "nowrap" }}>
            {Math.round((done / total) * 100)}% complete
          </span>
        </div>
      )}
    </div>
  );
}
