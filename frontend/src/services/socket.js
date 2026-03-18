import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] })
    socket.on('connect', () => console.log('🔌 Socket connected'))
    socket.on('disconnect', () => console.log('🔌 Socket disconnected'))
  }
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}

export const joinShow = (showId) => {
  if (socket) socket.emit('joinShow', showId)
}

export const leaveShow = (showId) => {
  if (socket) socket.emit('leaveShow', showId)
}

export const onSeatUpdate = (callback) => {
  if (socket) socket.on('seatUpdate', callback)
}

export const offSeatUpdate = () => {
  if (socket) socket.off('seatUpdate')
}

export const onSeatsReleased = (callback) => {
  if (socket) socket.on('seatsReleased', callback)
}
