import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutGrid } from 'lucide-react'
import KanbanColumn from '../components/boards/KanbanColumn'
import CardDetailDrawer from '../components/boards/CardDetailDrawer'
import useBoardStore from '../store/useBoardStore'

export default function BoardViewPage() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const boards = useBoardStore((s) => s.boards)
  const getColumns = useBoardStore((s) => s.getColumns)
  const moveCard = useBoardStore((s) => s.moveCard)
  const fetchBoardById = useBoardStore((s) => s.fetchBoardById)
  const columnsByBoard = useBoardStore((s) => s.columnsByBoard)

  const [selectedCard, setSelectedCard] = useState(null)

  // Fetch real board data, fallback to mock via getColumns
  useEffect(() => {
    fetchBoardById(boardId)
  }, [boardId])

  const columns = useMemo(() => getColumns(boardId), [boardId, columnsByBoard])
  const board = boards.find((b) => b.id === boardId)

  // Listen for drag events to move cards between columns
  useEffect(() => {
    function handleDrag(e) {
      const { cardId, columnId, direction } = e.detail
      if (e.detail.boardId !== boardId) return

      const colIndex = columns.findIndex((c) => c.id === columnId)
      if (colIndex === -1) return

      const targetIndex = direction === 'right' ? colIndex + 1 : colIndex - 1
      if (targetIndex < 0 || targetIndex >= columns.length) return

      moveCard(boardId, cardId, columnId, columns[targetIndex].id)
    }

    window.addEventListener('kanban-card-drag', handleDrag)
    return () => window.removeEventListener('kanban-card-drag', handleDrag)
  }, [boardId, columns, moveCard])

  if (!board) {
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
          </div>
        </div>
      </div>

      {/* Kanban Board — Horizontal Scroll */}
      <div className="flex-1 overflow-x-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-5 min-w-min pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              boardId={boardId}
              onCardClick={setSelectedCard}
            />
          ))}
        </div>
      </div>

      {/* Card Detail Drawer */}
      <CardDetailDrawer
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </motion.div>
  )
}
