"use client";
import { useState } from "react";
import { X, Lock, ShieldCheck, CheckSquare, Trash2 } from "lucide-react";
import { useBoardStore } from "@/store/board.store";
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
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 40, backdropFilter: "blur(1px)", animation: "fadeIn 0.15s ease-out",
      }} />

      <div style={{
        position: "fixed", right: 0, top: 0, height: "100%", width: 400,
        background: "#0A0A0A", borderLeft: "1px solid #1E1E1E",
        zIndex: 50, display: "flex", flexDirection: "column",
        animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "-40px 0 80px rgba(0,0,0,0.7)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #1E1E1E", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#EBEBEB" }}>Board Settings</h2>
            <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{current.name}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "#444" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#F3F3F3"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
          ><X size={14} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #1E1E1E", flexShrink: 0 }}>
          {(["general", "columns", "fields"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 600,
              background: "transparent", border: "none", cursor: "pointer",
              borderBottom: tab === t ? "2px solid #0454FC" : "2px solid transparent",
              color: tab === t ? "#0454FC" : "#555", textTransform: "capitalize",
              transition: "color 0.12s",
            }}>{t}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>

          {/* ── General ── */}
          {tab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <Label>Board Name</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={name} onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveName()}
                    style={inputStyle}
                    className="input-field"
                  />
                  <button onClick={saveName} disabled={nameSaving || name === current.name} style={{
                    padding: "0 16px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500, flexShrink: 0,
                    background: name !== current.name && !nameSaving ? "#0454FC" : "#1A1A1A",
                    color: name !== current.name && !nameSaving ? "white" : "#444",
                    cursor: name !== current.name ? "pointer" : "default",
                  }}>{nameSaving ? "..." : "Save"}</button>
                </div>
              </div>

              <div style={{ height: 1, background: "#161616" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[...current.columns].sort((a, b) => a.order - b.order).map(col => (
                <div key={col._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#111", borderRadius: 9, border: "1px solid #1E1E1E" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: col.color || "#555", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "#C8C8C8" }}>{col.name}</span>
                  {col.isDefault && <span style={{ fontSize: 10, color: "#444", background: "#1A1A1A", padding: "2px 6px", borderRadius: 4 }}>default</span>}
                  {!col.isDefault && (
                    <button onClick={() => deleteColumn(current._id, col._id)} style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: "#444" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,68,68,0.1)"; e.currentTarget.style.color = "#FF4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
                    ><Trash2 size={12} /></button>
                  )}
                </div>
              ))}

              <div style={{ marginTop: 10, padding: 14, background: "#0D0D0D", border: "1px dashed #2A2A2A", borderRadius: 10 }}>
                <Label>Add Column</Label>
                <input value={newColName} onChange={e => setNewColName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddColumn()}
                  placeholder="Column name"
                  style={{ ...inputStyle, marginBottom: 10 }}
                  className="input-field"
                />
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {COLUMN_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setNewColColor(c)} style={{
                      width: 20, height: 20, borderRadius: "50%", background: c, cursor: "pointer",
                      border: newColColor === c ? "2px solid white" : "2px solid transparent",
                      transition: "border 0.1s",
                    }} />
                  ))}
                </div>
                <ActionButton onClick={handleAddColumn} disabled={!newColName.trim() || addingCol} loading={addingCol} label="+ Add Column" />
              </div>
            </div>
          )}

          {/* ── Fields ── */}
          {tab === "fields" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(current.customFields ?? []).length === 0 && (
                <p style={{ fontSize: 13, color: "#333", padding: "16px 0", textAlign: "center" }}>No custom fields yet</p>
              )}
              {[...(current.customFields ?? [])].sort((a, b) => a.order - b.order).map(field => (
                <div key={field._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#111", borderRadius: 9, border: "1px solid #1E1E1E" }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#0454FC", background: "rgba(4,84,252,0.1)", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>{field.type}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "#C8C8C8" }}>{field.name}</span>
                  {(field.options?.length ?? 0) > 0 && <span style={{ fontSize: 10, color: "#555" }}>{field.options!.length} opts</span>}
                  <button onClick={() => deleteField(current._id, field._id)} style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: "#444" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,68,68,0.1)"; e.currentTarget.style.color = "#FF4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
                  ><Trash2 size={12} /></button>
                </div>
              ))}

              <div style={{ marginTop: 10, padding: 14, background: "#0D0D0D", border: "1px dashed #2A2A2A", borderRadius: 10 }}>
                <Label>Add Field</Label>
                <input value={newFieldName} onChange={e => setNewFieldName(e.target.value)}
                  placeholder="Field name"
                  style={{ ...inputStyle, marginBottom: 8 }}
                  className="input-field"
                />
                <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 8, cursor: "pointer" }}
                >
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {newFieldType === "dropdown" && (
                  <input value={newFieldOpts} onChange={e => setNewFieldOpts(e.target.value)}
                    placeholder="Options (comma-separated)"
                    style={{ ...inputStyle, marginBottom: 8 }}
                    className="input-field"
                  />
                )}
                <ActionButton onClick={handleAddField} disabled={!newFieldName.trim() || addingField} loading={addingField} label="+ Add Field" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#111", border: "1px solid #222",
  borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#F3F3F3",
  outline: "none", boxSizing: "border-box",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ActionButton({ onClick, disabled, loading, label }: { onClick: () => void; disabled: boolean; loading: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "8px 0", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500,
      background: !disabled ? "#0454FC" : "#1A1A1A",
      color: !disabled ? "white" : "#444",
      cursor: !disabled ? "pointer" : "default",
      transition: "background 0.1s",
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = "#3B7BFF"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = "#0454FC"; }}
    >{loading ? "..." : label}</button>
  );
}

function ToggleRow({ icon, label, description, value, onChange }: {
  icon: React.ReactNode; label: string; description: string;
  value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <span style={{ color: value ? "#0454FC" : "#555", flexShrink: 0, transition: "color 0.2s" }}>{icon}</span>
        <div>
          <div style={{ fontSize: 13, color: "#C8C8C8", fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 11, color: "#444" }}>{description}</div>
        </div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
        background: value ? "#0454FC" : "#252525",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%", background: "white",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }} />
      </button>
    </div>
  );
}
