"use client";
import { useState } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, closestCenter
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, MoreHorizontal } from "lucide-react";
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
  canComment?: boolean;
}

const COLUMN_ACCENT: Record<string, string> = {
  ideas:         "#86868B",
  backlog:       "#86868B",
  "in progress": "#0071E3",
  "in review":   "#FF9500",
  done:          "#34C759",
  blocked:       "#FF3B30",
};

function getColumnAccent(name: string) {
  return COLUMN_ACCENT[name.toLowerCase()] ?? "#86868B";
}

export function KanbanBoard({ board, cards, onCardMove, onCardCreate, canEdit = true, canComment = true }: KanbanBoardProps) {
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
        <div className="flex gap-4 h-full overflow-x-auto px-4 pt-3 pb-4">
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
            <div className="rotate-[1deg] scale-[1.02] opacity-80 w-[300px]">
              <KanbanCard card={activeCard} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Floating FAB */}
      {canEdit && (
        <button
          onClick={() => {
            const firstCol = columns[0];
            if (firstCol) { setAddingIn(firstCol._id); setNewCardTitle(""); }
          }}
          className="fixed bottom-5 right-5 w-10 h-10 rounded-full bg-primary text-white border-none cursor-pointer shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150 flex items-center justify-center z-50"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      )}

      {selectedCard && (
        <CardDetailDrawer
          card={selectedCard}
          board={board}
          onClose={() => setSelectedCard(null)}
          canEdit={canEdit}
          canComment={canComment}
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
    <div className="w-[300px] shrink-0 flex flex-col">

      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
          <span className="text-[13px] font-semibold text-text-primary tracking-tight">
            {column.name}
          </span>
          <span className="text-[11px] text-text-muted tabular-nums">
            {cards.length}
          </span>
        </div>

        <button
          className="w-6 h-6 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-text-secondary transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Cards container */}
      <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 flex flex-col gap-2 min-h-[40px] rounded-lg bg-bg-elevated/30 p-2 overflow-y-auto">
          {cards.map(card => (
            <KanbanCard key={card._id} card={card} onClick={() => onCardClick(card)} />
          ))}

          {/* Empty state */}
          {cards.length === 0 && !isAdding && (
            <div
              className={cn(
                "border border-dashed border-border rounded-xl py-6 px-3 text-center",
                canEdit ? "cursor-pointer hover:border-text-muted hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors" : "cursor-default"
              )}
              onClick={canEdit && !isLocked ? onAddStart : undefined}
            >
              <p className="text-[12px] text-text-muted">
                {canEdit ? "+ Add a task" : "No tasks"}
              </p>
            </div>
          )}

          {/* Inline add card */}
          {isAdding && (
            <div className="bg-bg-surface border border-border rounded-xl p-3 shadow-card">
              <Textarea
                autoFocus
                value={newCardTitle}
                onChange={e => onNewTitleChange(e.target.value)}
                placeholder="Task title..."
                rows={2}
                className="!bg-transparent !border-none !p-0 text-[13px] leading-relaxed !ring-0 !shadow-none"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAddConfirm(); }
                  if (e.key === "Escape") onAddCancel();
                }}
              />
              <div className="flex gap-1.5 mt-2.5 items-center">
                <Button variant="primary" size="sm" onClick={onAddConfirm}>
                  Add
                </Button>
                <Button variant="ghost" size="sm" onClick={onAddCancel}>
                  Cancel
                </Button>
                <span className="ml-auto text-[10px] text-text-muted font-medium">Enter to add</span>
              </div>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add task button at bottom */}
      {canEdit && !isLocked && !isAdding && (
        <button
          onClick={onAddStart}
          className="flex items-center justify-center gap-1.5 mt-2 py-2 rounded-xl border border-dashed border-border bg-transparent text-[12px] font-medium text-text-muted cursor-pointer hover:border-text-muted hover:text-text-secondary hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
        >
          <Plus size={13} />
          Add Task
        </button>
      )}
    </div>
  );
}
