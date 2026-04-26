"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, LayoutGrid, Users, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card, Board, Department } from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  cards?: Card[];
  boards?: Board[];
  departments?: Department[];
  onSelectCard?: (card: Card) => void;
  onNewCard?: () => void;
  onNewBoard?: () => void;
  onInvite?: () => void;
}

interface ResultItem {
  id: string;
  type: "action" | "card" | "board" | "department";
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

const QUICK_ACTIONS: { icon: React.ReactNode; label: string; shortcut: string }[] = [
  { icon: <Plus size={14} />,       label: "New Card",       shortcut: "N" },
  { icon: <LayoutGrid size={14} />, label: "New Board",      shortcut: "B" },
  { icon: <Users size={14} />,      label: "Invite Member",  shortcut: "I" },
];

export function CommandPalette({ open, onClose, cards = [], boards = [], departments = [], onSelectCard, onNewCard, onNewBoard, onInvite }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  // Build flat list for keyboard navigation — all filtering inside useMemo for stable deps
  const flatItems: ResultItem[] = useMemo(() => {
    const items: ResultItem[] = [];

    const matchedCards = q
      ? cards.filter(c => c.title.toLowerCase().includes(q)).slice(0, 5)
      : cards.slice(0, 4);

    const matchedBoards = q
      ? boards.filter(b => b.name.toLowerCase().includes(q)).slice(0, 3)
      : boards.slice(0, 3);

    const matchedDepts = q
      ? departments.filter(d => d.name.toLowerCase().includes(q)).slice(0, 3)
      : [];

    // Quick actions when no query
    if (!q) {
      const actionHandlers: Record<string, (() => void) | undefined> = {
        "New Card": onNewCard,
        "New Board": onNewBoard,
        "Invite Member": onInvite,
      };
      QUICK_ACTIONS.forEach(a => {
        const handler = actionHandlers[a.label];
        items.push({
          id: `action-${a.label}`,
          type: "action",
          label: a.label,
          icon: <span className="text-primary">{a.icon}</span>,
          shortcut: a.shortcut,
          onSelect: () => { handler?.(); onClose(); },
        });
      });
    }

    // Cards (tasks)
    matchedCards.forEach(card => {
      const priorityLabel = card.priority !== "none" ? card.priority.charAt(0).toUpperCase() + card.priority.slice(1) + " Priority" : "";
      const sub = [priorityLabel].filter(Boolean).join(" \u00B7 ");
      items.push({
        id: card._id,
        type: "card",
        label: card.title,
        sublabel: sub || undefined,
        icon: <CheckCircle2 size={15} className="text-info" />,
        onSelect: () => { onSelectCard?.(card); onClose(); },
      });
    });

    // Boards
    matchedBoards.forEach(board => {
      items.push({
        id: board._id,
        type: "board",
        label: board.name,
        sublabel: `${board.columns?.length ?? 0} Columns`,
        icon: <LayoutGrid size={15} className="text-text-muted" />,
        onSelect: onClose,
      });
    });

    // Departments (people section)
    matchedDepts.forEach(dept => {
      items.push({
        id: dept._id,
        type: "department",
        label: dept.name,
        sublabel: `${dept.members?.length ?? 0} Members`,
        icon: <span className="text-[14px]">{dept.icon}</span>,
        onSelect: onClose,
      });
    });

    return items;
  }, [q, cards, boards, departments, onClose, onSelectCard, onNewCard, onNewBoard, onInvite]);

  // Clamp selectedIndex
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(flatItems.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatItems.length) % Math.max(flatItems.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatItems[selectedIndex]?.onSelect();
    }
  }, [flatItems, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const hasResults = flatItems.length > 0;

  if (!open) return null;

  // Group items by type for rendering with section headers
  let currentIndex = 0;

  const renderSection = (type: ResultItem["type"], label: string, items: ResultItem[]) => {
    if (items.length === 0) return null;
    const section = (
      <div key={type}>
        <div className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
          {label}
        </div>
        {items.map(item => {
          const idx = currentIndex++;
          return (
            <button
              key={item.id}
              data-index={idx}
              onClick={item.onSelect}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 bg-transparent border-none cursor-pointer text-left transition-colors",
                selectedIndex === idx ? "bg-primary-ghost" : "hover:bg-bg-elevated"
              )}
            >
              <span className="shrink-0 w-6 flex justify-center">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-medium text-text-primary block truncate">
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="text-[12px] text-text-muted block truncate">
                    {item.sublabel}
                  </span>
                )}
              </div>
              {item.shortcut && (
                <kbd className="text-[10px] text-text-muted bg-bg-elevated border border-border px-1.5 py-0.5 rounded font-mono shrink-0">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </div>
    );
    return section;
  };

  const actionItems = flatItems.filter(i => i.type === "action");
  const cardItems = flatItems.filter(i => i.type === "card");
  const boardItems = flatItems.filter(i => i.type === "board");
  const deptItems = flatItems.filter(i => i.type === "department");

  // Reset currentIndex for rendering
  currentIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-fade-in"
      />

      {/* Palette */}
      <div
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[520px] bg-[#151515]/95 border border-white/5 rounded-[14px] z-[101] shadow-modal animate-fade-up overflow-hidden"
        onKeyDown={handleKeyDown}
      >

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search organization..."
            className="flex-1 bg-transparent border-none outline-none text-[16px] text-text-primary placeholder:text-text-muted"
          />
          <kbd className="text-[11px] text-text-muted bg-bg-elevated border border-border px-2 py-0.5 rounded-md font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="overflow-y-auto max-h-[360px]">
          {/* Render grouped sections */}
          {renderSection("action", "Quick Actions", actionItems)}
          {renderSection("card", "Tasks", cardItems)}
          {renderSection("board", "Boards", boardItems)}
          {renderSection("department", "People", deptItems)}

          {/* No results */}
          {q && !hasResults && (
            <div className="px-4 py-10 text-center">
              <Search size={28} className="text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-[14px] text-text-muted">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[12px] text-text-muted mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-5 py-2.5 border-t border-border-subtle flex gap-5 items-center">
          {([
            ["\u2191\u2193", "to navigate"],
            ["\u21B5", "to select"],
            ["esc", "to close"],
          ] as const).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <kbd className="text-[10px] bg-bg-elevated border border-border px-1.5 py-0.5 rounded font-mono text-text-secondary">
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
