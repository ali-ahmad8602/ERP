import React from 'react'
import { cn } from '../../lib/utils'

export const Avatar = ({ src, fallback, size = "md", active = false }) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  }

  return (
    <div className={cn("relative inline-block", sizeClasses[size])}>
      <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#F3F3F3]">
        {src ? (
          <img src={src} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="font-semibold uppercase">{fallback?.substring(0, 2) || "U"}</span>
        )}
      </div>
      {active && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full border border-[#050505] shadow-[0_0_4px_rgba(4,84,252,0.8)]" />
      )}
    </div>
  )
}
