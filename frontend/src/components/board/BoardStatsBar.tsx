"use client";
import { AlertCircle, Clock, Zap, CheckCircle2, LayoutList } from "lucide-react";
import { isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
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
    <div className="flex items-center px-5 h-9 bg-bg-base border-b border-border-subtle overflow-x-auto shrink-0">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center">
          {i > 0 && (
            <div className="w-px h-3.5 bg-border mx-3" />
          )}
          <div className="flex items-center gap-[5px]" style={{ color: s.color }}>
            {s.icon}
            <span
              className="text-[12px] font-semibold"
              style={{ color: s.value > 0 || s.label === "Total" ? s.color : "#333" }}
            >
              {s.value}
            </span>
            <span className="text-[11px] text-text-muted whitespace-nowrap">{s.label}</span>
          </div>
        </div>
      ))}

      {/* Progress bar: done / total */}
      {total > 0 && (
        <div className="ml-auto flex items-center gap-2">
          <div className="w-20 h-1 bg-bg-elevated rounded overflow-hidden">
            <div
              className="h-full bg-success rounded transition-[width] duration-400 ease-out"
              style={{ width: `${Math.round((done / total) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-text-muted whitespace-nowrap">
            {Math.round((done / total) * 100)}% complete
          </span>
        </div>
      )}
    </div>
  );
}
