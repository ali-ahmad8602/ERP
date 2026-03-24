"use client";
import { useState } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, closestCenter
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { CardDetailDrawer } from "../card/CardDetailDrawer";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Board, Card, Column } from "@/types";

interface KanbanBoardProps {
  board: Board;
  cards: Card[];
  onCardMove?: (cardId: string, columnId: string) => void;
  onCardCreate?: (columnId: string, title: string) => void;
  canEdit?: boolean;
}

const COLUMN_ACCENT: Record<string, string> = {
  ideas:       "#555555",
  backlog:     "#444455",
  "in progress": "#0454FC",
  "in review":   "#F5A623",
  done:          "#00E5A0",
};

function getColumnAccent(name: string) {
  return COLUMN_ACCENT[name.toLowerCase()] ?? "#333333";
}

export function KanbanBoard({ board, cards, onCardMove, onCardCreate, canEdit = true }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [addingIn, setAddingIn] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const columns = [...board.columns].sort((a, b) => a.order - b.order);
  const cardsByColumn = (colId: string) =>
    cards.filter(c => c.column === colId).sort((a, b) => a.order - b.order);

  const handleDragStart = (e: DragStartEvent) => setActiveCard(cards.find(c => c._id === e.active.id) ?? null);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveCard(null);
    if (!over || !onCardMove) return;
    const targetCol = board.columns.find(c => c._id === over.id)?._id
      ?? cards.find(c => c._id === over.id)?.column;
    if (targetCol && active.id !== over.id) onCardMove(active.id as string, targetCol);
  };

  const handleAddCard = (colId: string) => {
    if (!newCardTitle.trim() || !onCardCreate) return;
    onCardCreate(colId, newCardTitle.trim());
    setNewCardTitle(""); setAddingIn(null);
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter}
        onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-2.5 h-full overflow-x-auto px-5 pt-3.5 pb-5">
          {columns.map(col => {
            const colCards = cardsByColumn(col._id);
            const accent = getColumnAccent(col.name);
            return (
              <ColumnPanel
                key={col._id}
                column={col}
                cards={colCards}
                accent={accent}
                isLocked={board.settings.isLocked}
                canEdit={canEdit}
                onCardClick={setSelectedCard}
                isAdding={addingIn === col._id}
                newCardTitle={newCardTitle}
                onNewTitleChange={setNewCardTitle}
                onAddStart={() => { setAddingIn(col._id); setNewCardTitle(""); }}
                onAddConfirm={() => handleAddCard(col._id)}
                onAddCancel={() => { setAddingIn(null); setNewCardTitle(""); }}
              />
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.16,1,0.3,1)" }}>
          {activeCard && (
            <div className="rotate-[1.5deg] scale-[1.02] opacity-95 w-[272px]">
              <KanbanCard card={activeCard} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardDetailDrawer
          card={selectedCard}
          board={board}
          onClose={() => setSelectedCard(null)}
          canEdit={canEdit}
        />
      )}
    </>
  );
}

// ─── Column Panel ─────────────────────────────────────────────────────────────
interface ColumnPanelProps {
  column: Column; cards: Card[]; accent: string;
  isLocked: boolean; canEdit: boolean;
  onCardClick: (card: Card) => void;
  isAdding: boolean; newCardTitle: string;
  onNewTitleChange: (v: string) => void;
  onAddStart: () => void; onAddConfirm: () => void; onAddCancel: () => void;
}

function ColumnPanel({ column, cards, accent, isLocked, canEdit, onCardClick, isAdding, newCardTitle, onNewTitleChange, onAddStart, onAddConfirm, onAddCancel }: ColumnPanelProps) {
  return (
    <div className="w-[272px] shrink-0 flex flex-col">

      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-[7px]">
          {/* Colored dot */}
          <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: accent }} />
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            {column.name}
          </span>
          <span className="min-w-[18px] h-4 px-[5px] flex items-center justify-center rounded-full bg-bg-base text-[10px] text-text-muted font-mono">
            {cards.length}
          </span>
        </div>

        {canEdit && !isLocked && (
          <button
            onClick={onAddStart}
            className="w-[22px] h-[22px] flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors"
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      {/* Accent line under header */}
      <div className="h-0.5 rounded-sm mb-2" style={{ background: `linear-gradient(90deg, ${accent}50, transparent)` }} />

      {/* Cards */}
      <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 flex flex-col gap-1.5 min-h-[40px]">
          {cards.map(card => (
            <KanbanCard key={card._id} card={card} onClick={() => onCardClick(card)} />
          ))}

          {/* Empty state */}
          {cards.length === 0 && !isAdding && (
            <div
              className={cn(
                "border border-dashed border-border-subtle rounded-[10px] py-5 px-3 text-center",
                canEdit ? "cursor-pointer hover:border-border transition-colors" : "cursor-default"
              )}
              onClick={canEdit && !isLocked ? onAddStart : undefined}
            >
              <p className="text-[11px] text-text-muted">{canEdit ? "+ Add a card" : "No cards"}</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Inline add card */}
      {isAdding && (
        <div className="mt-1.5 bg-bg-surface border border-border rounded-[10px] p-2.5">
          <Textarea
            autoFocus
            value={newCardTitle}
            onChange={e => onNewTitleChange(e.target.value)}
            placeholder="Card title..."
            rows={2}
            className="!bg-transparent !border-none !p-0 text-[13px] leading-relaxed"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAddConfirm(); }
              if (e.key === "Escape") onAddCancel();
            }}
          />
          <div className="flex gap-1.5 mt-2 items-center">
            <Button variant="primary" size="sm" onClick={onAddConfirm}>
              Add card
            </Button>
            <Button variant="ghost" size="sm" onClick={onAddCancel}>
              Cancel
            </Button>
            <span className="ml-auto text-[10px] text-text-muted">↵ to add</span>
          </div>
        </div>
      )}
    </div>
  );
}
