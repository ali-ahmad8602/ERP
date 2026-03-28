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
  "in progress": "#0071E3",
  done:          "#34C759",
  "in review":   "#FF9500",
  ideas:         "#86868B",
  backlog:       "#86868B",
  blocked:       "#FF3B30",
};
const colAccent = (name: string) => COL_ACCENT[name.toLowerCase()] ?? "#86868B";

const PRIORITY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: "bg-[#8B0000]",  text: "text-white",          label: "Urgent" },
  high:   { bg: "bg-[#FF3B30]",  text: "text-white",          label: "High" },
  medium: { bg: "bg-[#FF9500]",  text: "text-white",          label: "Medium" },
  low:    { bg: "bg-black/[0.06] dark:bg-white/[0.1]", text: "text-text-secondary", label: "Low" },
};

const HEADERS = ["Title", "Priority", "Assignees", "Due Date", "Labels"];
const GRID = "minmax(280px,1fr) 100px 120px 120px 1fr";

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
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-10">

        {/* Column headers */}
        <div
          className="grid border-b border-border-subtle mb-1 pb-2.5 pl-10 pr-3"
          style={{ gridTemplateColumns: GRID }}
        >
          {HEADERS.map(h => (
            <span key={h} className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              {h}
            </span>
          ))}
        </div>

        {columns.map(col => {
          const colCards    = byCol(col._id);
          const isCollapsed = collapsed[col._id];
          const accent      = colAccent(col.name);

          return (
            <div key={col._id} className="mb-0.5">
              {/* Group header */}
              <button
                onClick={() => setCollapsed(p => ({ ...p, [col._id]: !p[col._id] }))}
                className="w-full flex items-center gap-2.5 py-2 px-3 bg-transparent border-none cursor-pointer rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
              >
                {isCollapsed
                  ? <ChevronRight size={12} className="text-text-muted" />
                  : <ChevronDown size={12} className="text-text-muted" />
                }
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
                <span className="text-[13px] font-semibold text-text-primary tracking-tight">
                  {col.name}
                </span>
                <span className="text-[11px] text-text-muted bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-md font-medium">
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
                    <div className="flex items-center gap-2 py-2 px-3 pl-10">
                      <Input
                        autoFocus
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Task title..."
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
                      className="flex items-center gap-1.5 py-2 px-3 pl-10 w-full bg-transparent border-none cursor-pointer text-text-muted text-[12px] font-medium hover:text-primary transition-colors rounded-lg"
                    >
                      <Plus size={12} /> Add task
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
  const priority = PRIORITY_BADGE[card.priority];
  const isOverdue = card.dueDate && isPast(new Date(card.dueDate)) && !isToday(new Date(card.dueDate));
  const dueFmt = card.dueDate
    ? isToday(new Date(card.dueDate))     ? "Today"
    : isTomorrow(new Date(card.dueDate))  ? "Tomorrow"
    : isOverdue                           ? format(new Date(card.dueDate), "MMM d")
    : format(new Date(card.dueDate), "MMM d")
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full grid items-center py-2.5 px-3 pl-10 bg-transparent border-none cursor-pointer rounded-xl text-left border-b border-border-subtle/30 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group"
      style={{ gridTemplateColumns: GRID }}
    >
      {/* Title */}
      <span className="text-[13px] font-medium text-text-primary overflow-hidden text-ellipsis whitespace-nowrap pr-4 group-hover:text-primary transition-colors">
        {card.title}
      </span>

      {/* Priority */}
      {priority ? (
        <span className={cn(
          "inline-flex items-center justify-center text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md w-fit",
          priority.bg,
          priority.text
        )}>
          {priority.label}
        </span>
      ) : <span />}

      {/* Assignees */}
      <div className="flex">
        {card.assignees.length > 0 ? (
          <AvatarGroup users={card.assignees} max={4} size="sm" />
        ) : (
          <span className="text-[12px] text-text-muted">--</span>
        )}
      </div>

      {/* Due date */}
      <span className={cn(
        "text-[12px] font-medium",
        isOverdue ? "text-danger" : dueFmt === "Today" ? "text-warning" : "text-text-secondary"
      )}>
        {dueFmt ?? "--"}
      </span>

      {/* Labels */}
      <div className="flex gap-1 flex-wrap">
        {card.labels.slice(0, 3).map(l => (
          <span key={l} className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md">
            {l}
          </span>
        ))}
        {card.labels.length > 3 && (
          <span className="text-[10px] text-text-muted font-medium">
            +{card.labels.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}
