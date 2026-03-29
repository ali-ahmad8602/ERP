import { create } from 'zustand'
import * as analyticsApi from '../api/analytics'

const useAnalyticsStore = create((set, get) => ({
  // Live API data — null means "never fetched", triggering skeleton loaders
  overview: null,
  departments: null,
  activities: null,
  hasMoreActivities: true,
  loadingMore: false,

  loading: false,
  error: null,

  fetchOverview: async () => {
    set({ loading: true, error: null })
    try {
      const data = await analyticsApi.getOverview()
      set({ overview: data, loading: false })
    } catch {
      set({ loading: false, error: 'Failed to load overview' })
    }
  },

  fetchDepartments: async () => {
    set({ loading: true, error: null })
    try {
      const data = await analyticsApi.getDepartments()
      set({ departments: data.departments, loading: false })
    } catch {
      set({ loading: false, error: 'Failed to load departments' })
    }
  },

  fetchActivity: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const data = await analyticsApi.getActivity(params)
      set({ activities: data.activities, loading: false, hasMoreActivities: data.activities.length >= (params.limit || 50) })
    } catch {
      set({ loading: false, error: 'Failed to load activity' })
    }
  },

  loadMoreActivities: async () => {
    const { activities, loadingMore } = get()
    if (loadingMore || !activities?.length) return
    set({ loadingMore: true })
    try {
      const lastDate = activities[activities.length - 1].createdAt
      const data = await analyticsApi.getActivity({ before: lastDate, limit: 20 })
      set((state) => ({
        activities: [...(state.activities || []), ...data.activities],
        hasMoreActivities: data.activities.length >= 20,
        loadingMore: false,
      }))
    } catch {
      set({ loadingMore: false })
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const [overview, departments, activity] = await Promise.allSettled([
        analyticsApi.getOverview(),
        analyticsApi.getDepartments(),
        analyticsApi.getActivity(),
      ])

      const updates = { loading: false }
      if (overview.status === 'fulfilled') {
        updates.overview = overview.value
      }
      if (departments.status === 'fulfilled') {
        updates.departments = departments.value.departments
      }
      if (activity.status === 'fulfilled') {
        updates.activities = activity.value.activities
      }

      const anyFailed = [overview, departments, activity].some(
        (r) => r.status === 'rejected'
      )
      if (anyFailed) {
        updates.error = 'Some data failed to load'
      }

      set(updates)
    } catch {
      set({ loading: false, error: 'Failed to load analytics' })
    }
  },

  // Derived selectors — compute from live data without duplicating state
  getDashboardStats: () => {
    const o = get().overview
    if (!o) return null
    return {
      totalCards: o.totalCards,
      inProgressCount: o.inProgressCount,
      overdueCount: o.overdueCount,
      pendingApprovals: o.pendingApprovals,
      complianceItems: o.complianceItems,
    }
  },

  getStatusDistribution: () => {
    const o = get().overview
    if (!o) return []
    const backlog = o.totalCards - o.doneCount - o.inProgressCount - o.overdueCount
    return [
      { name: 'Done', value: o.doneCount, color: '#10B981' },
      { name: 'In Progress', value: o.inProgressCount, color: '#0EA5E9' },
      { name: 'Backlog', value: Math.max(0, backlog), color: '#6B7280' },
      { name: 'Overdue', value: o.overdueCount, color: '#FF3B3B' },
    ]
  },

  getPerformanceSummary: () => {
    const o = get().overview
    if (!o) return null
    const total = o.totalCards || 1
    const completionRate = Math.round((o.doneCount / total) * 100 * 10) / 10
    return {
      completionRate,
      totalCards: o.totalCards,
      doneCount: o.doneCount,
      createdThisWeek: o.createdThisWeek,
      createdThisMonth: o.createdThisMonth,
      pendingApprovals: o.pendingApprovals,
      complianceItems: o.complianceItems,
    }
  },
}))

export default useAnalyticsStore
