"use client";
import { cn, PRIORITY_CONFIG, type Priority } from "@/lib/utils";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const c = PRIORITY_CONFIG[priority];
  if (priority === "none") return null;
  return (
    <span className={cn("inline-flex items-center h-5 px-1.5 rounded-[4px] text-[10px] font-semibold", className)}
      style={{ color: c.color, background: `${c.color}14`, border: `1px solid ${c.color}20` }}>
      {c.label}
    </span>
  );
}

export function Badge({ children, color = "#8B8B93", className }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center h-5 px-1.5 rounded-[4px] text-[10px] font-semibold", className)}
      style={{ color, background: `${color}14`, border: `1px solid ${color}20` }}>
      {children}
    </span>
  );
}
