"use client";
import { cn, PRIORITY_CONFIG, type Priority } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  if (priority === "none") return null;
  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold border", className)}
      style={{ color: config.color, background: `${config.color}15`, borderColor: `${config.color}20` }}
    >
      {config.label}
    </span>
  );
}

export function Badge({ children, color = "#888888", className }: {
  children: React.ReactNode; color?: string; className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold border", className)}
      style={{ color, background: `${color}15`, borderColor: `${color}20` }}
    >
      {children}
    </span>
  );
}
