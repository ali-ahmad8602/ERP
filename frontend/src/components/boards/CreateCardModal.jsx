import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2 } from 'lucide-react'
import useBoardStore from '../../store/useBoardStore'
import CustomFieldsForm, { validateCustomFields } from './CustomFieldsForm'

const priorities = [
  { value: 'none', label: 'None', color: 'bg-glass border-glass-border text-text-muted' },
  { value: 'low', label: 'Low', color: 'bg-text-muted/10 border-text-muted/20 text-text-muted' },
  { value: 'medium', label: 'Medium', color: 'bg-primary-light/10 border-primary-light/20 text-primary-light' },
  { value: 'high', label: 'High', color: 'bg-amber/10 border-amber/20 text-amber' },
  { value: 'urgent', label: 'Urgent', color: 'bg-danger/10 border-danger/20 text-danger' },
]

export default function CreateCardModal({ open, onClose, boardId, columnId, columnName }) {
  const createCard = useBoardStore((s) => s.createCard)
  const customFields = useBoardStore((s) => s.getCustomFields(boardId))
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('none')
  const [fieldValues, setFieldValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleFieldChange = (fieldId, value) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    // Validate custom fields
    if (customFields.length > 0) {
      const fieldErrors = validateCustomFields(customFields, fieldValues)
      if (fieldErrors) {
        const firstError = Object.values(fieldErrors)[0]
        setError(firstError)
        return
      }
    }

    setSaving(true)
    setError(null)
    try {
      // Convert field values to backend format: [{ field: id, value }]
      const cfPayload = Object.entries(fieldValues)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([fieldId, value]) => ({ field: fieldId, value }))

      await createCard(boardId, columnId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        customFields: cfPayload.length > 0 ? cfPayload : undefined,
      })
      setTitle('')
      setDescription('')
      setPriority('none')
      setFieldValues({})
      onClose()
    } catch {
      setError('Failed to create card. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md bg-surface/95 backdrop-blur-2xl border border-glass-border rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] pointer-events-auto overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border shrink-0">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-text-primary">
                    Create Card
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Adding to <span className="text-text-secondary font-medium">{columnName}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {error && (
                  <div className="px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Review Q1 credit application"
                    className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    autoFocus
                    disabled={saving}
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
                    placeholder="Add details..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    disabled={saving}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={[
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                          priority === p.value
                            ? `${p.color} ring-1 ring-white/10`
                            : 'bg-glass border-glass-border text-text-muted hover:bg-glass-hover',
                        ].join(' ')}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Fields */}
                <CustomFieldsForm
                  fields={customFields}
                  values={fieldValues}
                  onChange={handleFieldChange}
                  disabled={saving}
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-glass-border flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-text-secondary hover:bg-glass-hover transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(4,84,252,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {saving ? 'Creating...' : 'Create Card'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
