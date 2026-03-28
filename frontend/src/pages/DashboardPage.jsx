import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  LayoutGrid,
  FileText,
  BarChart3,
  Building2,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import OverviewCards from '../components/analytics/OverviewCards'
import ActivityTimeline from '../components/analytics/ActivityTimeline'
import NotificationItem from '../components/notifications/NotificationItem'
import GlassCard from '../components/ui/GlassCard'
import useNotificationStore from '../store/useNotificationStore'
import useAnalyticsStore from '../store/useAnalyticsStore'

/* ── Status Styling ── */
const statusStyles = {
  approved: { label: 'Approved', bg: 'bg-accent-emerald/10', text: 'text-accent-emerald' },
  pending: { label: 'Pending', bg: 'bg-amber/10', text: 'text-amber' },
  in_review: { label: 'In Review', bg: 'bg-primary-light/10', text: 'text-primary-light' },
  rejected: { label: 'Rejected', bg: 'bg-danger/10', text: 'text-danger' },
}

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const rowVariant = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

/* ── Helpers ── */
function formatCurrency(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

/* ── Quick Action Button ── */
function QuickActionButton({ icon: Icon, label, iconColor, bgRing, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-glass border border-glass-border hover:bg-glass-hover hover:border-glass-border-hover transition-all cursor-pointer text-left"
    >
      <div className={`p-2 rounded-lg ${bgRing}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.8} />
      </div>
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </motion.button>
  )
}

/* ── Performance Stat Row ── */
function StatRow({ label, value, sub, positive }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-text-primary">{value}</span>
        {sub && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium ${
              positive ? 'text-accent-emerald' : 'text-danger'
            }`}
          >
            {positive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════ */
/*                  DASHBOARD PAGE                 */
/* ════════════════════════════════════════════════ */

export default function DashboardPage() {
  const navigate = useNavigate()
  const notifications = useNotificationStore((s) => s.notifications)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const dashboardStats = useAnalyticsStore((s) => s.dashboardStats)
  const performanceSummary = useAnalyticsStore((s) => s.performanceSummary)
  const recentItems = useAnalyticsStore((s) => s.recentItems)
  const activityFeed = useAnalyticsStore((s) => s.activities)
  const fetchAll = useAnalyticsStore((s) => s.fetchAll)

  useEffect(() => {
    fetchAll()
    fetchNotifications()
  }, [])

  const previewNotifications = notifications.slice(0, 5)

  return (
    <motion.div
      className="min-h-screen bg-base px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ─── Header ─── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Overview of your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm font-medium text-text-secondary hover:bg-glass-hover hover:border-glass-border-hover transition-all cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            Create Board
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(4,84,252,0.3)]"
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </motion.button>
        </div>
      </motion.div>

      {/* ─── KPI Overview ─── */}
      <motion.section
        className="mb-8"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
      >
        <OverviewCards data={dashboardStats} />
      </motion.section>

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Activity Feed */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <ActivityTimeline activities={activityFeed.slice(0, 4)} />
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <GlassCard className="p-6" glow="none">
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <QuickActionButton
                  icon={FileText}
                  label="Create Invoice"
                  iconColor="text-primary-light"
                  bgRing="bg-primary-light/10"
                />
                <QuickActionButton
                  icon={BarChart3}
                  label="View Reports"
                  iconColor="text-accent-emerald"
                  bgRing="bg-accent-emerald/10"
                  onClick={() => navigate('/analytics')}
                />
                <QuickActionButton
                  icon={Building2}
                  label="Manage Departments"
                  iconColor="text-amber"
                  bgRing="bg-amber/10"
                />
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="flex flex-col gap-6">
          {/* Notifications Preview */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <GlassCard className="overflow-hidden" glow="none">
              <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  Notifications
                </h2>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-xs font-medium text-primary-light hover:text-primary-light/80 transition-colors cursor-pointer"
                >
                  View all
                </button>
              </div>
              <div className="divide-y divide-glass-border/40">
                {previewNotifications.map((n, i) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    index={i}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Performance Summary */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
          >
            <GlassCard className="p-5" glow="blue">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary-light/10">
                  <TrendingUp className="w-4 h-4 text-primary-light" strokeWidth={1.8} />
                </div>
                <h2 className="text-lg font-heading font-semibold text-text-primary">
                  Performance
                </h2>
              </div>

              {/* Revenue highlight */}
              <div className="mb-4 p-4 rounded-xl bg-glass border border-glass-border">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-accent-emerald" />
                  <span className="text-xs text-text-muted uppercase tracking-wider">Monthly Revenue</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-heading text-text-primary">
                    {formatCurrency(performanceSummary.monthlyRevenue)}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-accent-emerald">
                    <ArrowUpRight className="w-3 h-3" />
                    {performanceSummary.revenueChange}%
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="divide-y divide-glass-border/40">
                <StatRow
                  label="Approval Rate"
                  value={`${performanceSummary.approvalRate}%`}
                  sub="+2.1%"
                  positive
                />
                <StatRow
                  label="Avg. Processing"
                  value={`${performanceSummary.avgProcessingDays} days`}
                  sub="-0.4d"
                  positive
                />
                <StatRow
                  label="Invoices (Mar)"
                  value={performanceSummary.invoicesThisMonth}
                  sub={`+${performanceSummary.invoicesThisMonth - performanceSummary.invoicesLastMonth}`}
                  positive
                />
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* ─── Recent Items Table ─── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={4}
      >
        <GlassCard className="overflow-hidden" glow="none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Recent Invoices
            </h2>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-xs text-text-muted">Last 7 days</span>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-glass-border/50 text-xs font-medium text-text-muted uppercase tracking-wider">
            <div className="col-span-4">Invoice</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {/* Table Rows */}
          <motion.div
            className="divide-y divide-glass-border/30"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {recentItems.map((item) => {
              const s = statusStyles[item.status] || statusStyles.pending
              return (
                <motion.div
                  key={item.id}
                  variants={rowVariant}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-glass-hover transition-colors cursor-pointer"
                >
                  <div className="col-span-4">
                    <span className="text-sm font-medium text-text-primary">
                      {item.name}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-text-secondary">{item.client}</span>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-lg ${s.bg} ${s.text}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-text-muted font-mono">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-semibold text-text-primary font-mono">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-glass-border text-center">
            <button className="text-xs text-primary-light hover:text-primary-light/80 font-medium transition-colors cursor-pointer">
              View all invoices
            </button>
          </div>
        </GlassCard>
      </motion.section>
    </motion.div>
  )
}
