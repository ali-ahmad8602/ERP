"use client";
import { useState } from "react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { PRIORITY_CONFIG } from "@/lib/utils";
import { CardDetailDrawer } from "@/components/card/CardDetailDrawer";
import type { Board, Card } from "@/types";

interface ListViewProps {
  board: Board;
  cards: Card[];
  onCardCreate?: (columnId: string, title: string) => void;
}

const COL_ACCENT: Record<string, string> = {
  "in progress": "#0454FC",
  done:          "#00E5A0",
  "in review":   "#F5A623",
  ideas:         "#555555",
  backlog:       "#444455",
};
const colAccent = (name: string) => COL_ACCENT[name.toLowerCase()] ?? "#444";

const HEADERS = ["Title", "Priority", "Assignees", "Due Date", "Labels"];
const GRID = "minmax(240px,1fr) 100px 110px 110px 1fr";

export function ListView({ board, cards, onCardCreate }: ListViewProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addingIn, setAddingIn]   = useState<string | null>(null);
  const [newTitle, setNewTitle]   = useState("");
  const [selected, setSelected]   = useState<Card | null>(null);

  const columns = [...board.columns].sort((a, b) => a.order - b.order);
  const byCol   = (id: string) => cards.filter(c => c.column === id).sort((a, b) => a.order - b.order);

  const handleAdd = (colId: string) => {
    if (!newTitle.trim() || !onCardCreate) return;
    onCardCreate(colId, newTitle.trim());
    setNewTitle(""); setAddingIn(null);
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 40px" }}>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: GRID,
          padding: "0 12px 8px 36px", borderBottom: "1px solid #1A1A1A", marginBottom: 4,
        }}>
          {HEADERS.map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {h}
            </span>
          ))}
        </div>

        {columns.map(col => {
          const colCards   = byCol(col._id);
          const isCollapsed = collapsed[col._id];
          const accent      = colAccent(col.name);

          return (
            <div key={col._id} style={{ marginBottom: 4 }}>
              {/* Group header */}
              <button
                onClick={() => setCollapsed(p => ({ ...p, [col._id]: !p[col._id] }))}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 12px", background: "transparent", border: "none",
                  cursor: "pointer", borderRadius: 8, transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#111")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {isCollapsed
                  ? <ChevronRight size={11} color="#444" />
                  : <ChevronDown size={11} color="#444" />
                }
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {col.name}
                </span>
                <span style={{ fontSize: 10, color: "#333", background: "#1A1A1A", padding: "1px 6px", borderRadius: 10, fontFamily: "monospace" }}>
                  {colCards.length}
                </span>
              </button>

              {/* Rows */}
              {!isCollapsed && (
                <>
                  {colCards.map(card => (
                    <ListRow key={card._id} card={card} onClick={() => setSelected(card)} />
                  ))}

                  {/* Add card */}
                  {addingIn === col._id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 40px" }}>
                      <input
                        autoFocus
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Card title..."
                        style={{
                          flex: 1, background: "#111", border: "1px solid #2A2A2A",
                          borderRadius: 7, padding: "5px 10px", fontSize: 13,
                          color: "#F3F3F3", outline: "none",
                        }}
                        className="input-field"
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAdd(col._id);
                          if (e.key === "Escape") { setAddingIn(null); setNewTitle(""); }
                        }}
                      />
                      <button onClick={() => handleAdd(col._id)} style={{ padding: "5px 12px", background: "#0454FC", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                        Add
                      </button>
                      <button onClick={() => { setAddingIn(null); setNewTitle(""); }} style={{ padding: "5px 10px", background: "transparent", color: "#555", border: "none", fontSize: 12, cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingIn(col._id); setNewTitle(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 12px 5px 40px", width: "100%",
                        background: "transparent", border: "none", cursor: "pointer",
                        color: "#333", fontSize: 12, transition: "color 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#666")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#333")}
                    >
                      <Plus size={11} /> Add card
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <CardDetailDrawer
          card={selected}
          board={board}
          onClose={() => setSelected(null)}
          canEdit
        />
      )}
    </>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────
function ListRow({ card, onClick }: { card: Card; onClick: () => void }) {
  const priority  = PRIORITY_CONFIG[card.priority];
  const isOverdue = card.dueDate && isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate));
  const dueFmt    = card.dueDate
    ? isToday(new Date(card.dueDate))     ? "Today"
    : isTomorrow(new Date(card.dueDate))  ? "Tomorrow"
    : isOverdue                           ? `${format(new Date(card.dueDate), "MMM d")} ⚠`
    : format(new Date(card.dueDate), "MMM d")
    : null;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "grid", gridTemplateColumns: GRID,
        padding: "7px 12px 7px 36px", background: "transparent",
        border: "none", cursor: "pointer", borderRadius: 8,
        textAlign: "left", transition: "background 0.1s", alignItems: "center",
        borderBottom: "1px solid #111",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#0F0F0F")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {/* Title */}
      <span style={{ fontSize: 13, color: "#C8C8C8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 16 }}>
        {card.title}
      </span>

      {/* Priority */}
      {card.priority !== "none" ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: priority.color }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: priority.color, flexShrink: 0 }} />
          {priority.label}
        </span>
      ) : <span />}

      {/* Assignees */}
      <div style={{ display: "flex" }}>
        {card.assignees.slice(0, 4).map((u, i) => (
          <div key={u._id} style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            background: `hsl(${(u.name.charCodeAt(0) * 37) % 360}, 50%, 35%)`,
            fontSize: 9, fontWeight: 700, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid #080808",
            marginLeft: i > 0 ? -6 : 0,
          }}>
            {u.name[0].toUpperCase()}
          </div>
        ))}
        {card.assignees.length === 0 && <span style={{ fontSize: 12, color: "#333" }}>—</span>}
      </div>

      {/* Due date */}
      <span style={{
        fontSize: 12, fontFamily: "monospace",
        color: isOverdue ? "#FF4444" : dueFmt === "Today" ? "#F5A623" : "#666",
      }}>
        {dueFmt ?? "—"}
      </span>

      {/* Labels */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {card.labels.slice(0, 3).map(l => (
          <span key={l} style={{
            fontSize: 10, color: "#666", background: "#161616",
            border: "1px solid #1E1E1E", padding: "1px 6px", borderRadius: 4,
          }}>{l}</span>
        ))}
      </div>
    </button>
  );
}
