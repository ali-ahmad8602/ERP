import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import KanbanCard from './KanbanCard'

const columnColors = {
  Ideas: 'bg-text-muted',
  Submitted: 'bg-primary-light',
  Backlog: 'bg-text-muted',
  Todo: 'bg-primary-light',
  'In Review': 'bg-amber',
  'In Progress': 'bg-amber',
  Approved: 'bg-accent-emerald',
  Review: 'bg-accent-emerald',
  Done: 'bg-accent-emerald',
}

export default function KanbanColumn({ column, boardId, onCardClick, onAddCard, readOnly }) {
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
        {onAddCard && (
          <button
            onClick={() => onAddCard(column.id, column.title)}
            className="p-1 rounded-lg hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer"
            title={`Add card to ${column.title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
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
              readOnly={readOnly}
            />
          ))}
        </AnimatePresence>

        {column.cards.length === 0 && (
          onAddCard ? (
            <button
              onClick={() => onAddCard(column.id, column.title)}
              className="flex items-center justify-center gap-2 w-full h-24 text-xs text-text-muted/50 border border-dashed border-glass-border rounded-xl hover:bg-glass-hover hover:text-text-muted hover:border-glass-border-hover transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a card
            </button>
          ) : (
            <div className="flex items-center justify-center h-24 text-xs text-text-muted/50 border border-dashed border-glass-border rounded-xl">
              No cards
            </div>
          )
        )}
      </div>
    </div>
  )
}
