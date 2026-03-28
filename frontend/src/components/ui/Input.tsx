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
        <label className="block text-[15px] font-semibold text-text-primary mb-1.5 tracking-tight">
          {label}
          {optional && <span className="text-text-muted font-normal ml-1.5 text-[13px]">(optional)</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-black/5 dark:bg-white/10 border border-transparent rounded-[12px] px-4 py-3.5",
          "text-[15px] text-text-primary placeholder:text-text-muted transition-all duration-200",
          "focus:bg-bg-surface focus:border-primary focus:ring-[3px] focus:ring-primary/20 focus:shadow-sm outline-none",
          error && "border-danger focus:border-danger focus:ring-danger/20 focus:bg-danger/5",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-[13px] text-danger font-medium">{error}</p>}
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
        <label className="block text-[15px] font-semibold text-text-primary mb-1.5 tracking-tight">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-black/5 dark:bg-white/10 border border-transparent rounded-[12px] px-4 py-3.5",
          "text-[15px] text-text-primary placeholder:text-text-muted transition-all duration-200 resize-none",
          "focus:bg-bg-surface focus:border-primary focus:ring-[3px] focus:ring-primary/20 outline-none",
          error && "border-danger focus:border-danger focus:ring-danger/20 focus:bg-danger/5",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-[13px] text-danger font-medium">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
