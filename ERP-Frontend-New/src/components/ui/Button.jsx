import React from 'react'
import { cn } from '../../lib/utils'

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-[8px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]": variant === "primary",
          "bg-white/10 backdrop-blur-xl border border-white/10 text-[#F3F3F3] hover:bg-white/20": variant === "secondary",
          "bg-transparent text-[#F3F3F3] hover:bg-white/10": variant === "ghost",
          "bg-[var(--color-danger)] text-white hover:opacity-90": variant === "danger",
          "h-10 px-4 py-2": size === "default",
          "h-8 px-3 text-xs": size === "sm",
          "h-12 px-8 text-lg": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"
