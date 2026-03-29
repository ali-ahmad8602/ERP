import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const cards = [
  {
    key: 'total',
    label: 'Total Cards',
    field: 'totalCards',
    icon: LayoutDashboard,
    glow: 'blue',
    iconColor: 'text-primary-light',
    bgRing: 'bg-primary-light/10',
  },
  {
    key: 'progress',
    label: 'In Progress',
    field: 'inProgressCount',
    icon: TrendingUp,
    glow: 'emerald',
    iconColor: 'text-accent-emerald',
    bgRing: 'bg-accent-emerald/10',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    field: 'overdueCount',
    icon: AlertTriangle,
    glow: 'red',
    iconColor: 'text-danger',
    bgRing: 'bg-danger/10',
  },
  {
    key: 'approvals',
    label: 'Pending Approvals',
    field: 'pendingApprovals',
    icon: Clock,
    glow: 'amber',
    iconColor: 'text-amber',
    bgRing: 'bg-amber/10',
  },
  {
    key: 'compliance',
    label: 'Compliance Items',
    field: 'complianceItems',
    icon: ShieldCheck,
    glow: 'blue',
    iconColor: 'text-primary-light',
    bgRing: 'bg-primary-light/10',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

function SkeletonCard({ glow, bgRing }) {
  return (
    <GlassCard glow={glow} className="p-5 cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bgRing}`}>
          <div className="w-5 h-5 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="h-9 w-20 rounded-lg bg-white/5 animate-pulse mb-2" />
      <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
    </GlassCard>
  )
}

export default function OverviewCards({ data }) {
  const isLoading = !data

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ key, glow, bgRing }) => (
          <SkeletonCard key={key} glow={glow} bgRing={bgRing} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {cards.map(({ key, label, field, icon: Icon, glow, iconColor, bgRing }) => (
        <GlassCard
          key={key}
          glow={glow}
          hover
          className="p-5 cursor-default"
          variants={item}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${bgRing}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
            </div>
          </div>
          <p className="text-3xl font-bold font-heading tracking-tight text-text-primary">
            {data[field]?.toLocaleString() ?? '—'}
          </p>
          <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-wider">
            {label}
          </p>
        </GlassCard>
      ))}
    </motion.div>
  )
}
