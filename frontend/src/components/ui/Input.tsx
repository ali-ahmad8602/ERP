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
          {optional && <span className="text-text-muted font-normal ml-1 text-xs">(optional)</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full h-9 bg-bg-elevated border border-border rounded-[6px] px-3",
          "text-[13px] text-text-primary placeholder:text-text-muted",
          "transition-colors duration-150 outline-none",
          "focus:border-primary focus:ring-1 focus:ring-primary/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
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
          "w-full bg-bg-elevated border border-border rounded-[6px] px-3 py-2",
          "text-[13px] text-text-primary placeholder:text-text-muted",
          "transition-colors duration-150 resize-none outline-none",
          "focus:border-primary focus:ring-1 focus:ring-primary/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
