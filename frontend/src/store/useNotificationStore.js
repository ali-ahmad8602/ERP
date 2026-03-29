import { create } from 'zustand'
import * as notificationsApi from '../api/notifications'

/**
 * Normalize backend notification to UI shape.
 * Works for both REST responses and Socket.io payloads.
 */
function normalize(n) {
  return {
    id: n._id,
    icon: n.type,
    title: n.title,
    message: n.message,
    read: n.isRead ?? false,
    timestamp: n.createdAt,
    type: n.entityType,
    meta: buildMeta(n),
    sender: n.sender,
    department: n.department,
  }
}

function buildMeta(n) {
  if (n.entityType === 'card') return { boardId: null, cardId: n.entityId }
  if (n.entityType === 'board') return { id: n.entityId }
  if (n.entityType === 'department') return { slug: n.department?.slug || '' }
  return {}
}

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  error: null,
  // Tracks if we have a new unread notification that hasn't been "seen" in the dropdown
  hasNewNotification: false,

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  fetchNotifications: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const data = await notificationsApi.getNotifications(params)
      set({
        notifications: data.notifications.map(normalize),
        loading: false,
      })
    } catch {
      set({ loading: false, error: 'Failed to load notifications' })
    }
  },

  /**
   * Called by the socket listener when a new notification arrives in real-time.
   * Prepends to the list so it appears at the top.
   */
  addRealtimeNotification: (rawNotification) => {
    const notification = normalize(rawNotification)
    set((state) => ({
      notifications: [notification, ...state.notifications],
      hasNewNotification: true,
    }))
  },

  clearNewFlag: () => set({ hasNewNotification: false }),

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
    try {
      await notificationsApi.markAsRead(id)
    } catch { /* keep optimistic state */ }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
    try {
      await notificationsApi.markAllAsRead()
    } catch { /* keep optimistic state */ }
  },
}))

export default useNotificationStore
