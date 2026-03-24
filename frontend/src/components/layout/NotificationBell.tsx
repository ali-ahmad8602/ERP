"use client";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/notification.store";
import { NotificationPanel } from "./NotificationPanel";

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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
          background: open ? "#1A1A1A" : "transparent",
          color: open ? "#D0D0D0" : "#555",
          transition: "background 0.12s, color 0.12s",
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = "#141414"; e.currentTarget.style.color = "#888"; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; } }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <div style={{
            position: "absolute", top: 3, right: 3,
            minWidth: 15, height: 15, borderRadius: 10,
            background: "#FF4444", color: "white",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", lineHeight: 1,
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
