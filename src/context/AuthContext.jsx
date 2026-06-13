// context/AuthContext.js
import { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Vérifier la session au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      
      // Vérifier si le token est encore valide
      try {
        const response = await authAPI.me()
        if (response.data.success) {
          const freshUser = response.data.data.user
          setUser(freshUser)
          localStorage.setItem('user', JSON.stringify(freshUser))
          localStorage.setItem('user_role', freshUser.role)
        }
      } catch (error) {
        // Token invalide, on déconnecte
        logout()
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      
      if (response.data.success) {
        const { token, user } = response.data.data
        
        // Stockage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('user_role', user.role)
        
        setToken(token)
        setUser(user)
        
        return { success: true, user }
      }
      return { success: false, message: 'Login failed' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('user_role')
      setToken(null)
      setUser(null)
      window.location.href = '/login'
    }
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAdmin,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)