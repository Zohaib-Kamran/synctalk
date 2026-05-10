import { io } from 'socket.io-client'
let socket = null

export function initSocket(token) {
  if (socket) return socket
  socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:4000', {
    auth: { token },
    withCredentials: true,
  })
  return socket
}

export function getSocket() { return socket }

export function disconnectSocket() { if (socket) { socket.disconnect(); socket = null } }
