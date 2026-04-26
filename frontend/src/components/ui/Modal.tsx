"use client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  variant?: "center" | "drawer-right";
}

export function Modal({ open, onClose, children, width = "460px", variant = "center" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 animate-fade-in" />
      <div
        className={cn(
          "fixed z-50",
          variant === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-up",
          variant === "drawer-right" && "right-0 top-0 h-full animate-fade-in",
        )}
        style={{ width }}
      >
        <div
          className={cn(
            "bg-bg-surface border border-border shadow-modal overflow-hidden",
            variant === "center" && "rounded-[12px] max-h-[90vh] overflow-y-auto",
            variant === "drawer-right" && "h-full border-l border-r-0 border-t-0 border-b-0",
          )}
        >
          {children}
        </div>
      </div>
    </>
  );
}
