"use client";
import { Search, Bell, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { NotificationBell } from "./NotificationBell";
import type { Board, Department } from "@/types";

interface TopbarProps {
  department?: Department;
  board?: Board;
  title?: string;
  onSearchClick?: () => void;
  onCommandPalette?: () => void;
}

export function Topbar({ onSearchClick, onCommandPalette }: TopbarProps) {
  const { user } = useAuthStore();
  const search = onCommandPalette ?? onSearchClick;

  return (
    <header className="fixed top-0 left-[220px] right-0 h-12 border-b border-[#ffffff08] bg-[#0A0A0B] z-10">
      <div className="h-full px-5 flex items-center justify-between">
        {/* Search */}
        <button
          onClick={search}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#18181B] rounded-md border border-[#27272A] w-[320px] cursor-pointer transition-colors hover:border-[#3F3F46]"
        >
          <Search className="w-3.5 h-3.5 text-[#52525B]" strokeWidth={1.5} />
          <span className="flex-1 text-[12px] text-[#52525B] text-left">Search...</span>
          <kbd className="text-[10px] text-[#52525B] px-1.5 py-0.5 bg-[#09090B] rounded border border-[#27272A]">⌘K</kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button className="p-2 rounded-md hover:bg-[#18181B] transition-colors cursor-pointer bg-transparent border-none">
            <Settings className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
          </button>
          <div className="ml-2 w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center">
            <span className="text-[11px] font-medium text-[#A1A1AA]">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
