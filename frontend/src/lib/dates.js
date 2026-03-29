/**
 * Shared due-date status logic.
 * Returns a status object for visual indicators across KanbanCard, CardDetailDrawer, etc.
 */

/**
 * @param {string|Date|null} dueDate
 * @returns {{ status: 'overdue'|'due-today'|'due-soon'|'upcoming'|'none', label: string, color: string, bg: string, border: string }}
 */
export function getDueDateStatus(dueDate) {
  if (!dueDate) return { status: 'none', label: '', color: '', bg: '', border: '' }

  const now = new Date()
  const due = new Date(dueDate)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = due.getTime() - startOfToday.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays)
    return {
      status: 'overdue',
      label: absDays === 1 ? '1 day overdue' : `${absDays} days overdue`,
      color: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/30',
    }
  }

  if (diffDays === 0) {
    return {
      status: 'due-today',
      label: 'Due today',
      color: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/20',
    }
  }

  if (diffDays <= 2) {
    return {
      status: 'due-soon',
      label: diffDays === 1 ? 'Due tomorrow' : `Due in ${diffDays} days`,
      color: 'text-amber',
      bg: 'bg-amber/10',
      border: 'border-amber/20',
    }
  }

  return {
    status: 'upcoming',
    label: '',
    color: 'text-text-muted',
    bg: '',
    border: '',
  }
}

/**
 * Format a date string for display.
 */
export function formatDate(iso, style = 'short') {
  if (!iso) return '—'
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'

  if (style === 'long') {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
