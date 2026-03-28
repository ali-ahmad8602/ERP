import { create } from 'zustand';
import api from '../api/client';

export const useAppStore = create((set, get) => ({
  user: null,
  departments: [],
  notifications: [],
  activeBoard: null,
  isInitializing: true,
  socket: null, // Stub for WebSocket connection

  // Auth & Session
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user });
      
      console.log('API POST /auth/login', { email, password });
      get().fetchInitialData(); // Trigger cascade
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    const socket = get().socket;
    if (socket) socket.close();
    set({ user: null, departments: [], notifications: [], activeBoard: null, socket: null });
  },

  fetchInitialData: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      
      const meRes = await api.get('/users/me');
      const deptsRes = await api.get('/departments');
      const metricsRes = await api.get('/analytics/overview');
      
      set({ 
        user: meRes.data,
        dashboardMetrics: metricsRes.data,
        departments: deptsRes.data,
        isInitializing: false
      });
      get().connectSocket();
    } catch (err) {
      console.error(err);
      get().logout();
      set({ isInitializing: false });
    }
  },

  // Boards
  fetchBoard: async (id) => {
    try {
      const res = await api.get(`/boards/${id}`);
      set({ activeBoard: res.data });
      return res.data;
    } catch (err) {
      console.error(err);
    }
  },
  
  // Realtime Stub
  connectSocket: () => {
    if (get().socket) return;
    console.log('Initializing WebSocket...');
    const ws = new WebSocket('ws://localhost:3000'); // Assuming backend WS
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          get().addNotification(data.payload);
        }
      } catch(e) {}
    };
    /* Mock instant notification injection */
    setTimeout(() => {
      get().addNotification({ id: Date.now(), message: 'System WebSocket connected', time: 'Just now', read: false });
    }, 2000);
    set({ socket: ws });
  },

  // Notification interactions
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  }))
}));
