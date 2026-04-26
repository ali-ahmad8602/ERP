"use client";

import { useEffect, useCallback } from "react";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";

type ToastType = "error" | "success" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set(s => ({ toasts: [...s.toasts.slice(-4), { id, type, message }] }));
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

export function toast(type: ToastType, message: string) {
  useToastStore.getState().add(type, message);
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    error: <AlertCircle size={16} className="text-danger shrink-0" />,
    success: <CheckCircle2 size={16} className="text-success shrink-0" />,
    info: <Info size={16} className="text-info shrink-0" />,
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-[12px] shadow-card-hover border animate-fade-up glass-card",
      item.type === "error" && "border-danger/20",
      item.type === "success" && "border-accent/20",
      item.type === "info" && "border-border",
    )}>
      {icons[item.type]}
      <span className="text-[13px] text-text-primary font-medium flex-1">{item.message}</span>
      <button
        onClick={onRemove}
        className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer transition-colors shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  const handleRemove = useCallback((id: string) => remove(id), [remove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-3rem)]">
      {toasts.map(t => (
        <ToastItem key={t.id} item={t} onRemove={() => handleRemove(t.id)} />
      ))}
    </div>
  );
}
