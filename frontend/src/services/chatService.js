import api from './api'

export const createOneToOne = (memberId) => api.post('/chats', { memberId })
export const getMyChats = () => api.get('/chats')
