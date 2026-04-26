"use client";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-5 h-5 text-[8px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-7 h-7 text-[11px]",
  lg: "w-9 h-9 text-[13px]",
};

function getAvatarColor(name: string) {
  const colors = ["#6366F1","#8B5CF6","#EC4899","#F43F5E","#F97316","#EAB308","#22C55E","#14B8A6","#0EA5E9","#3B82F6"];
  return colors[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length];
}

export function Avatar({ name, size = "sm", className }: AvatarProps) {
  const initial = name[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={cn("rounded-full shrink-0 flex items-center justify-center font-semibold text-white", sizeClasses[size], className)}
      style={{ backgroundColor: getAvatarColor(name) }}
      title={name}
    >
      {initial}
    </div>
  );
}

interface AvatarGroupProps {
  users: { _id: string; name: string }[];
  max?: number;
  size?: AvatarProps["size"];
}

export function AvatarGroup({ users, max = 3, size = "xs" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  return (
    <div className="flex">
      {visible.map((u, i) => (
        <Avatar key={u._id} name={u.name} size={size} className={cn("ring-2 ring-bg-base", i > 0 && "-ml-1")} />
      ))}
      {overflow > 0 && (
        <div className={cn("rounded-full shrink-0 flex items-center justify-center bg-bg-elevated ring-2 ring-bg-base text-text-muted font-medium -ml-1", sizeClasses[size])}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
