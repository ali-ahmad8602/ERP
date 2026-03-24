"use client";
import { Search, ChevronRight, Lock, ShieldCheck } from "lucide-react";
import type { Board, Department } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { NotificationBell } from "./NotificationBell";

interface TopbarProps {
  department?: Department;
  board?: Board;
  title?: string;
  onSearchClick?: () => void;
}

export function Topbar({ department, board, title, onSearchClick }: TopbarProps) {
  const { user } = useAuthStore();
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <header style={{
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", borderBottom: "1px solid #1E1E1E",
      background: "#0A0A0A", flexShrink: 0,
    }}>

      {/* Left — breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {department && (
          <>
            <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>
              {department.icon} {department.name}
            </span>
            <ChevronRight size={13} color="#333" />
          </>
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color: "#EBEBEB", letterSpacing: "-0.01em" }}>
          {board?.name ?? title ?? ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: 6 }}>
          {board?.settings.isLocked && (
            <span style={{
              display: "flex", alignItems: "center", gap: 4, padding: "2px 8px",
              borderRadius: 6, background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.2)", fontSize: 11, color: "#F5A623",
            }}>
              <Lock size={9} /> Locked
            </span>
          )}
          {board?.settings.complianceTagging && (
            <span style={{
              display: "flex", alignItems: "center", gap: 4, padding: "2px 8px",
              borderRadius: 6, background: "rgba(4,84,252,0.08)",
              border: "1px solid rgba(4,84,252,0.2)", fontSize: 11, color: "#0454FC",
            }}>
              <ShieldCheck size={9} /> Compliance Mode
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Search trigger */}
        <button onClick={onSearchClick} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#111111", border: "1px solid #222222",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer",
          width: 200, transition: "border-color 0.15s, background 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#333"; (e.currentTarget as HTMLElement).style.background = "#161616"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#222"; (e.currentTarget as HTMLElement).style.background = "#111"; }}
        >
          <Search size={12} color="#444" />
          <span style={{ flex: 1, fontSize: 12, color: "#444", textAlign: "left" }}>Search...</span>
          <div style={{ display: "flex", gap: 2 }}>
            <kbd style={{ fontSize: 9, color: "#333", background: "#1A1A1A", border: "1px solid #2A2A2A", padding: "1px 4px", borderRadius: 3, fontFamily: "monospace" }}>⌘</kbd>
            <kbd style={{ fontSize: 9, color: "#333", background: "#1A1A1A", border: "1px solid #2A2A2A", padding: "1px 4px", borderRadius: 3, fontFamily: "monospace" }}>K</kbd>
          </div>
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: "#1E1E1E" }} />

        {/* Avatar */}
        <button style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "transparent", border: "none", cursor: "pointer",
          padding: "4px 6px", borderRadius: 8,
          transition: "background 0.12s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "#161616")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #0454FC, #3B7BFF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "white",
            letterSpacing: "-0.02em",
          }}>
            {initials}
          </div>
          <span style={{ fontSize: 12, color: "#888", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.name ?? "User"}
          </span>
        </button>
      </div>
    </header>
  );
}
