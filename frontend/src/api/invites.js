import apiClient from './client'

export function createInvite(data) {
  return apiClient.post('/invites', data)
}

export function getInvites(params = {}) {
  return apiClient.get('/invites', { params })
}

export function revokeInvite(id) {
  return apiClient.delete(`/invites/${id}`)
}

export function validateInvite(token) {
  return apiClient.get(`/invites/validate/${token}`)
}

export function acceptInvite(token, data) {
  return apiClient.post(`/invites/accept/${token}`, data)
}
