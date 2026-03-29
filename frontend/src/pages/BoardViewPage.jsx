import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, AlertCircle, Settings } from 'lucide-react'
import KanbanColumn from '../components/boards/KanbanColumn'
import CardDetailDrawer from '../components/boards/CardDetailDrawer'
import CreateCardModal from '../components/boards/CreateCardModal'
import CustomFieldsManager from '../components/boards/CustomFieldsManager'
import useBoardStore from '../store/useBoardStore'
import usePermissions from '../hooks/usePermissions'

export default function BoardViewPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const boards = useBoardStore((s) => s.boards)
  const moveCardAsync = useBoardStore((s) => s.moveCardAsync)
  const fetchBoardById = useBoardStore((s) => s.fetchBoardById)
  const columnsByBoard = useBoardStore((s) => s.columnsByBoard)
  const loading = useBoardStore((s) => s.loading)
  const error = useBoardStore((s) => s.error)

  const { canCreateCard, canMoveCard, isReadOnly, canAccessSettings } = usePermissions()
  const [selectedCard, setSelectedCard] = useState(null)
  const [cardModal, setCardModal] = useState({ open: false, columnId: null, columnName: '' })
  const [fieldsManagerOpen, setFieldsManagerOpen] = useState(false)

  useEffect(() => {
    fetchBoardById(boardId)
  }, [boardId, fetchBoardById])

  const columns = useMemo(() => columnsByBoard[boardId] || [], [boardId, columnsByBoard])
  const board = boards.find((b) => b.id === boardId)

  // Listen for drag events — uses moveCardAsync for backend persistence
  useEffect(() => {
    if (!canMoveCard) return // read-only users can't drag
    function handleDrag(e) {
      const { cardId, columnId, direction } = e.detail
      if (e.detail.boardId !== boardId) return

      const colIndex = columns.findIndex((c) => c.id === columnId)
      if (colIndex === -1) return

      const targetIndex = direction === 'right' ? colIndex + 1 : colIndex - 1
      if (targetIndex < 0 || targetIndex >= columns.length) return

      moveCardAsync(boardId, cardId, columnId, columns[targetIndex].id)
    }

    window.addEventListener('kanban-card-drag', handleDrag)
    return () => window.removeEventListener('kanban-card-drag', handleDrag)
  }, [boardId, columns, moveCardAsync, canMoveCard])

  const handleAddCard = (columnId, columnName) => {
    setCardModal({ open: true, columnId, columnName })
  }

  if (!board && !loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Board not found</p>
          <Link to="/boards" className="text-sm text-primary-light hover:text-primary-light/80 transition-colors">
            ← Back to boards
          </Link>
        </div>
      </div>
    )
  }

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0)

  return (
    <motion.div
      className="min-h-screen bg-base flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Board Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-glass-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/boards')}
              className="p-2 rounded-xl hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {board && (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${board.color}15` }}
                >
                  {board.icon}
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-text-primary tracking-tight">
                    {board.name}
                  </h1>
                  <p className="text-xs text-text-muted">
                    {totalCards} card{totalCards !== 1 ? 's' : ''} · {columns.length} columns
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canAccessSettings && (
              <button
                onClick={() => setFieldsManagerOpen(true)}
                title="Custom Fields"
                className="p-2 rounded-xl hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            {canCreateCard && columns.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAddCard(columns[0].id, columns[0].title)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(4,84,252,0.3)]"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && columns.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-text-muted animate-pulse">Loading board...</div>
        </div>
      )}

      {/* Kanban Board — Horizontal Scroll */}
      {columns.length > 0 && (
        <div className="flex-1 overflow-x-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-5 min-w-min pb-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                boardId={boardId}
                onCardClick={setSelectedCard}
                onAddCard={canCreateCard ? handleAddCard : null}
                readOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      )}

      {/* Card Detail Drawer */}
      <CardDetailDrawer
        card={selectedCard}
        boardId={boardId}
        onClose={() => setSelectedCard(null)}
        onArchived={() => setSelectedCard(null)}
        readOnly={isReadOnly}
      />

      {/* Create Card Modal */}
      <CreateCardModal
        open={cardModal.open}
        onClose={() => setCardModal({ open: false, columnId: null, columnName: '' })}
        boardId={boardId}
        columnId={cardModal.columnId}
        columnName={cardModal.columnName}
      />
      {/* Custom Fields Manager */}
      <CustomFieldsManager
        open={fieldsManagerOpen}
        onClose={() => setFieldsManagerOpen(false)}
        boardId={boardId}
      />
    </motion.div>
  )
}
