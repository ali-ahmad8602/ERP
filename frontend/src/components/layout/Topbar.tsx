"use client";
import {
  Search,
  Lock,
  ShieldCheck,
  Sun,
  Moon,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { Board, Department } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "./NotificationBell";

interface TopbarProps {
  department?: Department;
  board?: Board;
  title?: string;
  onSearchClick?: () => void;
  onCommandPalette?: () => void;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all duration-200 cursor-pointer bg-transparent border-none"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export function Topbar({ department, board, title, onSearchClick, onCommandPalette }: TopbarProps) {
  const { user } = useAuthStore();
  const handleSearchClick = onCommandPalette ?? onSearchClick;

  return (
    <header className="h-[56px] flex items-center justify-between px-5 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
      {/* ── Left: Breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 min-w-0">
        {department && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
              <span style={{ color: department.color }}>{department.icon}</span>
              {department.name}
            </span>
            <ChevronRight size={11} className="text-text-muted" />
          </div>
        )}
        <span className="text-sm font-semibold text-text-primary tracking-tight truncate">
          {board?.name ?? title ?? ""}
        </span>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {board?.settings.isLocked && (
            <span className="flex items-center gap-1 py-0.5 px-2 rounded-[6px] bg-warning/15 text-[10px] font-semibold text-warning border border-warning/20">
              <Lock size={10} /> Locked
            </span>
          )}
          {board?.settings.complianceTagging && (
            <span className="flex items-center gap-1 py-0.5 px-2 rounded-[6px] bg-primary/15 text-[10px] font-semibold text-primary border border-primary/20">
              <ShieldCheck size={10} /> Compliance
            </span>
          )}
        </div>
      </div>

      {/* ── Center: Search Bar ─────────────────────────────────────────── */}
      <button
        onClick={handleSearchClick}
        className="flex items-center gap-2 bg-bg-elevated border border-border rounded-[8px] py-1.5 px-3 w-[36%] max-w-[360px] min-w-[180px] transition-all duration-200 cursor-pointer hover:border-[#333]"
      >
        <Search size={14} className="text-[#888] shrink-0" />
        <span className="flex-1 text-xs text-[#555] text-left truncate">
          Search tasks, boards, members...
        </span>
        <kbd className="text-[10px] text-text-muted font-mono bg-bg-surface px-1.5 py-0.5 rounded leading-none border border-border-subtle">
          ⌘K
        </kbd>
      </button>

      {/* ── Right: Actions ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <NotificationBell />

        {handleSearchClick && (
          <button
            onClick={handleSearchClick}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center bg-primary text-white hover:bg-primary-light transition-all duration-200 cursor-pointer border-none shadow-sm"
            title="Quick Action"
          >
            <Zap size={14} />
          </button>
        )}

        <div className="w-px h-5 bg-border-subtle mx-0.5" />

        <ThemeToggle />

        <button className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-transparent border-none p-0 transition-transform duration-200 hover:scale-105">
          <Avatar name={user?.name ?? "User"} size="md" />
        </button>
      </div>
    </header>
  );
}
