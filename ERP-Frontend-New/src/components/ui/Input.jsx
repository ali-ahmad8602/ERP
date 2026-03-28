import React from "react"
import { cn } from "../../lib/utils"

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[8px] bg-[#1A1A1A] border-b-[2px] border-transparent px-4 py-2 text-sm text-[#F3F3F3] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#555555] focus-visible:outline-none focus:border-[var(--color-secondary)] transition-all disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export const Label = ({ className, children, ...props }) => (
  <label className={cn("block text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold mb-1.5", className)} {...props}>
    {children}
  </label>
)
