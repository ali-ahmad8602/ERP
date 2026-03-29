import { create } from 'zustand'
import * as authApi from '../api/auth'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ error: null })
    try {
      const data = await authApi.login(email, password)
      localStorage.setItem('token', data.token)
      set({ token: data.token, user: data.user, error: null })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      set({ error: msg })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, error: null })
  },

  checkSession: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ loading: false, token: null, user: null })
      return
    }
    try {
      const data = await authApi.getMe()
      set({ user: data.user, token, loading: false, error: null })
    } catch (err) {
      localStorage.removeItem('token')
      const isAuthError = err.response?.status === 401
      set({
        token: null,
        user: null,
        loading: false,
        error: isAuthError ? null : 'Unable to connect to server',
      })
    }
  },

  isAuthenticated: () => !!get().token,
}))

export default useAuthStore
