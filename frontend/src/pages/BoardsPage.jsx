import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutGrid, AlertCircle } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import CreateBoardModal from '../components/boards/CreateBoardModal'
import useBoardStore from '../store/useBoardStore'
import usePermissions from '../hooks/usePermissions'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function BoardsPage() {
  const boards = useBoardStore((s) => s.boards)
  const loading = useBoardStore((s) => s.loading)
  const error = useBoardStore((s) => s.error)
  const fetchBoards = useBoardStore((s) => s.fetchBoards)
  const { canCreateBoard } = usePermissions()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  return (
    <motion.div
      className="min-h-screen bg-base px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-primary-light" strokeWidth={1.8} />
            Boards
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? 'Loading...' : `${boards.length} board${boards.length !== 1 ? 's' : ''} across your organization`}
          </p>
        </div>
        {canCreateBoard && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(4,84,252,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Create Board
          </motion.button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && boards.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface/60 border border-glass-border">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse" />
                <div className="w-2 h-8 rounded-full bg-white/5 animate-pulse" />
              </div>
              <div className="h-5 w-32 rounded bg-white/5 animate-pulse mb-2" />
              <div className="h-3 w-full rounded bg-white/5 animate-pulse mb-1" />
              <div className="h-3 w-2/3 rounded bg-white/5 animate-pulse mb-4" />
              <div className="pt-3 border-t border-glass-border/50">
                <div className="h-3 w-16 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Board Grid */}
      {(!loading || boards.length > 0) && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {boards.map((board) => (
            <GlassCard
              key={board.id}
              hover
              glow="none"
              className="p-6 cursor-pointer group"
              variants={item}
              onClick={() => navigate(`/boards/${board.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${board.color}15` }}
                >
                  {board.icon}
                </div>
                <div
                  className="w-2 h-8 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: board.color }}
                />
              </div>
              <h3 className="text-base font-heading font-semibold text-text-primary mb-1 group-hover:text-white transition-colors">
                {board.name}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">
                {board.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-glass-border/50">
                <span className="text-xs text-text-muted">
                  {board.cardCount} card{board.cardCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-primary-light opacity-0 group-hover:opacity-100 transition-opacity">
                  Open board →
                </span>
              </div>
            </GlassCard>
          ))}

          {canCreateBoard && (
            <motion.button
              variants={item}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setModalOpen(true)}
              className="border-2 border-dashed border-glass-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-glass-border-hover hover:bg-glass transition-all cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-glass border border-glass-border">
                <Plus className="w-6 h-6 text-text-muted" />
              </div>
              <span className="text-sm text-text-muted font-medium">New Board</span>
            </motion.button>
          )}
        </motion.div>
      )}

      <CreateBoardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </motion.div>
  )
}
