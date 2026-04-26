"use client";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-7 h-7 text-[11px]",
  lg: "w-8 h-8 text-[12px]",
};

const palette = ["#6366F1","#8B5CF6","#EC4899","#EF4444","#F97316","#EAB308","#22C55E","#14B8A6","#06B6D4","#3B82F6"];

function color(n: string) { return palette[(n.charCodeAt(0) + (n.charCodeAt(1) || 0)) % palette.length]; }

export function Avatar({ name, size = "sm", className }: AvatarProps) {
  return (
    <div className={cn("rounded-full shrink-0 flex items-center justify-center font-semibold text-white", sizes[size], className)}
      style={{ backgroundColor: color(name) }} title={name}>
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export function AvatarGroup({ users, max = 3, size = "xs" }: { users: { _id: string; name: string }[]; max?: number; size?: AvatarProps["size"] }) {
  const vis = users.slice(0, max);
  const over = users.length - max;
  return (
    <div className="flex">
      {vis.map((u, i) => <Avatar key={u._id} name={u.name} size={size} className={cn("ring-2 ring-bg-base", i > 0 && "-ml-1")} />)}
      {over > 0 && <div className={cn("rounded-full shrink-0 flex items-center justify-center bg-bg-elevated ring-2 ring-bg-base text-text-muted font-medium -ml-1", sizes[size])}>+{over}</div>}
    </div>
  );
}
