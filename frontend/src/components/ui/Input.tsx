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
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {optional && <span className="text-text-muted font-normal ml-1.5 text-xs">(optional)</span>}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full h-10 bg-bg-elevated border-b-2 border-transparent rounded-[8px] px-4 py-2",
          "text-sm text-text-primary placeholder:text-[#555] transition-all duration-200",
          "focus:border-primary outline-none",
          error && "border-danger focus:border-danger animate-shake",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
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
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-bg-elevated border-b-2 border-transparent rounded-[8px] px-4 py-3",
          "text-sm text-text-primary placeholder:text-[#555] transition-all duration-200 resize-none",
          "focus:border-primary outline-none",
          error && "border-danger focus:border-danger",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
