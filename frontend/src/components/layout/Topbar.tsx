"use client";
import { Search, Lock, ShieldCheck, Sun, Moon, ChevronRight, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { Board, Department } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "./NotificationBell";

interface TopbarProps { department?: Department; board?: Board; title?: string; onSearchClick?: () => void; onCommandPalette?: () => void; }

export function Topbar({ department, board, title, onSearchClick, onCommandPalette }: TopbarProps) {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const search = onCommandPalette ?? onSearchClick;

  return (
    <header className="h-12 flex items-center px-4 border-b border-border bg-bg-surface shrink-0 sticky top-0 z-20">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {department && (
          <>
            <span className="text-[12px] text-text-muted truncate">{department.name}</span>
            <ChevronRight size={10} className="text-text-muted shrink-0" />
          </>
        )}
        <span className="text-[13px] font-medium text-text-primary truncate">{board?.name ?? title ?? ""}</span>
        {board?.settings.isLocked && <span className="ml-2 text-[10px] text-warning bg-warning/8 border border-warning/16 px-1.5 h-5 inline-flex items-center rounded-[4px]"><Lock size={9} className="mr-0.5" />Locked</span>}
        {board?.settings.complianceTagging && <span className="ml-1 text-[10px] text-primary bg-primary/8 border border-primary/16 px-1.5 h-5 inline-flex items-center rounded-[4px]"><ShieldCheck size={9} className="mr-0.5" />Compliance</span>}
      </div>

      {/* Center: search */}
      {search && (
        <button onClick={search} className="flex items-center gap-1.5 bg-bg-elevated border border-border rounded-[6px] h-7 px-2.5 w-[240px] shrink-0 transition-colors duration-100 cursor-pointer hover:border-text-muted/30">
          <Search size={12} className="text-text-muted" />
          <span className="text-[12px] text-text-muted flex-1 text-left truncate">Search...</span>
          <kbd className="text-[10px] text-text-muted font-mono bg-bg-surface px-1 rounded border border-border-subtle leading-none py-px">⌘K</kbd>
        </button>
      )}

      {/* Right: actions */}
      <div className="flex items-center gap-1 ml-3 shrink-0">
        <NotificationBell />
        {search && (
          <button onClick={search} className="h-7 px-2 rounded-[6px] flex items-center gap-1 bg-primary text-white text-[12px] font-medium hover:bg-primary-dark transition-colors duration-100 cursor-pointer border-none shadow-xs">
            <Plus size={12} /> New
          </button>
        )}
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-6 h-6 rounded-[4px] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer bg-transparent border-none">
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>
        <Avatar name={user?.name ?? "U"} size="sm" />
      </div>
    </header>
  );
}
