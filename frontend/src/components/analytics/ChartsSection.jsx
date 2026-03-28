import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import GlassCard from '../ui/GlassCard'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-surface border border-glass-border rounded-lg px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
      <span className="text-text-secondary">{name}:</span>{' '}
      <span className="text-text-primary font-semibold">{value}</span>
    </div>
  )
}

function DonutChart({ data }) {
  return (
    <GlassCard className="p-6 flex flex-col" glow="none">
      <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">
        Status Distribution
      </h3>
      <div className="flex-1 min-h-[260px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
            {entry.name}
            <span className="font-mono text-text-muted">{entry.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function DeptBarChart({ departments }) {
  const data = departments.map((d) => ({
    name: d.department.name.length > 14
      ? d.department.name.slice(0, 12) + '...'
      : d.department.name,
    total: d.totalCards,
    done: d.doneCount,
    color: d.department.color,
  }))

  return (
    <GlassCard className="p-6 flex flex-col" glow="none">
      <h3 className="text-sm font-heading font-semibold text-text-primary mb-4">
        Items per Department
      </h3>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#0EA5E9" opacity={0.7} />
            <Bar dataKey="done" radius={[6, 6, 0, 0]} fill="#10B981" opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-5 mt-4 justify-center text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-light/70" />
          Total
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald/85" />
          Done
        </div>
      </div>
    </GlassCard>
  )
}

export default function ChartsSection({ statusData, departments }) {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <DonutChart data={statusData} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <DeptBarChart departments={departments} />
      </motion.div>
    </motion.div>
  )
}
