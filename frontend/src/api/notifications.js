import apiClient from './client'

export function getNotifications(params = {}) {
  return apiClient.get('/notifications', { params })
}

export function markAsRead(id) {
  return apiClient.patch(`/notifications/${id}/read`)
}

export function markAllAsRead() {
  return apiClient.patch('/notifications/read-all')
}
