import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../services/authService'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    else delete api.defaults.headers.common['Authorization']
  }, [accessToken])

  const register = async (data) => {
    const res = await authApi.register(data)
    setUser(res.data.user)
    setAccessToken(res.data.accessToken)
    return res
  }

  const login = async (data) => {
    const res = await authApi.login(data)
    setUser(res.data.user)
    setAccessToken(res.data.accessToken)
    return res
  }

  const refresh = async () => {
    const res = await authApi.refresh()
    setAccessToken(res.data.accessToken)
    return res
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, register, login, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
