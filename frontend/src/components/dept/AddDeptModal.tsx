"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeptStore } from "@/store/dept.store";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

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
    <Modal open={true} onClose={onClose} width="460px">
      <div className="p-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">New Department</h2>
            <p className="text-[12px] text-text-muted mt-0.5">A new board will be created automatically</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[7px] bg-transparent border-none cursor-pointer text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[12px] text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">

          {/* Name */}
          <Input
            label="Department Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Finance, Legal, Marketing"
            required
            autoFocus
          />

          {/* Description */}
          <Input
            label="Description"
            optional
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of this department"
          />

          {/* Icon */}
          <div>
            <SectionLabel>Icon</SectionLabel>
            <div className="flex gap-1.5 flex-wrap">
              {ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "w-10 h-10 rounded-[10px] text-[20px] cursor-pointer flex items-center justify-center transition-all duration-100",
                    icon === ic
                      ? "border-2 border-primary bg-primary-ghost"
                      : "border-2 border-border bg-bg-elevated hover:border-border"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <SectionLabel>Color</SectionLabel>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className="w-7 h-7 rounded-full cursor-pointer transition-all duration-100"
                  style={{
                    background: c.value,
                    border: color === c.value ? "3px solid white" : "3px solid transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="px-3.5 py-3 bg-bg-elevated rounded-[10px] border border-border-subtle flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center text-[20px]"
              style={{ background: `${color}18` }}
            >
              {icon}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-medium text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                {name || "Department Name"}
              </div>
              <div className="text-[11px] text-text-muted">{description || "No description"}</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!name.trim() || loading}
            loading={loading}
            className="w-full mt-0.5"
          >
            {loading ? "Creating..." : "Create Department"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
