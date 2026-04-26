"use client";
import { useEffect, useCallback } from "react";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";

type ToastType = "error" | "success" | "info";
interface ToastItem { id: string; type: ToastType; message: string; }
interface ToastStore { toasts: ToastItem[]; add: (type: ToastType, message: string) => void; remove: (id: string) => void; }

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set(s => ({ toasts: [...s.toasts.slice(-4), { id, type, message }] }));
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export function toast(type: ToastType, message: string) { useToastStore.getState().add(type, message); }

function ToastRow({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  useEffect(() => { const t = setTimeout(onRemove, 5000); return () => clearTimeout(t); }, [onRemove]);
  const icons = { error: <AlertCircle size={14} className="text-danger shrink-0" />, success: <CheckCircle2 size={14} className="text-accent shrink-0" />, info: <Info size={14} className="text-primary shrink-0" /> };
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-[6px] shadow-sm border bg-bg-surface animate-fade-in",
      item.type === "error" && "border-danger/20",
      item.type === "success" && "border-accent/20",
      item.type === "info" && "border-border",
    )}>
      {icons[item.type]}
      <span className="text-[12px] text-text-primary flex-1">{item.message}</span>
      <button onClick={onRemove} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer"><X size={11} /></button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  const handleRemove = useCallback((id: string) => remove(id), [remove]);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-1.5 w-[340px]">
      {toasts.map(t => <ToastRow key={t.id} item={t} onRemove={() => handleRemove(t.id)} />)}
    </div>
  );
}
