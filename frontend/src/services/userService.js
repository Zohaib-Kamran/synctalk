import api from './api'

export const searchUsers = (query) => api.get(`/users/search?query=${encodeURIComponent(query)}`)
