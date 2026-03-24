"use client";
import { isPast, isToday } from "date-fns";
import type { Card, Column } from "@/types";

interface BoardStatsBarProps {
  cards: Card[];
  columns: Column[];
}

export function BoardStatsBar({ cards, columns }: BoardStatsBarProps) {
  const doneCol = columns.find(c => c.name.toLowerCase() === "done");
  const inProgressCol = columns.find(c => c.name.toLowerCase().includes("progress"));
  const blockedCol = columns.find(c => c.name.toLowerCase().includes("block"));

  const todoColumns = columns.filter(c => {
    const n = c.name.toLowerCase();
    return n === "ideas" || n === "backlog" || n === "to do" || n === "todo";
  });

  const todoCount = todoColumns.reduce(
    (sum, col) => sum + cards.filter(c => c.column === col._id).length,
    0
  );
  const inProgressCount = inProgressCol ? cards.filter(c => c.column === inProgressCol._id).length : 0;
  const doneCount = doneCol ? cards.filter(c => c.column === doneCol._id).length : 0;
  const blockedCount = blockedCol
    ? cards.filter(c => c.column === blockedCol._id).length
    : cards.filter(c => c.dueDate && isPast(new Date(c.dueDate)) && !isToday(new Date(c.dueDate))).length;

  const stats = [
    { dot: "bg-[#86868B]", label: "To Do",        count: todoCount },
    { dot: "bg-[#0071E3]", label: "In Progress",  count: inProgressCount },
    { dot: "bg-[#34C759]", label: "Done",          count: doneCount },
    { dot: "bg-[#FF3B30]", label: "Blocked",       count: blockedCount },
  ];

  return (
    <div className="flex items-center gap-5 px-6 py-2 shrink-0">
      {stats.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className="text-[13px] text-text-secondary">
            <span className="font-semibold text-text-primary">{s.count}</span>
            {" "}{s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
