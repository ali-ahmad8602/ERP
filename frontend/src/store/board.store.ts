import { create } from "zustand";
import { boardApi, cardApi } from "@/lib/api";

interface BoardColumn {
  _id: string;
  name: string;
  color: string;
  order: number;
}

interface Board {
  _id: string;
  name: string;
  columns?: BoardColumn[];
  customFields?: any[];
  settings?: any;
}

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  cards: any[];
  loadingBoards: boolean;
  loadingCards: boolean;

  fetchBoards: (deptId: string) => Promise<Board[]>;
  fetchBoard: (boardId: string) => Promise<void>;
  fetchCards: (boardId: string) => Promise<void>;
  createCard: (data: { title: string; board: string; column: string }) => Promise<void>;
  moveCard: (cardId: string, columnId: string, order: number) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>()((set, get) => ({
  boards: [],
  activeBoard: null,
  cards: [],
  loadingBoards: false,
  loadingCards: false,

  fetchBoards: async (deptId: string) => {
    set({ loadingBoards: true });
    try {
      const { boards } = await boardApi.list(deptId);
      set({ boards, loadingBoards: false });
      return boards;
    } catch (err) {
      set({ loadingBoards: false });
      throw err;
    }
  },

  fetchBoard: async (boardId: string) => {
    set({ loadingBoards: true });
    try {
      const { board } = await boardApi.get(boardId);
      set({ activeBoard: board, loadingBoards: false });
    } catch (err) {
      set({ loadingBoards: false });
      throw err;
    }
  },

  fetchCards: async (boardId: string) => {
    set({ loadingCards: true });
    try {
      const { cards } = await cardApi.list(boardId);
      set({ cards, loadingCards: false });
    } catch (err) {
      set({ loadingCards: false });
      throw err;
    }
  },

  createCard: async (data) => {
    try {
      const { card } = await cardApi.create(data);
      set((state) => ({ cards: [...state.cards, card] }));
    } catch (err) {
      console.error("Failed to create card:", err);
      throw err;
    }
  },

  moveCard: async (cardId: string, columnId: string, order: number) => {
    // Optimistic update
    const prevCards = get().cards;
    set((state) => ({
      cards: state.cards.map((c) =>
        c._id === cardId ? { ...c, column: columnId, order } : c
      ),
    }));

    try {
      await cardApi.move(cardId, columnId, order);
    } catch {
      // Revert on failure
      set({ cards: prevCards });
    }
  },

  deleteCard: async (cardId: string) => {
    const prevCards = get().cards;
    set((state) => ({
      cards: state.cards.filter((c) => c._id !== cardId),
    }));

    try {
      await cardApi.delete(cardId);
    } catch {
      set({ cards: prevCards });
    }
  },
}));
