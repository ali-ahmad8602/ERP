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
        "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // variants
        variant === "primary"   && "bg-primary text-white hover:bg-primary-light rounded-[8px]",
        variant === "secondary" && "bg-transparent border border-border text-text-primary hover:bg-bg-elevated rounded-[8px]",
        variant === "danger"    && "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 rounded-[8px]",
        variant === "ghost"     && "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-[8px]",
        // sizes
        size === "sm" && "px-3 py-1.5 text-[12px] gap-1.5",
        size === "md" && "px-4 py-2 text-[13px] gap-2",
        size === "lg" && "px-5 py-2.5 text-[14px] gap-2",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={13} />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
