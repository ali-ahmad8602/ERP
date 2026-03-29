import { io } from 'socket.io-client'

let socket = null
const listeners = new Set()
let statusCallback = null
const isDev = import.meta.env.DEV

function getBaseUrl() {
  return (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '')
}

export function connectSocket(token) {
  if (!token) return
  if (socket?.connected && socket.auth?.token === token) return

  disconnectSocket()

  socket = io(getBaseUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    timeout: 10000,
  })

  socket.on('connect', () => {
    if (isDev) console.log('[Socket] Connected')
    statusCallback?.('connected')
  })

  socket.on('disconnect', () => {
    statusCallback?.('disconnected')
  })

  socket.on('connect_error', () => {
    statusCallback?.('error')
  })

  socket.on('reconnect_attempt', () => {
    statusCallback?.('reconnecting')
  })

  socket.on('reconnect', () => {
    statusCallback?.('connected')
  })

  socket.on('notification', (data) => {
    listeners.forEach((fn) => {
      try { fn(data) } catch { /* listener error */ }
    })
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
    statusCallback?.('disconnected')
  }
}

export function onNotification(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function onStatusChange(callback) {
  statusCallback = callback
  return () => { if (statusCallback === callback) statusCallback = null }
}

export function isSocketConnected() {
  return socket?.connected ?? false
}
