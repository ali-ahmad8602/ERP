import { create } from 'zustand'
import {
  overviewStats as mockOverview,
  departmentBreakdown as mockDepartments,
  activityFeed as mockActivity,
  statusDistribution as mockStatusDist,
} from '../data/mockAnalytics'
import {
  dashboardStats as mockDashboardStats,
  performanceSummary as mockPerformance,
  recentItems as mockRecentItems,
} from '../data/mockDashboard'
import * as analyticsApi from '../api/analytics'

const useAnalyticsStore = create((set) => ({
  // Analytics page data
  overview: mockOverview,
  departments: mockDepartments,
  activities: mockActivity,
  statusDistribution: mockStatusDist,

  // Dashboard page data
  dashboardStats: mockDashboardStats,
  performanceSummary: mockPerformance,
  recentItems: mockRecentItems,

  loading: false,
  error: null,

  fetchOverview: async () => {
    set({ loading: true, error: null })
    try {
      const data = await analyticsApi.getOverview()
      set({
        overview: data,
        dashboardStats: {
          totalCards: data.totalCards,
          inProgressCount: data.inProgressCount,
          overdueCount: data.overdueCount,
          pendingApprovals: data.pendingApprovals,
          complianceItems: data.complianceItems,
        },
        loading: false,
      })
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
      set({ activities: data.activities, loading: false })
    } catch {
      set({ loading: false, error: 'Failed to load activity' })
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

      const updates = {}
      if (overview.status === 'fulfilled') {
        updates.overview = overview.value
        updates.dashboardStats = {
          totalCards: overview.value.totalCards,
          inProgressCount: overview.value.inProgressCount,
          overdueCount: overview.value.overdueCount,
          pendingApprovals: overview.value.pendingApprovals,
          complianceItems: overview.value.complianceItems,
        }
      }
      if (departments.status === 'fulfilled') {
        updates.departments = departments.value.departments
      }
      if (activity.status === 'fulfilled') {
        updates.activities = activity.value.activities
      }

      set({ ...updates, loading: false })
    } catch {
      set({ loading: false, error: 'Failed to load analytics' })
    }
  },
}))

export default useAnalyticsStore
