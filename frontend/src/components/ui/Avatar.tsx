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
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

function getAvatarColor(name: string) {
  const hue = (name.charCodeAt(0) * 37) % 360;
  return `hsl(${hue}, 45%, 40%)`;
}

export function Avatar({ name, size = "sm", className }: AvatarProps) {
  const initial = name[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-bold text-white border border-white/10",
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
          className={cn("border-2 border-bg-base", i > 0 && "-ml-1.5")}
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full shrink-0 flex items-center justify-center",
            "bg-bg-elevated border-2 border-bg-base text-text-muted font-semibold -ml-1.5",
            sizeClasses[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
