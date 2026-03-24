"use client";
import { Search, ChevronRight, Lock, ShieldCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import type { Board, Department } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "./NotificationBell";

interface TopbarProps {
  department?: Department;
  board?: Board;
  title?: string;
  onSearchClick?: () => void;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-btn flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export function Topbar({ department, board, title, onSearchClick }: TopbarProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-border-subtle bg-bg-base shrink-0">

      {/* Left — breadcrumb */}
      <div className="flex items-center gap-[5px]">
        {department && (
          <>
            <span className="text-[13px] text-text-muted font-medium">
              {department.icon} {department.name}
            </span>
            <ChevronRight size={13} className="text-text-muted" />
          </>
        )}
        <span className="text-[13px] font-semibold text-text-primary tracking-tight">
          {board?.name ?? title ?? ""}
        </span>
        <div className="flex items-center gap-[5px] ml-1.5">
          {board?.settings.isLocked && (
            <span className="flex items-center gap-1 py-0.5 px-2 rounded-badge bg-warning/[0.08] border border-warning/20 text-[11px] text-warning">
              <Lock size={9} /> Locked
            </span>
          )}
          {board?.settings.complianceTagging && (
            <span className="flex items-center gap-1 py-0.5 px-2 rounded-badge bg-primary-ghost border border-primary/20 text-[11px] text-primary">
              <ShieldCheck size={9} /> Compliance Mode
            </span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Search trigger */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-btn py-1.5 px-3 cursor-pointer w-[200px] transition-colors hover:border-border hover:bg-bg-elevated"
        >
          <Search size={12} className="text-text-muted" />
          <span className="flex-1 text-xs text-text-muted text-left">Search...</span>
          <div className="flex gap-0.5">
            <kbd className="text-[9px] text-text-muted bg-bg-elevated border border-border px-1 rounded font-mono">⌘</kbd>
            <kbd className="text-[9px] text-text-muted bg-bg-elevated border border-border px-1 rounded font-mono">K</kbd>
          </div>
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="w-px h-[18px] bg-border-subtle" />

        {/* Avatar */}
        <button className="flex items-center gap-2 bg-transparent border-none cursor-pointer py-1 px-1.5 rounded-btn transition-colors hover:bg-bg-elevated">
          <Avatar name={user?.name ?? "User"} size="md" />
          <span className="text-xs text-text-secondary max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
            {user?.name ?? "User"}
          </span>
        </button>
      </div>
    </header>
  );
}
