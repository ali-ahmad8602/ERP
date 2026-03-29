import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize responses and handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    if (status === 401) {
      // Clear stale token — the auth store / RequireAuth will handle redirect
      localStorage.removeItem('token')
      // Dynamically import to avoid circular deps
      import('../store/useAuthStore').then((mod) => {
        mod.default.getState().logout()
      })
    }

    console.error(`[API ${status || 'NETWORK'}] ${message}`)
    return Promise.reject(error)
  }
)

export default apiClient
