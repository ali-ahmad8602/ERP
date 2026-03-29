import apiClient from './client'

export function login(email, password) {
  return apiClient.post('/auth/login', { email, password })
}

export function getMe() {
  return apiClient.get('/auth/me')
}

export function register(name, email, password) {
  return apiClient.post('/auth/register', { name, email, password })
}
