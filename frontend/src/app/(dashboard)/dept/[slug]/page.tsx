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
import {
  Plus, LayoutGrid, List, Settings2, Columns3, X, Loader2,
  Filter, ArrowUpDown, Clock, FolderOpen
} from "lucide-react";
import { useBoardStore } from "@/store/board.store";
import { useDeptStore } from "@/store/dept.store";
import { useBoardPermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

type ViewMode = "board" | "list" | "timeline" | "files";

export default function DeptBoardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { departments, activeDept, fetchDeptBySlug } = useDeptStore();
  const { boards, activeBoard, cards, loadingBoards, loadingCards, fetchBoards, fetchBoard, fetchCards, createCard, moveCard, createBoard } = useBoardStore();

  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen]         = useState(false);
  const [viewMode, setViewMode]               = useState<ViewMode>("board");
  const [configOpen, setConfigOpen]           = useState(false);
  const [addBoardOpen, setAddBoardOpen]       = useState(false);
  const [newBoardName, setNewBoardName]       = useState("");
  const [creatingBoard, setCreatingBoard]     = useState(false);
  const [deptLoading, setDeptLoading]         = useState(true);
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);

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

  // Fetch boards when department is resolved — use dept._id as dep for stable reference
  const deptId = dept?._id;
  useEffect(() => { if (deptId) fetchBoards(deptId); }, [deptId, fetchBoards]);

  // Auto-select first board
  useEffect(() => { if (boards.length > 0 && !selectedBoardId) setSelectedBoardId(boards[0]._id); }, [boards, selectedBoardId]);

  // Fetch board details + cards when board is selected
  useEffect(() => { if (selectedBoardId) { fetchBoard(selectedBoardId); fetchCards(selectedBoardId); } }, [selectedBoardId, fetchBoard, fetchCards]);

  // Auto-dismiss coming soon toast
  useEffect(() => {
    if (!comingSoonToast) return;
    const t = setTimeout(() => setComingSoonToast(null), 2000);
    return () => clearTimeout(t);
  }, [comingSoonToast]);

  const permissions = useBoardPermissions(activeBoard?._id);

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

  const handleViewChange = (mode: ViewMode) => {
    if (mode === "timeline" || mode === "files") {
      setComingSoonToast(mode === "timeline" ? "Timeline" : "Files");
      return;
    }
    setViewMode(mode);
  };

  // View toggle items
  const viewItems: { icon: React.ReactNode; label: string; mode: ViewMode; disabled?: boolean }[] = [
    { icon: <LayoutGrid size={14} />, label: "Kanban",   mode: "board" },
    { icon: <List size={14} />,       label: "Table",    mode: "list" },
    { icon: <Clock size={14} />,      label: "Timeline", mode: "timeline", disabled: true },
    { icon: <FolderOpen size={14} />, label: "Files",    mode: "files",    disabled: true },
  ];

  // Loading state
  if (isLoading && !activeBoard) {
    return (
      <div className="flex flex-col h-full bg-bg-base p-5">
        <div className="h-12 w-full bg-bg-elevated animate-pulse rounded-lg mb-4" />
        <div className="h-8 w-64 bg-bg-elevated animate-pulse rounded-lg mb-3" />
        <div className="h-10 w-full bg-bg-elevated animate-pulse rounded-lg mb-4" />
        <div className="flex-1 flex gap-3">
          {[1,2,3,4].map(i => <div key={i} className="w-[300px] h-full bg-bg-elevated/50 animate-pulse rounded-xl" />)}
        </div>
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

      {/* ── Header: Department name + description + view toggle ── */}
      <div className="flex items-start justify-between px-5 pt-4 pb-2 shrink-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[24px] font-bold text-text-primary tracking-tight leading-tight">
            {dept?.name}
          </h1>
          {dept?.description && (
            <p className="text-[14px] text-text-secondary truncate max-w-[520px]">
              {dept.description}
            </p>
          )}
        </div>

        {/* View toggle pill group */}
        <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] rounded-xl p-0.5 gap-0.5 shrink-0">
          {viewItems.map(item => (
            <button
              key={item.label}
              onClick={() => handleViewChange(item.mode)}
              title={item.disabled ? "Coming Soon" : item.label}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium border-none cursor-pointer transition-all duration-150 select-none",
                viewMode === item.mode && !item.disabled
                  ? "bg-bg-surface text-text-primary shadow-sm"
                  : item.disabled
                    ? "bg-transparent text-text-muted/50 cursor-default"
                    : "bg-transparent text-text-muted hover:text-text-secondary"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Board tabs row ── */}
      <div className="flex items-center gap-1 px-6 shrink-0 border-b border-border-subtle">
        {boards.map(b => {
          const isActive = selectedBoardId === b._id;
          return (
            <button
              key={b._id}
              onClick={() => setSelectedBoardId(b._id)}
              className={cn(
                "relative px-3 py-2.5 text-[13px] border-none cursor-pointer transition-all duration-150 bg-transparent",
                isActive
                  ? "text-text-primary font-semibold"
                  : "text-text-muted hover:text-text-secondary font-medium"
              )}
            >
              {b.name}
              {isActive && (
                <div className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
        <button
          onClick={() => setAddBoardOpen(true)}
          className="flex items-center gap-1 px-3 py-2.5 text-[13px] border-none cursor-pointer bg-transparent text-text-muted hover:text-primary transition-colors font-medium"
        >
          <Plus size={13} /> Add Board
        </button>
      </div>

      {/* ── Toolbar row ── */}
      <div className="flex items-center justify-between px-6 h-12 shrink-0">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary bg-transparent border-none cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary bg-transparent border-none cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
            <ArrowUpDown size={14} />
            Sort
          </button>
          {activeBoard && permissions.canManageBoard && (
            <button
              onClick={() => setConfigOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-colors",
                configOpen
                  ? "bg-black/[0.06] dark:bg-white/[0.08] text-text-primary"
                  : "bg-transparent text-text-secondary hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )}
            >
              <Settings2 size={14} />
              Board Settings
            </button>
          )}
        </div>

        {permissions.canEdit && (
          <Button variant="primary" size="sm" onClick={() => setPaletteOpen(true)}>
            <Plus size={14} /> New Task
          </Button>
        )}
      </div>

      {/* ── Stats bar ── */}
      {activeBoard && (
        <BoardStatsBar cards={cards} columns={activeBoard.columns} />
      )}

      {/* Loading cards */}
      {loadingCards && !cards.length && (
        <div className="flex-1 flex gap-3 px-5 py-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-[300px] shrink-0 flex flex-col gap-2">
              <div className="h-6 w-24 bg-bg-elevated animate-pulse rounded-md" />
              <div className="flex-1 rounded-xl bg-bg-elevated/30 animate-pulse min-h-[200px]" />
            </div>
          ))}
        </div>
      )}

      {/* ── Board / List view ── */}
      {activeBoard && !(loadingCards && !cards.length) && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === "board" ? (
            <KanbanBoard
              board={activeBoard}
              cards={cards}
              onCardMove={permissions.canMove ? handleCardMove : undefined}
              onCardCreate={permissions.canEdit ? handleCardCreate : undefined}
              canEdit={permissions.canEdit}
              canComment={permissions.canComment}
            />
          ) : (
            <ListView
              board={activeBoard}
              cards={cards}
              onCardCreate={permissions.canEdit ? handleCardCreate : undefined}
              canEdit={permissions.canEdit}
              canComment={permissions.canComment}
            />
          )}
        </div>
      )}

      {/* Empty -- no boards yet */}
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
            className="fixed inset-0 bg-black/60 z-[100] animate-fade-in"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-bg-surface border border-border rounded-[12px] z-[101] p-5 shadow-modal animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-semibold text-text-primary tracking-tight">New Board</h2>
              <button
                onClick={() => setAddBoardOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer text-text-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-text-secondary transition-colors"
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
              <p className="text-[13px] text-text-muted leading-relaxed">
                Creates with default columns (Ideas, Backlog, In Progress, In Review, Done).
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

      {/* Coming Soon Toast */}
      {comingSoonToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 bg-bg-elevated border border-border rounded-xl shadow-card-hover animate-[fadeUp_0.2s_cubic-bezier(0.16,1,0.3,1)]">
          <p className="text-[13px] font-medium text-text-primary">
            {comingSoonToast} view is coming soon
          </p>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        cards={cards}
        boards={boards}
        departments={departments}
        onNewCard={() => {
          const firstCol = activeBoard?.columns?.[0];
          if (firstCol) {
            const title = prompt("Task title:");
            if (title?.trim()) handleCardCreate(firstCol._id, title.trim());
          }
        }}
        onNewBoard={() => setAddBoardOpen(true)}
        onInvite={() => { window.location.href = "/settings/invites"; }}
      />
    </div>
  );
}
