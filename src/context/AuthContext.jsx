import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (!storedToken) {
        setLoading(false)
        return
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {}
      }

      try {
        const { data } = await authAPI.me()
        const userData = data.data?.user ?? data.user ?? data
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } catch {
        console.warn('Impossible de rafraîchir le profil, session conservée.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials)
    const receivedToken = data.data?.token ?? data.token ?? data.access_token
    const userData = data.data?.user ?? data.user ?? data
    localStorage.setItem('token', receivedToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(receivedToken)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await authAPI.register(payload)
    const receivedToken = data.data?.token ?? data.token ?? data.access_token
    const userData = data.data?.user ?? data.user ?? data
    if (receivedToken) {
      localStorage.setItem('token', receivedToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(receivedToken)
      setUser(userData)
    }
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {}
    finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.me()
    const userData = data.data?.user ?? data.user ?? data
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    return userData
  }, [])

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
