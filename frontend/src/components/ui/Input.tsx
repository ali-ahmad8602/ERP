"use client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, optional, className, ...props }, ref) => (
    <div>
      {label && (
        <label className="block text-[12px] font-medium text-text-secondary mb-1">
          {label}
          {optional && <span className="text-text-muted ml-1">(optional)</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full h-8 bg-bg-elevated border border-border rounded-[6px] px-2.5",
          "text-[13px] text-text-primary placeholder:text-text-muted",
          "outline-none transition-colors duration-150",
          "focus:border-primary focus:ring-1 focus:ring-primary/15",
          error && "border-danger focus:border-danger focus:ring-danger/15",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div>
      {label && <label className="block text-[12px] font-medium text-text-secondary mb-1">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-bg-elevated border border-border rounded-[6px] px-2.5 py-2",
          "text-[13px] text-text-primary placeholder:text-text-muted resize-none",
          "outline-none transition-colors duration-150",
          "focus:border-primary focus:ring-1 focus:ring-primary/15",
          error && "border-danger",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
