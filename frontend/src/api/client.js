import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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

    // Auto-redirect on auth failure
    if (status === 401) {
      localStorage.removeItem('token')
      // Only redirect if not already on a public page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }

    console.error(`[API ${status || 'NETWORK'}] ${message}`)
    return Promise.reject(error)
  }
)

export default apiClient
