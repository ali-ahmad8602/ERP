import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { notificationApi } from "@/lib/api";
import type { Notification } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const POLL_INTERVAL = 30000; // 30s fallback

interface NotificationState {
  notifications: Notification[];
  unreadCount:   number;
  loading:       boolean;

  fetchNotifications: (limit?: number) => Promise<void>;
  markRead:           (id: string) => Promise<void>;
  markAllRead:        () => Promise<void>;
  connectSocket:      (token: string) => void;
  disconnectSocket:   () => void;
}

let socket: Socket | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount:   0,
  loading:       false,

  fetchNotifications: async (limit = 30) => {
    set({ loading: true });
    try {
      const { notifications, unreadCount } = await notificationApi.list({ limit });
      set({ notifications, unreadCount });
    } catch {
      // silent fail
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id: string) => {
    try {
      await notificationApi.markRead(id);
      set(s => ({
        notifications: s.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch {
      // silent fail
    }
  },

  markAllRead: async () => {
    try {
      await notificationApi.markAllRead();
      set(s => ({
        notifications: s.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // silent fail
    }
  },

  connectSocket: (token: string) => {
    // Disconnect existing
    if (socket) { socket.disconnect(); socket = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }

    // Initial fetch
    get().fetchNotifications();

    // Connect socket
    socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("notification", (notification: Notification) => {
      set(s => ({
        notifications: [notification, ...s.notifications].slice(0, 100), // keep last 100
        unreadCount: s.unreadCount + 1,
      }));
    });

    socket.on("connect_error", () => {
      // Fallback to polling if socket fails
      if (!pollTimer) {
        pollTimer = setInterval(() => get().fetchNotifications(), POLL_INTERVAL);
      }
    });

    socket.on("connect", () => {
      // Stop polling if socket reconnects
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    });
  },

  disconnectSocket: () => {
    if (socket) { socket.disconnect(); socket = null; }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  },
}));
