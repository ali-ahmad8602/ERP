import { create } from 'zustand'
import { mockNotifications } from '../data/mockNotifications'
import * as notificationsApi from '../api/notifications'

/**
 * Normalize backend notification shape to match what UI components expect.
 * Backend: { _id, type, title, message, isRead, createdAt, entityType, entityId, sender, department }
 * UI:      { id, icon, title, message, read, timestamp, type, meta }
 */
function normalize(n) {
  return {
    id: n._id,
    icon: n.type,                       // backend type values match iconConfig keys
    title: n.title,
    message: n.message,
    read: n.isRead,
    timestamp: n.createdAt,
    type: n.entityType,                 // card | board | department
    meta: buildMeta(n),
    sender: n.sender,
    department: n.department,
  }
}

function buildMeta(n) {
  // For card entities, entityId is the card ID — not a board ID.
  // We can't resolve card→board without an extra API call, so route to notifications.
  if (n.entityType === 'card') return { boardId: null, cardId: n.entityId }
  if (n.entityType === 'board') return { id: n.entityId }
  if (n.entityType === 'department') return { slug: n.department?.slug || '' }
  return {}
}

const useNotificationStore = create((set, get) => ({
  notifications: mockNotifications,
  loading: false,
  error: null,

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
      // Keep existing (mock) data as fallback
      set({ loading: false, error: 'Failed to load notifications' })
    }
  },

  markAsRead: async (id) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
    try {
      await notificationsApi.markAsRead(id)
    } catch {
      // Revert on failure is optional — notification already visually read
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
    try {
      await notificationsApi.markAllAsRead()
    } catch {
      // Fallback: keep optimistic state
    }
  },
}))

export default useNotificationStore
