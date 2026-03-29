import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Loader2, Settings, GripVertical } from 'lucide-react'
import useBoardStore from '../../store/useBoardStore'

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'url', label: 'URL' },
  { value: 'user', label: 'User Picker' },
]

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all'

function AddFieldForm({ boardId, onDone }) {
  const addCustomField = useBoardStore((s) => s.addCustomField)
  const [name, setName] = useState('')
  const [type, setType] = useState('text')
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const data = { name: name.trim(), type, required }
      if (type === 'dropdown' && options.trim()) {
        data.options = options.split(',').map((o) => o.trim()).filter(Boolean)
      }
      await addCustomField(boardId, data)
      setName('')
      setType('text')
      setRequired(false)
      setOptions('')
      onDone?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add field')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 rounded-xl bg-glass/50 border border-glass-border">
      {error && (
        <div className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">{error}</div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Field name"
          className={`${inputClass} flex-1`}
          autoFocus
          disabled={saving}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={saving}
          className={`${inputClass} w-32`}
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      {type === 'dropdown' && (
        <input
          type="text"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          placeholder="Options (comma-separated)"
          className={inputClass}
          disabled={saving}
        />
      )}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="rounded border-glass-border"
            disabled={saving}
          />
          Required field
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onDone} disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:bg-glass-hover transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={!name.trim() || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-40">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add
          </button>
        </div>
      </div>
    </form>
  )
}

export default function CustomFieldsManager({ open, onClose, boardId }) {
  const fields = useBoardStore((s) => s.getCustomFields(boardId))
  const deleteField = useBoardStore((s) => s.deleteCustomField)
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (fieldId) => {
    setDeletingId(fieldId)
    try {
      await deleteField(boardId, fieldId)
    } catch { /* ignore */ }
    setDeletingId(null)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            <div className="w-full max-w-lg bg-surface/95 backdrop-blur-2xl border border-glass-border rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] pointer-events-auto overflow-hidden max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border shrink-0">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary-light" />
                  <h2 className="text-lg font-heading font-semibold text-text-primary">Custom Fields</h2>
                </div>
                <button onClick={onClose}
                  className="p-2 rounded-xl hover:bg-glass-hover transition-colors text-text-muted hover:text-text-primary cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {fields.length === 0 && !showAdd && (
                  <p className="text-sm text-text-muted text-center py-6">
                    No custom fields defined for this board.
                  </p>
                )}

                <AnimatePresence mode="popLayout">
                  {fields.map((field) => (
                    <motion.div
                      key={field.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-glass border border-glass-border group"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-text-muted/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{field.name}</span>
                          {field.required && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber/10 text-amber font-medium">Required</span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted capitalize">
                          {field.type}
                          {field.type === 'dropdown' && field.options.length > 0 && (
                            <> · {field.options.join(', ')}</>
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(boardId, field.id)}
                        disabled={deletingId === field.id}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/10 text-text-muted hover:text-danger transition-all cursor-pointer disabled:opacity-40"
                      >
                        {deletingId === field.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {showAdd ? (
                  <AddFieldForm boardId={boardId} onDone={() => setShowAdd(false)} />
                ) : (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-glass-border text-xs text-text-muted hover:text-text-secondary hover:bg-glass-hover hover:border-glass-border-hover transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add custom field
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
