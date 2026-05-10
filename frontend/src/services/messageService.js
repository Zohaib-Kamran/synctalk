import api from './api'

export const sendMessage = (payload) => api.post('/messages', payload)
export const getMessages = (chatId) => api.get(`/messages/${chatId}`)
