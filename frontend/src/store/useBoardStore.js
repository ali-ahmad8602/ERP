import { create } from 'zustand'
import { boards as initialBoards, getColumnsForBoard } from '../data/mockBoards'
import * as boardsApi from '../api/boards'

/**
 * Normalize backend board to match the UI card-grid shape.
 * Backend: { _id, name, description, department, columns, isCompanyBoard, ... }
 * UI:      { id, name, description, icon, color, cardCount }
 */
function normalizeBoard(b) {
  return {
    id: b._id,
    name: b.name,
    description: b.description || '',
    icon: b.department?.icon || '📋',
    color: b.department?.color || '#0454FC',
    cardCount: b._cardCount ?? 0,
    columns: b.columns || [],
    _raw: b,
  }
}

/**
 * Convert backend board columns + cards into the flat column→cards structure
 * that KanbanColumn / BoardViewPage expect.
 */
function buildColumns(board, cards) {
  const cols = (board.columns || [])
    .sort((a, b) => a.order - b.order)
    .map((col) => ({
      id: col._id,
      title: col.name,
      color: col.color,
      cards: [],
    }))

  for (const card of cards) {
    const col = cols.find((c) => c.id === card.column)
    if (col) {
      col.cards.push({
        id: card._id,
        title: card.title,
        description: card.description || '',
        status: card.approval?.status || 'none',
        priority: card.priority || 'none',
        assignee: card.assignees?.[0]?.name || '',
        department: card.department?.name || '',
        date: card.dueDate || '',
        activity: (card.auditLog || []).map((a) => ({
          user: a.user?.name || '',
          action: a.detail || a.action,
          time: a.createdAt,
        })),
        _raw: card,
      })
    }
  }

  return cols
}

const useBoardStore = create((set, get) => ({
  boards: initialBoards,
  columnsByBoard: {},
  loading: false,
  error: null,

  fetchBoards: async () => {
    set({ loading: true, error: null })
    try {
      const data = await boardsApi.getAllBoards()
      set({
        boards: data.boards.map(normalizeBoard),
        loading: false,
      })
    } catch {
      // Keep mock data as fallback
      set({ loading: false, error: 'Failed to load boards' })
    }
  },

  fetchBoardById: async (boardId) => {
    set({ loading: true, error: null })
    try {
      const [boardData, cardsData] = await Promise.all([
        boardsApi.getBoardById(boardId),
        boardsApi.getCards(boardId),
      ])
      const cols = buildColumns(boardData.board, cardsData.cards)
      set((state) => ({
        columnsByBoard: { ...state.columnsByBoard, [boardId]: cols },
        loading: false,
      }))
      return cols
    } catch {
      // Fallback to mock columns
      const cols = getColumnsForBoard(boardId)
      set((state) => ({
        columnsByBoard: { ...state.columnsByBoard, [boardId]: cols },
        loading: false,
        error: 'Failed to load board — showing sample data',
      }))
      return cols
    }
  },

  getColumns: (boardId) => {
    const cached = get().columnsByBoard[boardId]
    if (cached) return cached
    const cols = getColumnsForBoard(boardId)
    set((state) => ({
      columnsByBoard: { ...state.columnsByBoard, [boardId]: cols },
    }))
    return cols
  },

  moveCard: (boardId, cardId, fromColId, toColId) =>
    set((state) => {
      const cols = state.columnsByBoard[boardId]
      if (!cols) return state

      const fromCol = cols.find((c) => c.id === fromColId)
      const toCol = cols.find((c) => c.id === toColId)
      if (!fromCol || !toCol || fromColId === toColId) return state

      const card = fromCol.cards.find((c) => c.id === cardId)
      if (!card) return state

      const updatedCols = cols.map((col) => {
        if (col.id === fromColId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
        }
        if (col.id === toColId) {
          return { ...col, cards: [...col.cards, card] }
        }
        return col
      })

      return {
        columnsByBoard: { ...state.columnsByBoard, [boardId]: updatedCols },
      }
    }),

  moveCardAsync: async (boardId, cardId, fromColId, toColId) => {
    // Optimistic local move
    get().moveCard(boardId, cardId, fromColId, toColId)
    try {
      await boardsApi.moveCard(cardId, toColId)
    } catch {
      // Revert on failure
      get().moveCard(boardId, cardId, toColId, fromColId)
    }
  },

  addBoard: async (boardData) => {
    try {
      const data = await boardsApi.createBoard(boardData)
      const board = normalizeBoard(data.board)
      set((state) => ({ boards: [...state.boards, board] }))
      return board
    } catch {
      // Fallback to local-only add
      const board = {
        ...boardData,
        id: boardData.name.toLowerCase().replace(/\s+/g, '-'),
        cardCount: 0,
      }
      set((state) => ({ boards: [...state.boards, board] }))
      return board
    }
  },
}))

export default useBoardStore
