"use client";
import { useState, useEffect, useRef } from "react";
import { Search, LayoutGrid, FileText, Users, ArrowRight, Hash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card, Board, Department } from "@/types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  cards?: Card[];
  boards?: Board[];
  departments?: Department[];
  onSelectCard?: (card: Card) => void;
}

const QUICK_ACTIONS = [
  { icon: <Plus size={13} />,       label: "New Card",       shortcut: "N",     color: "#0454FC" },
  { icon: <LayoutGrid size={13} />, label: "New Board",      shortcut: "B",     color: "#888" },
  { icon: <Users size={13} />,      label: "Invite Member",  shortcut: "I",     color: "#888" },
];

export function CommandPalette({ open, onClose, cards = [], boards = [], departments = [], onSelectCard }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const filteredCards = q
    ? cards.filter(c => c.title.toLowerCase().includes(q)).slice(0, 5)
    : cards.slice(0, 4);

  const filteredBoards = q
    ? boards.filter(b => b.name.toLowerCase().includes(q)).slice(0, 3)
    : boards.slice(0, 3);

  const filteredDepts = q
    ? departments.filter(d => d.name.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const hasResults = filteredCards.length + filteredBoards.length + filteredDepts.length > 0;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] animate-fade-in"
      />

      {/* Palette */}
      <div className="fixed top-[18%] left-1/2 -translate-x-1/2 w-[560px] max-h-[420px] bg-bg-surface border border-border rounded-[14px] z-[101] shadow-modal animate-fade-up overflow-hidden">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search size={16} className="text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cards, boards, departments..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-text-primary placeholder:text-text-muted"
          />
          <kbd className="text-[10px] text-text-muted bg-bg-elevated border border-border px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[360px]">

          {/* Quick actions — shown when no query */}
          {!q && (
            <Section label="Quick Actions">
              {QUICK_ACTIONS.map(a => (
                <ResultRow key={a.label}
                  icon={<span style={{ color: a.color }}>{a.icon}</span>}
                  label={a.label}
                  right={<kbd className="text-[10px] text-text-muted bg-bg-elevated border border-border px-1.5 py-0.5 rounded font-mono">{a.shortcut}</kbd>}
                  onClick={onClose}
                />
              ))}
            </Section>
          )}

          {/* Cards */}
          {filteredCards.length > 0 && (
            <Section label="Cards">
              {filteredCards.map(card => (
                <ResultRow
                  key={card._id}
                  icon={<FileText size={13} className="text-text-muted" />}
                  label={card.title}
                  sublabel={card.priority !== "none" ? card.priority : undefined}
                  right={<ArrowRight size={12} className="text-text-muted" />}
                  onClick={() => { onSelectCard?.(card); onClose(); }}
                />
              ))}
            </Section>
          )}

          {/* Boards */}
          {filteredBoards.length > 0 && (
            <Section label="Boards">
              {filteredBoards.map(board => (
                <ResultRow
                  key={board._id}
                  icon={<LayoutGrid size={13} className="text-text-muted" />}
                  label={board.name}
                  right={<ArrowRight size={12} className="text-text-muted" />}
                  onClick={onClose}
                />
              ))}
            </Section>
          )}

          {/* Departments */}
          {filteredDepts.length > 0 && (
            <Section label="Departments">
              {filteredDepts.map(dept => (
                <ResultRow
                  key={dept._id}
                  icon={<span className="text-[13px]">{dept.icon}</span>}
                  label={dept.name}
                  right={<ArrowRight size={12} className="text-text-muted" />}
                  onClick={onClose}
                />
              ))}
            </Section>
          )}

          {/* No results */}
          {q && !hasResults && (
            <div className="px-4 py-8 text-center">
              <Hash size={20} className="text-text-muted mx-auto mb-2" />
              <p className="text-[13px] text-text-muted">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-border-subtle flex gap-4 items-center">
            {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"]].map(([key, label]) => (
              <span key={key} className="flex items-center gap-1 text-[11px] text-text-muted">
                <kbd className="text-[10px] bg-bg-elevated border border-border px-1 py-0.5 rounded-[3px] font-mono text-text-secondary">
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 pt-2 pb-1 text-[10px] font-semibold text-text-muted uppercase tracking-wide">
        {label}
      </div>
      {children}
    </div>
  );
}

function ResultRow({ icon, label, sublabel, right, onClick }: {
  icon: React.ReactNode; label: string; sublabel?: string;
  right?: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2 bg-transparent border-none cursor-pointer text-left hover:bg-bg-elevated transition-colors"
    >
      <span className="shrink-0 w-5 flex justify-center">{icon}</span>
      <span className="flex-1 text-[13px] text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded border border-border-subtle">
          {sublabel}
        </span>
      )}
      <span className="shrink-0">{right}</span>
    </button>
  );
}
