"use client";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { NotificationPanel } from "./NotificationPanel";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { unreadCount } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          "relative w-8 h-8 rounded-btn flex items-center justify-center",
          "border-none cursor-pointer transition-colors",
          "hover:bg-bg-elevated hover:text-text-secondary",
          open
            ? "bg-bg-elevated text-text-primary"
            : "bg-transparent text-text-muted"
        )}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
