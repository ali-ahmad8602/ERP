import { motion } from 'framer-motion'

const glowMap = {
  blue: 'shadow-[0_0_40px_rgba(14,165,233,0.12)] border-[rgba(14,165,233,0.18)]',
  emerald: 'shadow-[0_0_40px_rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.18)]',
  amber: 'shadow-[0_0_40px_rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.18)]',
  red: 'shadow-[0_0_40px_rgba(255,59,59,0.12)] border-[rgba(255,59,59,0.18)]',
  none: 'shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-glass-border',
}

export default function GlassCard({
  children,
  className = '',
  glow = 'none',
  hover = false,
  ...props
}) {
  const base = [
    'bg-glass backdrop-blur-xl rounded-2xl border',
    glowMap[glow] || glowMap.none,
    hover && 'transition-all duration-200 hover:bg-glass-hover hover:border-glass-border-hover hover:-translate-y-0.5',
    className,
  ].filter(Boolean).join(' ')

  return (
    <motion.div className={base} {...props}>
      {children}
    </motion.div>
  )
}
