import React from "react"
import { cn } from "../../lib/utils"

const PRIORITY_CONFIG = {
  urgent: "text-[#FF4444] bg-[#FF4444]/15 border-[#FF4444]/20",
  high: "text-[#F5A623] bg-[#F5A623]/15 border-[#F5A623]/20",
  medium: "text-[#0454FC] bg-[#0454FC]/15 border-[#0454FC]/20",
  low: "text-[#555555] bg-[#555555]/15 border-[#555555]/20",
  none: "text-[#888888] bg-[#444444]/15 border-[#444444]/20",
}

export const Badge = ({ className, children, priority = "none", ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[6px] border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        PRIORITY_CONFIG[priority],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
