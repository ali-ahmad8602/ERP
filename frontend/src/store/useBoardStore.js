import { create } from 'zustand'
import * as boardsApi from '../api/boards'

/**
 * Normalize backend board to match the UI card-grid shape.
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
    departmentId: b.department?._id || b.department || null,
    _raw: b,
  }
}

/**
 * Normalize a single card from backend shape to UI shape.
 */
function normalizeCard(card) {
  return {
    id: card._id,
    title: card.title,
    description: card.description || '',
    status: card.approval?.status || 'none',
    approval: card.approval ? {
      required: card.approval.required,
      status: card.approval.status,
      approvers: (card.approval.approvers || []).map((u) =>
        typeof u === 'string' ? { id: u } : { id: u._id, name: u.name, email: u.email }
      ),
      approvedBy: (card.approval.approvedBy || []).map((u) =>
        typeof u === 'string' ? { id: u } : { id: u._id, name: u.name }
      ),
      rejectionReason: card.approval.rejectionReason || '',
    } : null,
    priority: card.priority || 'none',
    assignee: card.assignees?.[0]?.name || '',
    department: card.department?.name || '',
    date: card.dueDate || '',
    auditLog: (card.auditLog || []).map((a) => ({
      user: a.user?.name || a.user || '',
      action: a.action,
      detail: a.detail || '',
      time: a.createdAt,
    })),
    customFields: (card.customFields || []).map((cf) => ({
      field: cf.field,
      value: cf.value,
    })),
    comments: card.comments || [],
    attachments: (card.attachments || []).map((a) => ({
      id: a._id,
      name: a.name,
      url: a.url,
      uploadedBy: a.uploadedBy?.name || '',
      uploadedAt: a.uploadedAt,
    })),
    _raw: card,
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
      col.cards.push(normalizeCard(card))
    }
  }

  return cols
}

const useBoardStore = create((set, get) => ({
  boards: [],
  columnsByBoard: {},
  customFieldsByBoard: {}, // boardId → [{ id, name, type, options, required, order }]
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
      const fields = (boardData.board.customFields || []).map((f) => ({
        id: f._id,
        name: f.name,
        type: f.type,
        options: f.options || [],
        required: f.required || false,
        order: f.order ?? 0,
      }))
      set((state) => ({
        columnsByBoard: { ...state.columnsByBoard, [boardId]: cols },
        customFieldsByBoard: { ...state.customFieldsByBoard, [boardId]: fields },
        loading: false,
      }))
      return cols
    } catch {
      set({ loading: false, error: 'Failed to load board' })
      return []
    }
  },

  getColumns: (boardId) => {
    return get().columnsByBoard[boardId] || []
  },

  // ─── Card Move (optimistic + API sync) ─────────────────────────────────────

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
    get().moveCard(boardId, cardId, fromColId, toColId)
    try {
      await boardsApi.moveCard(cardId, toColId)
    } catch {
      // Revert on failure
      get().moveCard(boardId, cardId, toColId, fromColId)
    }
  },

  // ─── Board Creation ─────────────────────────────────────────────────────────

  addBoard: async (boardData) => {
    const data = await boardsApi.createBoard(boardData)
    const board = normalizeBoard(data.board)
    set((state) => ({ boards: [...state.boards, board] }))
    return board
  },

  // ─── Card Creation ──────────────────────────────────────────────────────────

  createCard: async (boardId, columnId, cardData) => {
    const data = await boardsApi.createCard({
      ...cardData,
      board: boardId,
      column: columnId,
    })
    // Add normalized card to the correct column in local state
    const card = normalizeCard(data.card)
    set((state) => {
      const cols = state.columnsByBoard[boardId]
      if (!cols) return state
      const updatedCols = cols.map((col) => {
        if (col.id === columnId) {
          return { ...col, cards: [...col.cards, card] }
        }
        return col
      })
      return {
        columnsByBoard: { ...state.columnsByBoard, [boardId]: updatedCols },
      }
    })
    return card
  },

  // ─── Card Comments ──────────────────────────────────────────────────────────

  addComment: async (cardId, text) => {
    const data = await boardsApi.addComment(cardId, text)
    return data.comments
  },

  // ─── Custom Fields ──────────────────────────────────────────────────────────

  getCustomFields: (boardId) => get().customFieldsByBoard[boardId] || [],

  addCustomField: async (boardId, fieldData) => {
    const data = await boardsApi.createCustomField(boardId, fieldData)
    const fields = (data.board.customFields || []).map((f) => ({
      id: f._id, name: f.name, type: f.type, options: f.options || [],
      required: f.required || false, order: f.order ?? 0,
    }))
    set((state) => ({
      customFieldsByBoard: { ...state.customFieldsByBoard, [boardId]: fields },
    }))
  },

  updateCustomField: async (boardId, fieldId, fieldData) => {
    const data = await boardsApi.updateCustomField(boardId, fieldId, fieldData)
    const fields = (data.board.customFields || []).map((f) => ({
      id: f._id, name: f.name, type: f.type, options: f.options || [],
      required: f.required || false, order: f.order ?? 0,
    }))
    set((state) => ({
      customFieldsByBoard: { ...state.customFieldsByBoard, [boardId]: fields },
    }))
  },

  deleteCustomField: async (boardId, fieldId) => {
    const data = await boardsApi.deleteCustomField(boardId, fieldId)
    const fields = (data.board.customFields || []).map((f) => ({
      id: f._id, name: f.name, type: f.type, options: f.options || [],
      required: f.required || false, order: f.order ?? 0,
    }))
    set((state) => ({
      customFieldsByBoard: { ...state.customFieldsByBoard, [boardId]: fields },
    }))
  },

  // ─── Approval ───────────────────────────────────────────────────────────────

  approveCard: async (boardId, cardId) => {
    const data = await boardsApi.approveCard(cardId)
    // Replace the card in local state with refreshed version
    const updatedCard = normalizeCard(data.card)
    set((state) => {
      const cols = state.columnsByBoard[boardId]
      if (!cols) return state
      const updatedCols = cols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === cardId ? updatedCard : c)),
      }))
      return { columnsByBoard: { ...state.columnsByBoard, [boardId]: updatedCols } }
    })
    return updatedCard
  },

  rejectCard: async (boardId, cardId, reason) => {
    const data = await boardsApi.rejectCard(cardId, reason)
    const updatedCard = normalizeCard(data.card)
    set((state) => {
      const cols = state.columnsByBoard[boardId]
      if (!cols) return state
      const updatedCols = cols.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === cardId ? updatedCard : c)),
      }))
      return { columnsByBoard: { ...state.columnsByBoard, [boardId]: updatedCols } }
    })
    return updatedCard
  },

  // ─── Card Archive ───────────────────────────────────────────────────────────

  archiveCard: async (boardId, cardId) => {
    await boardsApi.archiveCard(cardId)
    // Remove card from local state
    set((state) => {
      const cols = state.columnsByBoard[boardId]
      if (!cols) return state
      const updatedCols = cols.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }))
      return {
        columnsByBoard: { ...state.columnsByBoard, [boardId]: updatedCols },
      }
    })
  },
}))

export default useBoardStore
