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
        <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
          {label}
          {optional && <span className="text-text-muted font-normal ml-1 text-[11px]">(optional)</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-bg-surface border border-border rounded-btn px-3.5 py-2.5",
          "text-[13px] text-text-primary placeholder:text-text-muted",
          "outline-none transition-all duration-150",
          "focus:border-primary/60 focus:ring-2 focus:ring-primary/10",
          error && "border-danger/60 focus:border-danger/60 focus:ring-danger/10",
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
      {label && (
        <label className="block text-[13px] font-medium text-text-secondary mb-1.5">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-bg-surface border border-border rounded-btn px-3.5 py-2.5",
          "text-[13px] text-text-primary placeholder:text-text-muted",
          "outline-none transition-all duration-150 resize-none",
          "focus:border-primary/60 focus:ring-2 focus:ring-primary/10",
          error && "border-danger/60",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
