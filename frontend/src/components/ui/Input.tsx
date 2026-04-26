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
        <label className="block text-[13px] font-semibold text-text-primary mb-1.5 tracking-tight">
          {label}
          {optional && <span className="text-text-muted font-normal ml-1.5 text-[12px]">(optional)</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-black/[0.04] dark:bg-white/[0.08] border border-transparent rounded-xl px-3.5 py-2.5",
          "text-[13px] text-text-primary placeholder:text-text-muted transition-colors duration-150",
          "focus:bg-bg-surface focus:border-primary focus:ring-[3px] focus:ring-primary/20 outline-none",
          error && "border-danger focus:border-danger focus:ring-danger/20 animate-shake",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[12px] text-danger font-medium">{error}</p>}
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
        <label className="block text-[13px] font-semibold text-text-primary mb-1.5 tracking-tight">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-black/[0.04] dark:bg-white/[0.08] border border-transparent rounded-xl px-3.5 py-2.5",
          "text-[13px] text-text-primary placeholder:text-text-muted transition-colors duration-150 resize-none",
          "focus:bg-bg-surface focus:border-primary focus:ring-[3px] focus:ring-primary/20 outline-none",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[12px] text-danger font-medium">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
