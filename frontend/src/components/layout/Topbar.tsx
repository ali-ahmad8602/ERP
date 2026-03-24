"use client";
import {
  Search,
  Lock,
  ShieldCheck,
  Sun,
  Moon,
  ChevronRight,
  LayoutGrid,
  HelpCircle,
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
      className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 cursor-pointer bg-transparent border-none"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function Topbar({
  department,
  board,
  title,
  onSearchClick,
  onCommandPalette,
}: TopbarProps) {
  const { user } = useAuthStore();

  const handleSearchClick = onCommandPalette ?? onSearchClick;

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-20 shrink-0">
      {/* ── Left: Breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 min-w-0">
        {department && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[13px] text-text-secondary font-medium flex items-center gap-1.5">
              <span style={{ color: department.color }}>{department.icon}</span>
              {department.name}
            </span>
            <ChevronRight size={12} className="text-text-muted" />
          </div>
        )}
        <span className="text-[14px] font-semibold text-text-primary tracking-tight truncate">
          {board?.name ?? title ?? ""}
        </span>

        {/* Badges */}
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {board?.settings.isLocked && (
            <span className="flex items-center gap-1 py-0.5 px-2 rounded-full bg-warning/10 text-[10px] font-medium text-warning">
              <Lock size={10} /> Locked
            </span>
          )}
          {board?.settings.complianceTagging && (
            <span className="flex items-center gap-1 py-0.5 px-2 rounded-full bg-primary/10 text-[10px] font-medium text-primary">
              <ShieldCheck size={10} /> Compliance
            </span>
          )}
        </div>
      </div>

      {/* ── Center: Search Bar ─────────────────────────────────────────── */}
      <button
        onClick={handleSearchClick}
        className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] rounded-full py-1.5 px-4 w-[40%] max-w-[420px] min-w-[200px] transition-colors duration-150 cursor-pointer border-none"
      >
        <Search size={14} className="text-text-muted shrink-0" />
        <span className="flex-1 text-[13px] text-text-muted text-left truncate">
          Search resources, files, and tasks...
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          <kbd className="text-[10px] text-text-muted/60 font-mono bg-black/[0.04] dark:bg-white/[0.08] rounded px-1 py-0.5 leading-none">
            ⌘
          </kbd>
          <kbd className="text-[10px] text-text-muted/60 font-mono bg-black/[0.04] dark:bg-white/[0.08] rounded px-1 py-0.5 leading-none">
            K
          </kbd>
        </div>
      </button>

      {/* ── Right: Actions ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <NotificationBell />

        {/* Apps grid button */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 cursor-pointer bg-transparent border-none"
          aria-label="Apps"
        >
          <LayoutGrid size={16} />
        </button>

        {/* Help button */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-150 cursor-pointer bg-transparent border-none"
          aria-label="Help"
        >
          <HelpCircle size={16} />
        </button>

        {/* Quick Action button */}
        <button className="flex items-center gap-1.5 bg-primary text-white text-[12px] font-semibold rounded-full px-3.5 py-1.5 hover:bg-primary-light active:scale-[0.97] transition-all duration-150 cursor-pointer border-none shadow-sm">
          <Zap size={12} />
          Quick Action
        </button>

        <div className="w-px h-5 bg-border-subtle mx-0.5" />

        <ThemeToggle />

        {/* User avatar */}
        <button className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-transparent border-none p-0 transition-transform duration-150 hover:scale-105">
          <Avatar name={user?.name ?? "User"} size="md" />
        </button>
      </div>
    </header>
  );
}
