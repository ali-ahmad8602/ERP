"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { BoardStatsBar } from "@/components/board/BoardStatsBar";
import { BoardConfigPanel } from "@/components/board/BoardConfigPanel";
import { ListView } from "@/components/board/ListView";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Plus, LayoutGrid, List, Settings2, Columns3, X, Loader2 } from "lucide-react";
import { useBoardStore } from "@/store/board.store";
import { useDeptStore } from "@/store/dept.store";

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
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#080808", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ width: 28, height: 28, border: "2px solid #1A1A1A", borderTopColor: "#0454FC", borderRadius: "50%" }} className="animate-spin" />
        <p style={{ fontSize: 13, color: "#444" }}>Loading department...</p>
      </div>
    );
  }

  // Department not found
  if (!deptLoading && !dept) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#080808", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Columns3 size={32} color="#222" />
        <p style={{ fontSize: 14, color: "#555" }}>Department not found</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#080808" }}>

      <Topbar
        department={dept as Parameters<typeof Topbar>[0]["department"]}
        board={activeBoard ?? undefined}
        onSearchClick={() => setPaletteOpen(true)}
      />

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 44, borderBottom: "1px solid #1A1A1A",
        background: "#0A0A0A", flexShrink: 0,
      }}>
        {/* Board tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {boards.map(b => {
            const isActive = selectedBoardId === b._id;
            return (
              <button key={b._id} onClick={() => setSelectedBoardId(b._id)} style={{
                padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: isActive ? 500 : 400,
                border: "none", cursor: "pointer", transition: "all 0.1s",
                background: isActive ? "#161616" : "transparent",
                color: isActive ? "#D0D0D0" : "#555",
              }}>
                {b.name}
              </button>
            );
          })}
          <button onClick={() => setAddBoardOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
            borderRadius: 7, fontSize: 12, border: "none", cursor: "pointer",
            background: "transparent", color: "#333", transition: "all 0.1s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#161616"; (e.currentTarget as HTMLElement).style.color = "#888"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#333"; }}
          >
            <Plus size={11} /> Board
          </button>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {([
            { icon: <LayoutGrid size={13} />, label: "Board", mode: "board" as const },
            { icon: <List size={13} />,       label: "List",  mode: "list"  as const },
          ] as const).map(item => (
            <button key={item.label} onClick={() => setViewMode(item.mode)} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
              borderRadius: 7, fontSize: 12, border: "none", cursor: "pointer",
              background: viewMode === item.mode ? "#161616" : "transparent",
              color: viewMode === item.mode ? "#D0D0D0" : "#555",
              transition: "all 0.1s",
            }}>
              {item.icon} {item.label}
            </button>
          ))}

          <div style={{ width: 1, height: 16, background: "#1E1E1E", margin: "0 4px" }} />

          {activeBoard && (
            <button onClick={() => setConfigOpen(true)} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
              borderRadius: 7, fontSize: 12, border: "none", cursor: "pointer",
              background: configOpen ? "#161616" : "transparent",
              color: configOpen ? "#888" : "#555", transition: "all 0.1s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#161616"; (e.currentTarget as HTMLElement).style.color = "#888"; }}
              onMouseLeave={e => { if (!configOpen) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#555"; } }}
            >
              <Settings2 size={13} /> Configure
            </button>
          )}

          <button onClick={() => setPaletteOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500,
            border: "none", cursor: "pointer",
            background: "#0454FC", color: "white", transition: "background 0.1s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#3B7BFF"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#0454FC"}
          >
            <Plus size={12} /> New Card
          </button>
        </div>
      </div>

      {/* Stats */}
      {activeBoard && (
        <BoardStatsBar cards={cards} columns={activeBoard.columns} />
      )}

      {/* Loading cards */}
      {loadingCards && !cards.length && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 28, height: 28, border: "2px solid #1A1A1A", borderTopColor: "#0454FC", borderRadius: "50%" }} className="animate-spin" />
          <p style={{ fontSize: 13, color: "#444" }}>Loading board...</p>
        </div>
      )}

      {/* Board / List view */}
      {activeBoard && !(loadingCards && !cards.length) && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <Columns3 size={32} color="#222" />
          <p style={{ fontSize: 14, color: "#555" }}>No boards yet for {dept.name}</p>
          <button onClick={() => setAddBoardOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, background: "#0454FC", color: "white", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>
            <Plus size={13} /> Create First Board
          </button>
        </div>
      )}

      {/* Board Config Panel */}
      {configOpen && activeBoard && (
        <BoardConfigPanel board={activeBoard} onClose={() => setConfigOpen(false)} />
      )}

      {/* Add Board Modal */}
      {addBoardOpen && (
        <>
          <div onClick={() => setAddBoardOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, backdropFilter: "blur(4px)", animation: "fadeIn 0.12s ease-out" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 400, background: "#0F0F0F", border: "1px solid #2A2A2A",
            borderRadius: 14, zIndex: 101, padding: 24,
            boxShadow: "0 40px 80px rgba(0,0,0,0.9)",
            animation: "fadeUp 0.18s cubic-bezier(0.16,1,0.3,1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#EBEBEB" }}>New Board</h2>
              <button onClick={() => setAddBoardOpen(false)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "#444" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1A1A1A"; e.currentTarget.style.color = "#888"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
              ><X size={14} /></button>
            </div>
            <form onSubmit={handleCreateBoard} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Board Name</label>
                <input
                  value={newBoardName} onChange={e => setNewBoardName(e.target.value)}
                  placeholder="e.g. Q3 Backlog, Sprint Board"
                  autoFocus required
                  style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#F3F3F3", outline: "none", boxSizing: "border-box" }}
                  className="input-field"
                />
              </div>
              <p style={{ fontSize: 12, color: "#444" }}>
                Creates with default columns (Ideas → Backlog → In Progress → In Review → Done).
              </p>
              <button type="submit" disabled={!newBoardName.trim() || creatingBoard} style={{
                width: "100%", padding: "10px 0", borderRadius: 9, border: "none",
                fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: newBoardName.trim() && !creatingBoard ? "#0454FC" : "#1A1A1A",
                color: newBoardName.trim() && !creatingBoard ? "white" : "#444",
                cursor: newBoardName.trim() && !creatingBoard ? "pointer" : "not-allowed",
              }}
                onMouseEnter={e => { if (newBoardName.trim() && !creatingBoard) e.currentTarget.style.background = "#3B7BFF"; }}
                onMouseLeave={e => { if (newBoardName.trim() && !creatingBoard) e.currentTarget.style.background = "#0454FC"; }}
              >
                {creatingBoard && <Loader2 size={14} className="animate-spin" />}
                {creatingBoard ? "Creating..." : "Create Board"}
              </button>
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
