import { AnimatePresence } from 'framer-motion'
import KanbanCard from './KanbanCard'

const columnColors = {
  Submitted: 'bg-primary-light',
  Todo: 'bg-primary-light',
  'In Review': 'bg-amber',
  'In Progress': 'bg-amber',
  Approved: 'bg-accent-emerald',
  Review: 'bg-accent-emerald',
  Done: 'bg-accent-emerald',
}

export default function KanbanColumn({ column, boardId, onCardClick }) {
  const dotColor = columnColors[column.title] || 'bg-primary-light'

  return (
    <div className="flex flex-col w-[320px] min-w-[320px] shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <h3 className="text-sm font-heading font-semibold text-text-primary">
            {column.title}
          </h3>
          <span className="text-xs text-text-muted bg-glass px-2 py-0.5 rounded-md border border-glass-border">
            {column.cards.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 p-2 rounded-2xl bg-glass/30 border border-glass-border/50 min-h-[200px]">
        <AnimatePresence mode="popLayout">
          {column.cards.map((card, i) => (
            <KanbanCard
              key={card.id}
              card={card}
              index={i}
              columnId={column.id}
              boardId={boardId}
              onClick={onCardClick}
            />
          ))}
        </AnimatePresence>

        {column.cards.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-text-muted/50 border border-dashed border-glass-border rounded-xl">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  )
}
