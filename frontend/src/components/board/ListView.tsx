"use client";
import { useState } from "react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { PRIORITY_CONFIG, cn } from "@/lib/utils";
import { CardDetailDrawer } from "@/components/card/CardDetailDrawer";
import { AvatarGroup } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
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
      <div className="flex-1 overflow-y-auto px-5 pt-3.5 pb-10">

        {/* Column headers */}
        <div
          className="grid border-b border-border-subtle mb-1 pb-2 pl-9 pr-3"
          style={{ gridTemplateColumns: GRID }}
        >
          {HEADERS.map(h => (
            <span key={h} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {columns.map(col => {
          const colCards   = byCol(col._id);
          const isCollapsed = collapsed[col._id];
          const accent      = colAccent(col.name);

          return (
            <div key={col._id} className="mb-1">
              {/* Group header */}
              <button
                onClick={() => setCollapsed(p => ({ ...p, [col._id]: !p[col._id] }))}
                className="w-full flex items-center gap-2 py-[7px] px-3 bg-transparent border-none cursor-pointer rounded-lg hover:bg-bg-elevated transition-colors"
              >
                {isCollapsed
                  ? <ChevronRight size={11} className="text-text-muted" />
                  : <ChevronDown size={11} className="text-text-muted" />
                }
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
                <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  {col.name}
                </span>
                <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-px rounded-[10px] font-mono">
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
                    <div className="flex items-center gap-2 py-[5px] px-3 pl-10">
                      <Input
                        autoFocus
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Card title..."
                        className="flex-1"
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAdd(col._id);
                          if (e.key === "Escape") { setAddingIn(null); setNewTitle(""); }
                        }}
                      />
                      <Button variant="primary" size="sm" onClick={() => handleAdd(col._id)}>
                        Add
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setAddingIn(null); setNewTitle(""); }}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingIn(col._id); setNewTitle(""); }}
                      className="flex items-center gap-1.5 py-[5px] px-3 pl-10 w-full bg-transparent border-none cursor-pointer text-text-muted text-[12px] hover:text-text-secondary transition-colors"
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
      className="w-full grid items-center py-[7px] px-3 pl-9 bg-transparent border-none cursor-pointer rounded-lg text-left border-b border-border-subtle/50 hover:bg-bg-elevated transition-colors"
      style={{ gridTemplateColumns: GRID }}
    >
      {/* Title */}
      <span className="text-[13px] text-text-primary overflow-hidden text-ellipsis whitespace-nowrap pr-4">
        {card.title}
      </span>

      {/* Priority */}
      {card.priority !== "none" ? (
        <span className="inline-flex items-center gap-[5px] text-[11px]" style={{ color: priority.color }}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: priority.color }} />
          {priority.label}
        </span>
      ) : <span />}

      {/* Assignees */}
      <div className="flex">
        {card.assignees.length > 0 ? (
          <AvatarGroup users={card.assignees} max={4} size="sm" />
        ) : (
          <span className="text-[12px] text-text-muted">—</span>
        )}
      </div>

      {/* Due date */}
      <span className={cn(
        "text-[12px] font-mono",
        isOverdue ? "text-danger" : dueFmt === "Today" ? "text-warning" : "text-text-secondary"
      )}>
        {dueFmt ?? "—"}
      </span>

      {/* Labels */}
      <div className="flex gap-1 flex-wrap">
        {card.labels.slice(0, 3).map(l => (
          <span key={l} className="text-[10px] text-text-secondary bg-bg-base border border-border-subtle px-1.5 py-px rounded">
            {l}
          </span>
        ))}
      </div>
    </button>
  );
}
