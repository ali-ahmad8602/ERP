import React from 'react'
import { cn } from '../../lib/utils'

export const Card = ({ className, children, hoverable = false, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-[12px] bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/5",
        hoverable && "transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_0_0_1px_rgba(4,84,252,0.35),0_8px_24px_rgba(0,0,0,0.5)] cursor-pointer group",
        className
      )}
      {...props}
    >
      {/* Top Left Rim Light simulation */}
      <div className="absolute inset-0 rounded-[12px] pointer-events-none border-t border-l border-white/10 group-hover:border-white/20 transition-colors" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}
