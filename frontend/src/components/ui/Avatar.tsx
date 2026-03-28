"use client";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "w-5 h-5 text-[8px]",
  sm: "w-[22px] h-[22px] text-[9px]",
  md: "w-7 h-7 text-[11px]",
  lg: "w-9 h-9 text-[13px]",
};

function getAvatarColor(name: string) {
  const hue = (name.charCodeAt(0) * 37) % 360;
  return `hsl(${hue}, 50%, 35%)`;
}

export function Avatar({ name, size = "sm", className }: AvatarProps) {
  const initial = name[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-bold text-white",
        sizeClasses[size],
        className
      )}
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
        <Avatar
          key={u._id}
          name={u.name}
          size={size}
          className={cn("border-2 border-bg-surface", i > 0 && "-ml-1.5")}
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full shrink-0 flex items-center justify-center",
            "bg-bg-elevated border-2 border-bg-surface text-text-muted font-semibold -ml-1.5",
            sizeClasses[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
