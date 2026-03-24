"use client";
import { useState } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, closestCenter
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, GripVertical } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { CardDetailDrawer } from "../card/CardDetailDrawer";
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
        <div style={{
          display: "flex", gap: 10, height: "100%",
          overflowX: "auto", padding: "14px 20px 20px",
        }}>
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
            <div style={{ transform: "rotate(1.5deg) scale(1.02)", opacity: 0.95, width: 272 }}>
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
    <div style={{ width: 272, flexShrink: 0, display: "flex", flexDirection: "column" }}>

      {/* Column header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8, padding: "0 2px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {/* Colored dot */}
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            {column.name}
          </span>
          <span style={{
            minWidth: 18, height: 16, padding: "0 5px",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 20, background: "#161616",
            fontSize: 10, color: "#444", fontFamily: "monospace",
          }}>
            {cards.length}
          </span>
        </div>

        {canEdit && !isLocked && (
          <button onClick={onAddStart} style={{
            width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 6, background: "transparent", border: "none", cursor: "pointer",
            color: "#333", transition: "all 0.1s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1A1A1A"; (e.currentTarget as HTMLElement).style.color = "#888"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#333"; }}
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      {/* Accent line under header */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}50, transparent)`, borderRadius: 2, marginBottom: 8 }} />

      {/* Cards */}
      <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minHeight: 40 }}>
          {cards.map(card => (
            <KanbanCard key={card._id} card={card} onClick={() => onCardClick(card)} />
          ))}

          {/* Empty state */}
          {cards.length === 0 && !isAdding && (
            <div style={{
              border: "1px dashed #1E1E1E", borderRadius: 10,
              padding: "20px 12px", textAlign: "center",
              cursor: canEdit ? "pointer" : "default",
            }}
              onClick={canEdit && !isLocked ? onAddStart : undefined}
              onMouseEnter={e => { if (canEdit) (e.currentTarget as HTMLElement).style.borderColor = "#2A2A2A"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1E1E1E"; }}
            >
              <p style={{ fontSize: 11, color: "#333" }}>{canEdit ? "+ Add a card" : "No cards"}</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Inline add card */}
      {isAdding && (
        <div style={{
          marginTop: 6, background: "#111111",
          border: "1px solid #2A2A2A", borderRadius: 10, padding: 10,
        }}>
          <textarea autoFocus value={newCardTitle} onChange={e => onNewTitleChange(e.target.value)}
            placeholder="Card title..." rows={2}
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none",
              resize: "none", fontSize: 13, color: "#F3F3F3", lineHeight: 1.5, fontFamily: "inherit",
            }}
            className="placeholder:text-[#333]"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAddConfirm(); }
              if (e.key === "Escape") onAddCancel();
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
            <button onClick={onAddConfirm} style={{
              padding: "5px 14px", background: "#0454FC", color: "white",
              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500,
              cursor: "pointer", transition: "background 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#3B7BFF")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0454FC")}
            >
              Add card
            </button>
            <button onClick={onAddCancel} style={{
              padding: "5px 10px", background: "transparent",
              color: "#555", border: "none", fontSize: 12,
              cursor: "pointer", transition: "color 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#888")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            >
              Cancel
            </button>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#333" }}>↵ to add</span>
          </div>
        </div>
      )}
    </div>
  );
}
