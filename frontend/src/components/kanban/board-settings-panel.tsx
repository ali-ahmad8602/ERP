"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { boardApi } from "@/lib/api"
import { useToast } from "@/components/ui/action-toast"

interface BoardSettingsPanelProps {
  board: any
  onClose: () => void
  onBoardUpdated: () => void
  onBoardDeleted: () => void
}

export function BoardSettingsPanel({ board, onClose, onBoardUpdated, onBoardDeleted }: BoardSettingsPanelProps) {
  const [boardName, setBoardName] = useState("")
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [lockBoard, setLockBoard] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [editingColumns, setEditingColumns] = useState<{ _id: string; name: string }[]>([])
  const [columnError, setColumnError] = useState("")
  const [addingColumn, setAddingColumn] = useState(false)
  const [deletingBoard, setDeletingBoard] = useState(false)
  const { show } = useToast()

  useEffect(() => {
    if (board) {
      setBoardName(board.name || "")
      setRequiresApproval(board.settings?.requiresApproval ?? false)
      setLockBoard(board.settings?.isLocked ?? false)
      setEditingColumns(
        (board.columns || []).map((c: any) => ({ _id: c._id, name: c.name }))
      )
    }
  }, [board])

  if (!board) return null

  const handleSaveName = async () => {
    if (!boardName.trim() || boardName === board.name) return
    setSaving(true)
    try {
      await boardApi.update(board._id, { name: boardName.trim() })
      onBoardUpdated()
      show("Board renamed")
    } catch (err) {
      console.error("Failed to rename board:", err)
      show("Failed to rename board", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (field: "requiresApproval" | "isLocked", value: boolean) => {
    try {
      const settings = { ...board.settings, [field]: value }
      await boardApi.update(board._id, { settings })
      if (field === "requiresApproval") setRequiresApproval(value)
      if (field === "isLocked") setLockBoard(value)
      onBoardUpdated()
      show("Settings updated")
    } catch (err) {
      console.error("Failed to update setting:", err)
      show("Failed to update setting", "error")
    }
  }

  const handleColumnNameChange = async (colId: string, newName: string) => {
    setEditingColumns((prev) =>
      prev.map((c) => (c._id === colId ? { ...c, name: newName } : c))
    )
  }

  const handleColumnNameBlur = async (colId: string) => {
    const col = editingColumns.find((c) => c._id === colId)
    const original = board.columns?.find((c: any) => c._id === colId)
    if (!col || !original || col.name === original.name) return
    setColumnError("")
    try {
      await boardApi.updateColumn(board._id, colId, { name: col.name })
      onBoardUpdated()
    } catch (err: any) {
      setColumnError(err.message || "Failed to rename column")
    }
  }

  const handleDeleteColumn = async (colId: string) => {
    if ((board.columns || []).length <= 1) return
    const confirmed = window.confirm("Remove this column? Cards in it will be lost.")
    if (!confirmed) return
    setColumnError("")
    try {
      await boardApi.deleteColumn(board._id, colId)
      onBoardUpdated()
      show("Column removed")
    } catch (err: any) {
      setColumnError(err.message || "Failed to delete column")
      show("Failed to remove column", "error")
    }
  }

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return
    setColumnError("")
    setAddingColumn(true)
    try {
      await boardApi.addColumn(board._id, newColumnName.trim())
      setNewColumnName("")
      onBoardUpdated()
      show("Column added")
    } catch (err: any) {
      setColumnError(err.message || "Failed to add column")
      show("Failed to add column", "error")
    } finally {
      setAddingColumn(false)
    }
  }

  const handleDeleteBoard = async () => {
    const confirmed = window.confirm(`Delete board "${board.name}"? This cannot be undone.`)
    if (!confirmed) return
    setDeletingBoard(true)
    try {
      await boardApi.delete(board._id)
      show("Board deleted")
      onBoardDeleted()
    } catch (err) {
      console.error("Failed to delete board:", err)
      show("Failed to delete board", "error")
    } finally {
      setDeletingBoard(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-screen w-[400px] bg-[#09090b] border-l border-[#27272a] z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
          <h2 className="text-[14px] font-semibold text-[#fafafa]">Board Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#ffffff08] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Board Name */}
          <div className="px-4 py-4 border-b border-[#ffffff0a]">
            <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-2">Board Name</h4>
            <div className="flex items-center gap-2">
              <input
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="flex-1 h-8 px-3 rounded-[6px] bg-[#0f0f11] border border-[#27272a] text-[12px] text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#3b82f6] transition-colors"
              />
              <button
                onClick={handleSaveName}
                disabled={saving || !boardName.trim() || boardName === board.name}
                className="h-8 px-3 rounded-[6px] bg-[#3b82f6] text-[11px] font-medium text-white hover:bg-[#2563eb] disabled:opacity-40 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="px-4 py-4 border-b border-[#ffffff0a]">
            <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">Settings</h4>
            <div className="space-y-3">
              {/* Requires Approval */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#a1a1aa]">Requires Approval</span>
                <button
                  onClick={() => handleToggle("requiresApproval", !requiresApproval)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${
                    requiresApproval ? "bg-[#3b82f6]" : "bg-[#27272a]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-[#fafafa] transition-transform ${
                      requiresApproval ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Lock Board */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#a1a1aa]">Lock Board</span>
                <button
                  onClick={() => handleToggle("isLocked", !lockBoard)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${
                    lockBoard ? "bg-[#3b82f6]" : "bg-[#27272a]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-[#fafafa] transition-transform ${
                      lockBoard ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Columns */}
          <div className="px-4 py-4 border-b border-[#ffffff0a]">
            <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">Columns</h4>
            <div className="space-y-2">
              {editingColumns.map((col) => (
                <div key={col._id} className="flex items-center gap-2">
                  <input
                    value={col.name}
                    onChange={(e) => handleColumnNameChange(col._id, e.target.value)}
                    onBlur={() => handleColumnNameBlur(col._id)}
                    className="flex-1 h-7 px-2 rounded bg-[#0f0f11] border border-[#27272a] text-[12px] text-[#fafafa] outline-none focus:border-[#3b82f6] transition-colors"
                  />
                  {editingColumns.length > 1 && (
                    <button
                      onClick={() => handleDeleteColumn(col._id)}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#52525b] hover:text-[#ef4444] hover:bg-[#ffffff08] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {columnError && (
              <p className="text-[11px] text-[#ef4444] mt-2">{columnError}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddColumn() }}
                placeholder="New column name..."
                className="flex-1 h-7 px-2 rounded bg-[#0f0f11] border border-[#27272a] text-[12px] text-[#fafafa] placeholder-[#52525b] outline-none focus:border-[#3b82f6] transition-colors"
              />
              <button
                onClick={handleAddColumn}
                disabled={!newColumnName.trim() || addingColumn}
                className="h-7 px-2.5 rounded bg-[#3b82f6] text-[11px] font-medium text-white hover:bg-[#2563eb] disabled:opacity-40 transition-colors"
              >
                {addingColumn ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="px-4 py-4">
            <h4 className="text-[11px] font-medium text-[#52525b] uppercase tracking-wider mb-3">Danger Zone</h4>
            <button
              onClick={handleDeleteBoard}
              disabled={deletingBoard}
              className="h-8 px-4 rounded-[6px] bg-[#27272a] border border-[#27272a] text-[12px] font-medium text-[#ef4444] hover:bg-[#ef4444]/15 hover:border-[#ef4444]/30 disabled:opacity-40 transition-colors"
            >
              {deletingBoard ? "Deleting..." : "Delete Board"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
