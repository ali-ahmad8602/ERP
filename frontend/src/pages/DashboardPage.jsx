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
  Clock,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react'
import OverviewCards from '../components/analytics/OverviewCards'
import ActivityTimeline from '../components/analytics/ActivityTimeline'
import NotificationItem from '../components/notifications/NotificationItem'
import GlassCard from '../components/ui/GlassCard'
import useNotificationStore from '../store/useNotificationStore'
import useAnalyticsStore from '../store/useAnalyticsStore'
import usePermissions from '../hooks/usePermissions'

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: 'easeOut' },
  }),
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
            <ArrowUpRight className="w-3 h-3" />
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

  const { canCreateCard } = usePermissions()
  const loading = useAnalyticsStore((s) => s.loading)
  const error = useAnalyticsStore((s) => s.error)
  const activities = useAnalyticsStore((s) => s.activities)
  const fetchAll = useAnalyticsStore((s) => s.fetchAll)

  // Derived selectors — computed from live API data
  const dashboardStats = useAnalyticsStore((s) => s.getDashboardStats())
  const perf = useAnalyticsStore((s) => s.getPerformanceSummary())

  useEffect(() => {
    fetchAll()
    fetchNotifications()
  }, [fetchAll, fetchNotifications])

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
            onClick={() => navigate('/boards')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm font-medium text-text-secondary hover:bg-glass-hover hover:border-glass-border-hover transition-all cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            View Boards
          </motion.button>
          {canCreateCard && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/boards')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-[0_0_20px_rgba(4,84,252,0.3)]"
            >
              <Plus className="w-4 h-4" />
              New Task
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ─── Error Banner ─── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

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
            <ActivityTimeline
              activities={activities?.slice(0, 4) ?? null}
              loading={loading && !activities}
            />
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
                {canCreateCard && (
                  <QuickActionButton
                    icon={FileText}
                    label="Create Task"
                    iconColor="text-primary-light"
                    bgRing="bg-primary-light/10"
                    onClick={() => navigate('/boards')}
                  />
                )}
                <QuickActionButton
                  icon={BarChart3}
                  label="View Reports"
                  iconColor="text-accent-emerald"
                  bgRing="bg-accent-emerald/10"
                  onClick={() => navigate('/analytics')}
                />
                <QuickActionButton
                  icon={Building2}
                  label="View Boards"
                  iconColor="text-amber"
                  bgRing="bg-amber/10"
                  onClick={() => navigate('/boards')}
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
                {previewNotifications.length > 0 ? (
                  previewNotifications.map((n, i) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      index={i}
                    />
                  ))
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-text-muted">No notifications</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Performance Summary — derived from live analytics */}
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

              {!perf ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                      <div className="h-4 w-12 rounded bg-white/5 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Completion rate highlight */}
                  <div className="mb-4 p-4 rounded-xl bg-glass border border-glass-border">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-accent-emerald" />
                      <span className="text-xs text-text-muted uppercase tracking-wider">Completion Rate</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-heading text-text-primary">
                        {perf.completionRate}%
                      </span>
                      <span className="text-xs text-text-muted">
                        {perf.doneCount} of {perf.totalCards} tasks
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-glass-border/40">
                    <StatRow
                      label="Created This Week"
                      value={perf.createdThisWeek}
                    />
                    <StatRow
                      label="Created This Month"
                      value={perf.createdThisMonth}
                    />
                    <StatRow
                      label="Pending Approvals"
                      value={perf.pendingApprovals}
                    />
                    <StatRow
                      label="Compliance Items"
                      value={perf.complianceItems}
                    />
                  </div>
                </>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
