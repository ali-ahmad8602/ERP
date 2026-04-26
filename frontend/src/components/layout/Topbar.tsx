"use client";
import { Search, Lock, ShieldCheck, Sun, Moon, ChevronRight, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { Board, Department } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "./NotificationBell";

interface TopbarProps { department?: Department; board?: Board; title?: string; onSearchClick?: () => void; onCommandPalette?: () => void; }

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150 cursor-pointer bg-transparent border-none"
      aria-label="Toggle theme">
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

export function Topbar({ department, board, title, onSearchClick, onCommandPalette }: TopbarProps) {
  const { user } = useAuthStore();
  const handleSearchClick = onCommandPalette ?? onSearchClick;

  return (
    <header className="h-14 flex items-center gap-3 px-6 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 min-w-0 shrink-0">
        {department && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[12px] text-text-muted">{department.name}</span>
            <ChevronRight size={10} className="text-text-muted" />
          </div>
        )}
        <span className="text-[13px] font-medium text-text-primary truncate">{board?.name ?? title ?? ""}</span>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {board?.settings.isLocked && (
            <span className="flex items-center gap-1 py-px px-1.5 rounded text-[10px] font-medium text-warning bg-warning/10"><Lock size={9} /> Locked</span>
          )}
          {board?.settings.complianceTagging && (
            <span className="flex items-center gap-1 py-px px-1.5 rounded text-[10px] font-medium text-primary bg-primary/10"><ShieldCheck size={9} /> Compliance</span>
          )}
        </div>
      </div>

      {/* Search */}
      <button onClick={handleSearchClick}
        className="flex items-center gap-2 bg-bg-elevated border border-border rounded-[8px] py-1.5 px-3 w-64 shrink-0 transition-colors duration-200 cursor-pointer hover:border-[#333]">
        <Search size={13} className="text-text-muted shrink-0" />
        <span className="flex-1 text-[12px] text-text-muted text-left truncate">Search...</span>
        <kbd className="text-[10px] text-text-muted font-mono bg-bg-surface px-1 py-px rounded border border-border-subtle">⌘K</kbd>
      </button>

      <div className="flex-1" />
      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <NotificationBell />
        {handleSearchClick && (
          <button onClick={handleSearchClick}
            className="h-8 px-3 rounded-[6px] flex items-center gap-1.5 bg-primary text-white text-[12px] font-medium hover:bg-primary-light transition-all duration-150 cursor-pointer border-none shadow-sm hover:-translate-y-px"
            title="New Task">
            <Plus size={13} /> New
          </button>
        )}
        <div className="w-px h-4 bg-border mx-1" />
        <ThemeToggle />
        <Avatar name={user?.name ?? "User"} size="sm" />
      </div>
    </header>
  );
}
