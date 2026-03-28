import apiClient from './client'

export function getOverview() {
  return apiClient.get('/analytics/overview')
}

export function getDepartments() {
  return apiClient.get('/analytics/departments')
}

export function getActivity(params = {}) {
  return apiClient.get('/analytics/activity', { params })
}
