"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "sm", loading, disabled, children, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none rounded-[6px] transition-all duration-150 cursor-pointer",
        "disabled:opacity-40 disabled:pointer-events-none",
        variant === "primary" && "bg-primary text-white hover:bg-primary-dark shadow-xs",
        variant === "secondary" && "bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay",
        variant === "ghost" && "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
        variant === "danger" && "bg-danger text-white hover:opacity-90 shadow-xs",
        size === "xs" && "h-6 px-2 text-[11px] gap-1",
        size === "sm" && "h-7 px-2.5 text-[12px] gap-1.5",
        size === "md" && "h-8 px-3 text-[13px] gap-1.5",
        size === "lg" && "h-9 px-4 text-[13px] gap-2",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={12} />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
