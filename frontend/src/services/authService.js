import api from './api'

export const register = (payload) => api.post('/auth/register', payload)
export const login = (payload) => api.post('/auth/login', payload)
export const refresh = () => api.post('/auth/refresh')
export const logout = () => api.post('/auth/logout')
