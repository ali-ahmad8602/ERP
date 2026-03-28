import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import useBoardStore from '../../store/useBoardStore'

const icons = ['📋', '💳', '📄', '🏦', '🛡️', '🤝', '📊', '🎯', '⚡', '🔧']
const colors = ['#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#FF3B3B']

export default function CreateBoardModal({ open, onClose }) {
  const addBoard = useBoardStore((s) => s.addBoard)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📋')
  const [color, setColor] = useState('#0EA5E9')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addBoard({ name: name.trim(), description: description.trim(), icon, color })
    setName('')
    setDescription('')
    setIcon('📋')
    setColor('#0EA5E9')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md bg-surface/95 backdrop-blur-2xl border border-glass-border rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border">
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  Create Board
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Board Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Credit Review Pipeline"
                    className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this board for?"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                {/* Icon picker */}
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {icons.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={[
                          'w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all cursor-pointer',
                          icon === ic
                            ? 'bg-glass-hover border border-glass-border-hover scale-110'
                            : 'bg-glass border border-glass-border hover:bg-glass-hover',
                        ].join(' ')}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={[
                          'w-8 h-8 rounded-full transition-all cursor-pointer',
                          color === c ? 'ring-2 ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-105',
                        ].join(' ')}
                        style={{ backgroundColor: c, ringColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-glass-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text-secondary hover:bg-glass-hover transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(4,84,252,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Create Board
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
