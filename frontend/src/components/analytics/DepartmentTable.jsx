import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
}

const row = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function ProgressBar({ done, total, color }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
      <span className="text-xs text-text-muted font-mono w-9 text-right">{pct}%</span>
    </div>
  )
}

export default function DepartmentTable({ departments }) {
  return (
    <GlassCard className="overflow-hidden" glow="none">
      <div className="px-6 py-4 border-b border-glass-border">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Department Breakdown
        </h2>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-2 px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">
        <span>Department</span>
        <span className="text-center">Total</span>
        <span className="text-center">Done</span>
        <span className="text-center">In Progress</span>
        <span className="text-center">Overdue</span>
        <span>Completion</span>
      </div>

      {/* Rows */}
      <motion.div variants={container} initial="hidden" animate="show">
        {departments.map((dept) => (
          <motion.div
            key={dept.department._id}
            variants={row}
            onClick={() => {/* navigate(`/departments/${dept.department.slug}`) */}}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-2 px-6 py-3.5 items-center cursor-pointer transition-colors duration-150 hover:bg-glass-hover border-t border-glass-border/50"
          >
            {/* Name */}
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${dept.department.color}18` }}
              >
                {dept.department.icon}
              </span>
              <span className="font-medium text-sm text-text-primary truncate">
                {dept.department.name}
              </span>
            </div>

            {/* Counts */}
            <span className="text-center text-sm font-mono text-text-secondary">
              {dept.totalCards}
            </span>
            <span className="text-center text-sm font-mono text-accent-emerald">
              {dept.doneCount}
            </span>
            <span className="text-center text-sm font-mono text-primary-light">
              {dept.inProgressCount}
            </span>
            <span className="text-center text-sm font-mono text-danger">
              {dept.overdueCount}
            </span>

            {/* Progress */}
            <ProgressBar
              done={dept.doneCount}
              total={dept.totalCards}
              color={dept.department.color}
            />
          </motion.div>
        ))}
      </motion.div>
    </GlassCard>
  )
}
