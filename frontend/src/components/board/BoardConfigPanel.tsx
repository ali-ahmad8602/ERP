"use client";
import { useState } from "react";
import { X, Lock, ShieldCheck, CheckSquare, Trash2 } from "lucide-react";
import { useBoardStore } from "@/store/board.store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";
import type { Board } from "@/types";

interface BoardConfigPanelProps {
  board: Board;
  onClose: () => void;
}

const COLUMN_COLORS = ["#555555", "#0454FC", "#F5A623", "#00E5A0", "#FF4444", "#8B5CF6"];

const FIELD_TYPES = [
  { value: "text",     label: "Text" },
  { value: "number",   label: "Number" },
  { value: "date",     label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "url",      label: "URL" },
];

export function BoardConfigPanel({ board, onClose }: BoardConfigPanelProps) {
  const { activeBoard, updateBoard, addColumn, deleteColumn, addField, deleteField } = useBoardStore();
  const current = (activeBoard?._id === board._id ? activeBoard : board) ?? board;

  const [tab, setTab]               = useState<"general" | "columns" | "fields">("general");
  const [name, setName]             = useState(current.name);
  const [nameSaving, setNameSaving] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColColor, setNewColColor] = useState(COLUMN_COLORS[0]);
  const [addingCol, setAddingCol]   = useState(false);
  const [newFieldName, setNewFieldName]   = useState("");
  const [newFieldType, setNewFieldType]   = useState("text");
  const [newFieldOpts, setNewFieldOpts]   = useState("");
  const [addingField, setAddingField]     = useState(false);

  const saveName = async () => {
    if (!name.trim() || name === current.name) return;
    setNameSaving(true);
    try { await updateBoard(current._id, { name: name.trim() }); } catch { /* ignore */ }
    finally { setNameSaving(false); }
  };

  const toggleSetting = async (key: keyof typeof current.settings, val: boolean) => {
    try { await updateBoard(current._id, { settings: { ...current.settings, [key]: val } }); }
    catch { /* ignore */ }
  };

  const handleAddColumn = async () => {
    if (!newColName.trim() || addingCol) return;
    setAddingCol(true);
    try { await addColumn(current._id, newColName.trim(), newColColor); setNewColName(""); }
    catch { /* ignore */ } finally { setAddingCol(false); }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim() || addingField) return;
    setAddingField(true);
    const options = newFieldType === "dropdown"
      ? newFieldOpts.split(",").map(s => s.trim()).filter(Boolean)
      : undefined;
    try {
      await addField(current._id, { name: newFieldName.trim(), type: newFieldType, options, required: false });
      setNewFieldName(""); setNewFieldOpts("");
    } catch { /* ignore */ } finally { setAddingField(false); }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" />

      <div className="fixed right-0 top-0 h-full w-[400px] bg-bg-base border-l border-border z-50 flex flex-col animate-slide-in-right shadow-[-40px_0_80px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="px-[18px] pt-[18px] pb-3.5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-text-primary">Board Settings</h2>
            <p className="text-[12px] text-text-muted mt-0.5">{current.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-transparent border-none cursor-pointer text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {(["general", "columns", "fields"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2.5 text-[12px] font-semibold bg-transparent border-none cursor-pointer capitalize transition-colors",
                tab === t
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-muted border-b-2 border-transparent hover:text-text-secondary"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-[18px]">

          {/* ── General ── */}
          {tab === "general" && (
            <div className="flex flex-col gap-5">
              <div>
                <SectionLabel>Board Name</SectionLabel>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveName()}
                  />
                  <Button
                    variant={name !== current.name && !nameSaving ? "primary" : "secondary"}
                    size="md"
                    onClick={saveName}
                    disabled={nameSaving || name === current.name}
                    loading={nameSaving}
                    className="shrink-0"
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              <div className="flex flex-col gap-4">
                <ToggleRow
                  icon={<Lock size={13} />}
                  label="Lock Board"
                  description="Prevent new cards from being created"
                  value={current.settings.isLocked}
                  onChange={v => toggleSetting("isLocked", v)}
                />
                <ToggleRow
                  icon={<CheckSquare size={13} />}
                  label="Require Approval"
                  description="Cards must be approved before moving to Done"
                  value={current.settings.requiresApproval}
                  onChange={v => toggleSetting("requiresApproval", v)}
                />
                <ToggleRow
                  icon={<ShieldCheck size={13} />}
                  label="Compliance Mode"
                  description="Enable compliance tagging on cards"
                  value={current.settings.complianceTagging}
                  onChange={v => toggleSetting("complianceTagging", v)}
                />
              </div>
            </div>
          )}

          {/* ── Columns ── */}
          {tab === "columns" && (
            <div className="flex flex-col gap-1.5">
              {[...current.columns].sort((a, b) => a.order - b.order).map(col => (
                <div key={col._id} className="flex items-center gap-2.5 py-[9px] px-3 bg-bg-surface rounded-[9px] border border-border-subtle">
                  <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: col.color || "#555" }} />
                  <span className="flex-1 text-[13px] text-text-primary">{col.name}</span>
                  {col.isDefault && <span className="text-[10px] text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded">default</span>}
                  {!col.isDefault && (
                    <button
                      onClick={() => deleteColumn(current._id, col._id)}
                      className="w-[26px] h-[26px] flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}

              <div className="mt-2.5 p-3.5 bg-bg-base border border-dashed border-border rounded-[10px]">
                <SectionLabel>Add Column</SectionLabel>
                <Input
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddColumn()}
                  placeholder="Column name"
                  className="mb-2.5"
                />
                <div className="flex gap-1.5 mb-3">
                  {COLUMN_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColColor(c)}
                      className={cn(
                        "w-5 h-5 rounded-full cursor-pointer transition-all",
                        newColColor === c ? "border-2 border-white scale-110" : "border-2 border-transparent"
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddColumn}
                  disabled={!newColName.trim() || addingCol}
                  loading={addingCol}
                  className="w-full"
                >
                  + Add Column
                </Button>
              </div>
            </div>
          )}

          {/* ── Fields ── */}
          {tab === "fields" && (
            <div className="flex flex-col gap-1.5">
              {(current.customFields ?? []).length === 0 && (
                <p className="text-[13px] text-text-muted py-4 text-center">No custom fields yet</p>
              )}
              {[...(current.customFields ?? [])].sort((a, b) => a.order - b.order).map(field => (
                <div key={field._id} className="flex items-center gap-2.5 py-[9px] px-3 bg-bg-surface rounded-[9px] border border-border-subtle">
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{field.type}</span>
                  <span className="flex-1 text-[13px] text-text-primary">{field.name}</span>
                  {(field.options?.length ?? 0) > 0 && <span className="text-[10px] text-text-muted">{field.options!.length} opts</span>}
                  <button
                    onClick={() => deleteField(current._id, field._id)}
                    className="w-[26px] h-[26px] flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              <div className="mt-2.5 p-3.5 bg-bg-base border border-dashed border-border rounded-[10px]">
                <SectionLabel>Add Field</SectionLabel>
                <Input
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  placeholder="Field name"
                  className="mb-2"
                />
                <select
                  value={newFieldType}
                  onChange={e => setNewFieldType(e.target.value)}
                  className="w-full bg-bg-surface border border-border rounded-btn px-3.5 py-2.5 text-[13px] text-text-primary outline-none cursor-pointer mb-2 transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                >
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {newFieldType === "dropdown" && (
                  <Input
                    value={newFieldOpts}
                    onChange={e => setNewFieldOpts(e.target.value)}
                    placeholder="Options (comma-separated)"
                    className="mb-2"
                  />
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddField}
                  disabled={!newFieldName.trim() || addingField}
                  loading={addingField}
                  className="w-full"
                >
                  + Add Field
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ToggleRow({ icon, label, description, value, onChange }: {
  icon: React.ReactNode; label: string; description: string;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 flex-1">
        <span className={cn("shrink-0 transition-colors duration-200", value ? "text-primary" : "text-text-muted")}>{icon}</span>
        <div>
          <div className="text-[13px] text-text-primary font-medium">{label}</div>
          <div className="text-[11px] text-text-muted">{description}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "w-9 h-5 rounded-[10px] border-none cursor-pointer relative transition-colors duration-200 shrink-0",
          value ? "bg-primary" : "bg-bg-elevated"
        )}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-[left] duration-200 shadow-sm"
          style={{ left: value ? 18 : 2 }}
        />
      </button>
    </div>
  );
}
