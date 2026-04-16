import { create } from "zustand";
import { boardApi, cardApi } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import type { Board, Card } from "@/types";

interface BoardState {
  boards:        Board[];
  activeBoard:   Board | null;
  cards:         Card[];
  loadingBoards: boolean;
  loadingCards:  boolean;
  error:         string | null;

  fetchBoards:   (deptId?: string, companyBoards?: boolean) => Promise<void>;
  fetchBoard:    (boardId: string) => Promise<void>;
  fetchCards:    (boardId: string) => Promise<void>;
  createBoard:   (data: { name: string; description?: string; department?: string; isCompanyBoard?: boolean }) => Promise<Board>;
  updateBoard:   (boardId: string, data: object) => Promise<void>;
  deleteBoard:   (boardId: string) => Promise<void>;

  createCard:    (data: Parameters<typeof cardApi.create>[0]) => Promise<Card>;
  updateCard:    (cardId: string, data: object) => Promise<void>;
  moveCard:      (cardId: string, columnId: string, order?: number) => Promise<void>;
  deleteCard:    (cardId: string) => Promise<void>;

  addColumn:     (boardId: string, name: string, color?: string) => Promise<void>;
  deleteColumn:  (boardId: string, colId: string) => Promise<void>;
  addField:      (boardId: string, data: { name: string; type: string; options?: string[]; required?: boolean }) => Promise<void>;
  deleteField:   (boardId: string, fieldId: string) => Promise<void>;

  uploadAttachment:  (cardId: string, file: File) => Promise<void>;
  deleteAttachment:  (cardId: string, attachmentId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards:        [],
  activeBoard:   null,
  cards:         [],
  loadingBoards: false,
  loadingCards:  false,
  error:         null,

  fetchBoards: async (deptId, companyBoards) => {
    set({ loadingBoards: true, error: null });
    try {
      const { boards } = await boardApi.list(deptId, companyBoards);
      set({ boards });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch boards";
      set({ error: msg });
      toast("error", msg);
    } finally {
      set({ loadingBoards: false });
    }
  },

  fetchBoard: async (boardId) => {
    try {
      const { board } = await boardApi.get(boardId);
      set({ activeBoard: board });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch board";
      set({ error: msg });
      toast("error", msg);
    }
  },

  fetchCards: async (boardId) => {
    set({ loadingCards: true, error: null });
    try {
      const { cards } = await cardApi.list(boardId);
      set({ cards });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch cards";
      set({ error: msg });
      toast("error", msg);
    } finally {
      set({ loadingCards: false });
    }
  },

  createBoard: async (data) => {
    const { board } = await boardApi.create(data);
    set(s => ({ boards: [...s.boards, board] }));
    return board;
  },

  updateBoard: async (boardId, data) => {
    const { board } = await boardApi.update(boardId, data);
    set(s => ({
      boards: s.boards.map(b => b._id === boardId ? board : b),
      activeBoard: s.activeBoard?._id === boardId ? board : s.activeBoard,
    }));
  },

  deleteBoard: async (boardId) => {
    await boardApi.delete(boardId);
    set(s => ({ boards: s.boards.filter(b => b._id !== boardId) }));
  },

  createCard: async (data) => {
    const { card } = await cardApi.create(data);
    set(s => ({ cards: [...s.cards, card] }));
    return card;
  },

  updateCard: async (cardId, data) => {
    const { card } = await cardApi.update(cardId, data);
    set(s => ({ cards: s.cards.map(c => c._id === cardId ? card : c) }));
  },

  moveCard: async (cardId, columnId, order) => {
    // Optimistic update
    set(s => ({ cards: s.cards.map(c => c._id === cardId ? { ...c, column: columnId } : c) }));
    try {
      const { card } = await cardApi.move(cardId, columnId, order);
      set(s => ({ cards: s.cards.map(c => c._id === cardId ? card : c) }));
    } catch {
      // Revert on failure — re-fetch
      const boardId = get().activeBoard?._id;
      if (boardId) get().fetchCards(boardId);
    }
  },

  deleteCard: async (cardId) => {
    await cardApi.delete(cardId);
    set(s => ({ cards: s.cards.filter(c => c._id !== cardId) }));
  },

  addColumn: async (boardId, name, color) => {
    const { board } = await boardApi.addColumn(boardId, name, color);
    set(s => ({
      activeBoard: s.activeBoard?._id === boardId ? board : s.activeBoard,
    }));
  },

  deleteColumn: async (boardId, colId) => {
    const { board } = await boardApi.deleteColumn(boardId, colId);
    set(s => ({
      activeBoard: s.activeBoard?._id === boardId ? board : s.activeBoard,
    }));
  },

  addField: async (boardId, data) => {
    const { board } = await boardApi.addField(boardId, data);
    set(s => ({
      activeBoard: s.activeBoard?._id === boardId ? board : s.activeBoard,
    }));
  },

  deleteField: async (boardId, fieldId) => {
    const { board } = await boardApi.deleteField(boardId, fieldId);
    set(s => ({
      activeBoard: s.activeBoard?._id === boardId ? board : s.activeBoard,
    }));
  },

  uploadAttachment: async (cardId, file) => {
    const { card } = await cardApi.uploadAttachment(cardId, file);
    set(s => ({ cards: s.cards.map(c => c._id === cardId ? card : c) }));
  },

  deleteAttachment: async (cardId, attachmentId) => {
    const { card } = await cardApi.deleteAttachment(cardId, attachmentId);
    set(s => ({ cards: s.cards.map(c => c._id === cardId ? card : c) }));
  },
}));
