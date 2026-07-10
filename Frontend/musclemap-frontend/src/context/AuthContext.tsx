/**
 * AuthContext.tsx
 * Manages authentication state across the app.
 * Reads token from localStorage on mount.
 * Provides user info and logout function.
 */

import { createContext, useContext, useState } from 'react'
import { getToken, getSavedUser, removeToken, saveToken, saveUser } from '../utils/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getSavedUser())
  const [token, setToken] = useState<string | null>(getToken())

  function setAuth(newToken: string, newUser: User) {
    saveToken(newToken)
    saveUser(newUser)
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    removeToken()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, token, setAuth, logout, isLoggedIn: !!token
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
