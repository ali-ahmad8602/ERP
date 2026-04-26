"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", loading, disabled, children, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium cursor-pointer select-none",
        "rounded-[6px] transition-all duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "primary" && "bg-primary text-white shadow-sm hover:bg-primary-light hover:-translate-y-px hover:shadow-md active:translate-y-0 active:shadow-sm",
        variant === "secondary" && "bg-bg-elevated border border-border text-text-primary hover:bg-bg-overlay hover:border-text-muted/30 hover:-translate-y-px active:translate-y-0",
        variant === "danger" && "bg-danger text-white shadow-sm hover:opacity-90 hover:-translate-y-px active:translate-y-0",
        variant === "ghost" && "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
        size === "sm" && "h-7 px-2.5 text-xs gap-1.5",
        size === "md" && "h-8 px-3 text-[13px] gap-1.5",
        size === "lg" && "h-10 px-5 text-sm gap-2",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={size === "sm" ? 12 : 14} />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
