"use client";
import { useState, useEffect, useRef } from "react";
import { Search, LayoutGrid, FileText, Users, ArrowRight, Hash, Plus } from "lucide-react";
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
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        zIndex: 100, backdropFilter: "blur(4px)",
        animation: "fadeIn 0.12s ease-out",
      }} />

      {/* Palette */}
      <div style={{
        position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)",
        width: 560, maxHeight: 420,
        background: "#0F0F0F", border: "1px solid #2A2A2A",
        borderRadius: 14, zIndex: 101, overflow: "hidden",
        boxShadow: "0 32px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)",
        animation: "fadeUp 0.18s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px", borderBottom: "1px solid #1E1E1E",
        }}>
          <Search size={16} color="#555" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cards, boards, departments..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontSize: 14, color: "#F3F3F3",
            }}
            className="placeholder:text-[#444]"
          />
          <kbd style={{
            fontSize: 10, color: "#444", background: "#1A1A1A",
            border: "1px solid #2A2A2A", padding: "2px 6px",
            borderRadius: 5, fontFamily: "monospace",
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ overflowY: "auto", maxHeight: 360 }}>

          {/* Quick actions — shown when no query */}
          {!q && (
            <Section label="Quick Actions">
              {QUICK_ACTIONS.map(a => (
                <ResultRow key={a.label}
                  icon={<span style={{ color: a.color }}>{a.icon}</span>}
                  label={a.label}
                  right={<kbd style={{ fontSize: 10, color: "#444", background: "#1A1A1A", border: "1px solid #2A2A2A", padding: "1px 5px", borderRadius: 4, fontFamily: "monospace" }}>{a.shortcut}</kbd>}
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
                  icon={<FileText size={13} color="#555" />}
                  label={card.title}
                  sublabel={card.priority !== "none" ? card.priority : undefined}
                  right={<ArrowRight size={12} color="#333" />}
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
                  icon={<LayoutGrid size={13} color="#555" />}
                  label={board.name}
                  right={<ArrowRight size={12} color="#333" />}
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
                  icon={<span style={{ fontSize: 13 }}>{dept.icon}</span>}
                  label={dept.name}
                  right={<ArrowRight size={12} color="#333" />}
                  onClick={onClose}
                />
              ))}
            </Section>
          )}

          {/* No results */}
          {q && !hasResults && (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <Hash size={20} color="#333" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, color: "#555" }}>No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {/* Footer hint */}
          <div style={{
            padding: "8px 16px", borderTop: "1px solid #1A1A1A",
            display: "flex", gap: 16, alignItems: "center",
          }}>
            {[["↑↓", "navigate"], ["↵", "select"], ["esc", "close"]].map(([key, label]) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#444" }}>
                <kbd style={{ fontSize: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", padding: "1px 4px", borderRadius: 3, fontFamily: "monospace", color: "#888" }}>
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
      <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 600, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
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
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "8px 16px", background: "transparent", border: "none",
      cursor: "pointer", textAlign: "left", transition: "background 0.1s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "#161616")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ flexShrink: 0, width: 20, display: "flex", justifyContent: "center" }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: "#C8C8C8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {sublabel && (
        <span style={{ fontSize: 10, color: "#555", background: "#1A1A1A", padding: "1px 6px", borderRadius: 4, border: "1px solid #2A2A2A" }}>
          {sublabel}
        </span>
      )}
      <span style={{ flexShrink: 0 }}>{right}</span>
    </button>
  );
}
