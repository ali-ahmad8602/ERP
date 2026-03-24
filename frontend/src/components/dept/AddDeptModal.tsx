"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useDeptStore } from "@/store/dept.store";
import { useRouter } from "next/navigation";

const ICONS = ["⚙️", "⚖️", "📊", "💼", "🔬", "🛡️", "💰", "🎯", "🏗️", "📋", "🧠", "📣"];

const COLORS = [
  { label: "Blue",    value: "#0454FC" },
  { label: "Teal",   value: "#00E5A0" },
  { label: "Orange", value: "#F5A623" },
  { label: "Red",    value: "#FF4444" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Pink",   value: "#EC4899" },
  { label: "Cyan",   value: "#14B8A6" },
  { label: "Gray",   value: "#6B7280" },
];

interface AddDeptModalProps {
  onClose: () => void;
}

export function AddDeptModal({ onClose }: AddDeptModalProps) {
  const { createDept } = useDeptStore();
  const router = useRouter();
  const [name, setName]             = useState("");
  const [icon, setIcon]             = useState("⚙️");
  const [color, setColor]           = useState("#0454FC");
  const [description, setDescription] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError("");
    try {
      const dept = await createDept({ name: name.trim(), icon, color, description: description.trim() || undefined });
      onClose();
      router.push(`/dept/${dept.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        zIndex: 100, backdropFilter: "blur(4px)", animation: "fadeIn 0.12s ease-out",
      }} />

      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 460, background: "#0F0F0F", border: "1px solid #2A2A2A",
        borderRadius: 16, zIndex: 101, padding: 28,
        boxShadow: "0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)",
        animation: "fadeUp 0.18s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#EBEBEB" }}>New Department</h2>
            <p style={{ fontSize: 12, color: "#555", marginTop: 2 }}>A new board will be created automatically</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "#444" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1A1A1A"; e.currentTarget.style.color = "#888"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444"; }}
          ><X size={14} /></button>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "9px 12px", borderRadius: 8, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", fontSize: 12, color: "#FF4444" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Name */}
          <div>
            <FieldLabel>Department Name</FieldLabel>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Finance, Legal, Marketing"
              required autoFocus
              style={inputStyle}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div>
            <FieldLabel optional>Description</FieldLabel>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this department"
              style={inputStyle}
              className="input-field"
            />
          </div>

          {/* Icon */}
          <div>
            <FieldLabel>Icon</FieldLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} style={{
                  width: 40, height: 40, borderRadius: 10,
                  border: icon === ic ? "2px solid #0454FC" : "2px solid #222",
                  background: icon === ic ? "rgba(4,84,252,0.1)" : "#111",
                  fontSize: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.1s",
                }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <FieldLabel>Color</FieldLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <button key={c.value} type="button" onClick={() => setColor(c.value)} title={c.label} style={{
                  width: 28, height: 28, borderRadius: "50%", background: c.value,
                  border: color === c.value ? "3px solid white" : "3px solid transparent",
                  cursor: "pointer", transition: "border 0.12s",
                }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            padding: "12px 14px", background: "#111", borderRadius: 10,
            border: "1px solid #1E1E1E", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `${color}18`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>{icon}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#EBEBEB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name || "Department Name"}
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>{description || "No description"}</div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
          </div>

          <button type="submit" disabled={!name.trim() || loading} style={{
            width: "100%", padding: "11px 0", borderRadius: 9, border: "none",
            fontSize: 13, fontWeight: 500, marginTop: 2,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: name.trim() && !loading ? "#0454FC" : "#1A1A1A",
            color: name.trim() && !loading ? "white" : "#444",
            cursor: name.trim() && !loading ? "pointer" : "not-allowed",
            transition: "background 0.12s",
          }}
            onMouseEnter={e => { if (name.trim() && !loading) e.currentTarget.style.background = "#3B7BFF"; }}
            onMouseLeave={e => { if (name.trim() && !loading) e.currentTarget.style.background = "#0454FC"; }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Creating..." : "Create Department"}
          </button>
        </form>
      </div>
    </>
  );
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
      {children}
      {optional && <span style={{ color: "#333", fontWeight: 400, textTransform: "none", marginLeft: 4, fontSize: 11 }}>(optional)</span>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#111", border: "1px solid #222",
  borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#F3F3F3",
  outline: "none", boxSizing: "border-box",
};
