"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { BoardStatsBar } from "@/components/board/BoardStatsBar";
import { BoardConfigPanel } from "@/components/board/BoardConfigPanel";
import { ListView } from "@/components/board/ListView";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Plus, LayoutGrid, List, Settings2, Columns3, X, Loader2 } from "lucide-react";
import { useBoardStore } from "@/store/board.store";
import { useDeptStore } from "@/store/dept.store";
import { cn } from "@/lib/utils";

export default function DeptBoardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { departments, activeDept, fetchDeptBySlug } = useDeptStore();
  const { boards, activeBoard, cards, loadingBoards, loadingCards, fetchBoards, fetchBoard, fetchCards, createCard, moveCard, createBoard } = useBoardStore();

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen]         = useState(false);
  const [viewMode, setViewMode]               = useState<"board" | "list">("board");
  const [configOpen, setConfigOpen]           = useState(false);
  const [addBoardOpen, setAddBoardOpen]       = useState(false);
  const [newBoardName, setNewBoardName]       = useState("");
  const [creatingBoard, setCreatingBoard]     = useState(false);
  const [deptLoading, setDeptLoading]         = useState(true);

  const dept = activeDept?.slug === slug ? activeDept : departments.find((d: { slug: string }) => d.slug === slug) ?? null;

  // Fetch department by slug on mount
  useEffect(() => {
    if (!slug) return;
    setDeptLoading(true);
    setSelectedBoardId(null);
    fetchDeptBySlug(slug).finally(() => setDeptLoading(false));
  }, [slug, fetchDeptBySlug]);

  // Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPaletteOpen(p => !p); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Fetch boards when department is resolved
  useEffect(() => { if (dept) fetchBoards(dept._id); }, [dept, fetchBoards]);

  // Auto-select first board
  useEffect(() => { if (boards.length > 0 && !selectedBoardId) setSelectedBoardId(boards[0]._id); }, [boards, selectedBoardId]);

  // Fetch board details + cards when board is selected
  useEffect(() => { if (selectedBoardId) { fetchBoard(selectedBoardId); fetchCards(selectedBoardId); } }, [selectedBoardId, fetchBoard, fetchCards]);

  const isLoading = deptLoading || loadingBoards || loadingCards;

  const handleCardMove = (cardId: string, colId: string) => {
    moveCard(cardId, colId);
  };

  const handleCardCreate = (colId: string, title: string) => {
    if (activeBoard) {
      createCard({ title, board: activeBoard._id, column: colId });
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || creatingBoard) return;
    setCreatingBoard(true);
    try {
      const board = await createBoard({ name: newBoardName.trim(), department: dept?._id });
      setSelectedBoardId(board._id);
      setNewBoardName("");
      setAddBoardOpen(false);
    } catch { /* ignore */ }
    finally { setCreatingBoard(false); }
  };

  // Loading state
  if (isLoading && !activeBoard) {
    return (
      <div className="flex flex-col h-full bg-bg-base items-center justify-center gap-3.5">
        <div className="w-7 h-7 border-2 border-border-subtle border-t-primary rounded-full animate-spin" />
        <p className="text-[13px] text-text-muted">Loading department...</p>
      </div>
    );
  }

  // Department not found
  if (!deptLoading && !dept) {
    return (
      <div className="flex flex-col h-full bg-bg-base items-center justify-center gap-3">
        <Columns3 size={32} className="text-border" />
        <p className="text-sm text-text-muted">Department not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-base">

      <Topbar
        department={dept as Parameters<typeof Topbar>[0]["department"]}
        board={activeBoard ?? undefined}
        onSearchClick={() => setPaletteOpen(true)}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 h-11 border-b border-border-subtle bg-bg-surface shrink-0">
        {/* Board tabs */}
        <div className="flex items-center gap-0.5">
          {boards.map(b => {
            const isActive = selectedBoardId === b._id;
            return (
              <button
                key={b._id}
                onClick={() => setSelectedBoardId(b._id)}
                className={cn(
                  "px-3 py-1.5 rounded-[7px] text-xs border-none cursor-pointer transition-all duration-100",
                  isActive
                    ? "bg-bg-elevated text-text-primary font-medium"
                    : "bg-transparent text-text-muted hover:text-text-secondary hover:bg-bg-elevated"
                )}
              >
                {b.name}
              </button>
            );
          })}
          <button
            onClick={() => setAddBoardOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] text-xs border-none cursor-pointer bg-transparent text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-all duration-100"
          >
            <Plus size={11} /> Board
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {([
            { icon: <LayoutGrid size={13} />, label: "Board", mode: "board" as const },
            { icon: <List size={13} />,       label: "List",  mode: "list"  as const },
          ] as const).map(item => (
            <button
              key={item.label}
              onClick={() => setViewMode(item.mode)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-xs border-none cursor-pointer transition-all duration-100",
                viewMode === item.mode
                  ? "bg-bg-elevated text-text-primary"
                  : "bg-transparent text-text-muted hover:text-text-secondary hover:bg-bg-elevated"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <div className="w-px h-4 bg-border-subtle mx-1" />

          {activeBoard && (
            <button
              onClick={() => setConfigOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-xs border-none cursor-pointer transition-all duration-100",
                configOpen
                  ? "bg-bg-elevated text-text-secondary"
                  : "bg-transparent text-text-muted hover:bg-bg-elevated hover:text-text-secondary"
              )}
            >
              <Settings2 size={13} /> Configure
            </button>
          )}

          <Button variant="primary" size="sm" onClick={() => setPaletteOpen(true)}>
            <Plus size={12} /> New Card
          </Button>
        </div>
      </div>

      {/* Stats */}
      {activeBoard && (
        <BoardStatsBar cards={cards} columns={activeBoard.columns} />
      )}

      {/* Loading cards */}
      {loadingCards && !cards.length && (
        <div className="flex-1 flex items-center justify-center flex-col gap-3.5">
          <div className="w-7 h-7 border-2 border-border-subtle border-t-primary rounded-full animate-spin" />
          <p className="text-[13px] text-text-muted">Loading board...</p>
        </div>
      )}

      {/* Board / List view */}
      {activeBoard && !(loadingCards && !cards.length) && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === "board" ? (
            <KanbanBoard
              board={activeBoard}
              cards={cards}
              onCardMove={handleCardMove}
              onCardCreate={handleCardCreate}
            />
          ) : (
            <ListView
              board={activeBoard}
              cards={cards}
              onCardCreate={handleCardCreate}
            />
          )}
        </div>
      )}

      {/* Empty — no boards yet */}
      {!loadingBoards && boards.length === 0 && !deptLoading && dept && (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <Columns3 size={32} className="text-border" />
          <p className="text-sm text-text-muted">No boards yet for {dept.name}</p>
          <Button variant="primary" onClick={() => setAddBoardOpen(true)}>
            <Plus size={13} /> Create First Board
          </Button>
        </div>
      )}

      {/* Board Config Panel */}
      {configOpen && activeBoard && (
        <BoardConfigPanel board={activeBoard} onClose={() => setConfigOpen(false)} />
      )}

      {/* Add Board Modal */}
      {addBoardOpen && (
        <>
          <div
            onClick={() => setAddBoardOpen(false)}
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm animate-[fadeIn_0.12s_ease-out]"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-bg-overlay border border-border rounded-[14px] z-[101] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.9)] animate-[fadeUp_0.18s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-text-primary">New Board</h2>
              <button
                onClick={() => setAddBoardOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-transparent border-none cursor-pointer text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleCreateBoard} className="flex flex-col gap-3.5">
              <div>
                <SectionLabel className="mb-2">Board Name</SectionLabel>
                <Input
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  placeholder="e.g. Q3 Backlog, Sprint Board"
                  autoFocus
                  required
                />
              </div>
              <p className="text-xs text-text-muted">
                Creates with default columns (Ideas → Backlog → In Progress → In Review → Done).
              </p>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!newBoardName.trim() || creatingBoard}
                loading={creatingBoard}
                className="w-full"
              >
                {creatingBoard ? "Creating..." : "Create Board"}
              </Button>
            </form>
          </div>
        </>
      )}

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        cards={cards}
        boards={boards}
        departments={departments}
      />
    </div>
  );
}
