import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import OverviewCards from '../components/analytics/OverviewCards'
import DepartmentTable from '../components/analytics/DepartmentTable'
import ChartsSection from '../components/analytics/ChartsSection'
import ActivityTimeline from '../components/analytics/ActivityTimeline'
import useAnalyticsStore from '../store/useAnalyticsStore'

export default function AnalyticsPage() {
  const overview = useAnalyticsStore((s) => s.overview)
  const departments = useAnalyticsStore((s) => s.departments)
  const activities = useAnalyticsStore((s) => s.activities)
  const loading = useAnalyticsStore((s) => s.loading)
  const loadingMore = useAnalyticsStore((s) => s.loadingMore)
  const hasMoreActivities = useAnalyticsStore((s) => s.hasMoreActivities)
  const error = useAnalyticsStore((s) => s.error)
  const fetchAll = useAnalyticsStore((s) => s.fetchAll)
  const loadMoreActivities = useAnalyticsStore((s) => s.loadMoreActivities)

  // Derived from live overview — no mock needed
  const statusDistribution = useAnalyticsStore((s) => s.getStatusDistribution())

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return (
    <motion.div
      className="min-h-screen bg-base px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Organization-wide performance overview
        </p>
      </div>

      {/* Error Banner */}
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

      {/* KPI Cards */}
      <section className="mb-6">
        <OverviewCards data={overview} />
      </section>

      {/* Department Table */}
      <section className="mb-6">
        <DepartmentTable departments={departments} loading={loading && !departments} />
      </section>

      {/* Charts — status distribution derived from live overview data */}
      <section className="mb-6">
        <ChartsSection
          statusData={statusDistribution}
          departments={departments}
        />
      </section>

      {/* Activity Feed */}
      <section className="mb-6">
        <ActivityTimeline
          activities={activities}
          loading={(loading && !activities) || loadingMore}
          onLoadMore={loadMoreActivities}
          hasMore={hasMoreActivities}
        />
      </section>
    </motion.div>
  )
}
