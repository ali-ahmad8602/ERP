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
        "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        // variants representing Apple guidelines
        variant === "primary" && "bg-primary text-white hover:bg-primary-light active:scale-[0.97] rounded-xl shadow-sm",
        variant === "secondary" && "bg-black/[0.04] dark:bg-white/[0.08] text-text-primary hover:bg-black/[0.08] dark:hover:bg-white/[0.12] active:scale-[0.97] rounded-xl",
        variant === "danger" && "bg-danger text-white hover:opacity-90 active:scale-[0.97] rounded-xl shadow-sm",
        variant === "ghost" && "bg-transparent text-primary hover:bg-primary/10 active:scale-[0.97] rounded-xl",
        // sizes
        size === "sm" && "px-3.5 py-1.5 text-[13px] gap-1.5",
        size === "md" && "px-4 py-2.5 text-[15px] gap-2 tracking-tight",
        size === "lg" && "px-6 py-3.5 text-[17px] gap-2.5 tracking-tight",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={size === "sm" ? 14 : 18} />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
