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
        "rounded-[8px] transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variant === "primary" && "bg-primary text-white hover:bg-primary-light active:scale-[0.97] shadow-sm",
        variant === "secondary" && "bg-white/10 backdrop-blur-xl border border-white/10 text-text-primary hover:bg-white/20",
        variant === "danger" && "bg-danger text-white hover:opacity-90 active:scale-[0.97] shadow-sm",
        variant === "ghost" && "bg-transparent text-text-primary hover:bg-white/10",
        size === "sm" && "h-8 px-3 text-xs gap-1.5",
        size === "md" && "h-10 px-4 py-2 text-sm gap-2",
        size === "lg" && "h-12 px-8 text-base gap-2.5",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
