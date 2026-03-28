import { useEffect } from 'react'
import { motion } from 'framer-motion'
import OverviewCards from '../components/analytics/OverviewCards'
import DepartmentTable from '../components/analytics/DepartmentTable'
import ChartsSection from '../components/analytics/ChartsSection'
import ActivityTimeline from '../components/analytics/ActivityTimeline'
import useAnalyticsStore from '../store/useAnalyticsStore'

export default function AnalyticsPage() {
  const overviewStats = useAnalyticsStore((s) => s.overview)
  const departmentBreakdown = useAnalyticsStore((s) => s.departments)
  const statusDistribution = useAnalyticsStore((s) => s.statusDistribution)
  const activityFeed = useAnalyticsStore((s) => s.activities)
  const fetchAll = useAnalyticsStore((s) => s.fetchAll)

  useEffect(() => {
    fetchAll()
  }, [])

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

      {/* KPI Cards */}
      <section className="mb-6">
        <OverviewCards data={overviewStats} />
      </section>

      {/* Department Table */}
      <section className="mb-6">
        <DepartmentTable departments={departmentBreakdown} />
      </section>

      {/* Charts */}
      <section className="mb-6">
        <ChartsSection
          statusData={statusDistribution}
          departments={departmentBreakdown}
        />
      </section>

      {/* Activity Feed */}
      <section className="mb-6">
        <ActivityTimeline activities={activityFeed} />
      </section>
    </motion.div>
  )
}
