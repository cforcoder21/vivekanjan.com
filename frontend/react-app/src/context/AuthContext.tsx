import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { User } from '../types'

type AuthContextType = {
  token: string | null
  user: User | null
  signIn: (emailOrUsername: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, username: string) => Promise<void>
  signOut: () => void
  setAuthFromStorage: () => void  // For OAuth flow to trigger re-read
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'vas_token'
const USER_KEY = 'vas_user'
const LOGOUT_TIME_KEY = 'vas_logout_time'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  })

  // Listen for storage changes (OAuth flow, other tabs, etc)
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem(TOKEN_KEY)
      const newUserRaw = localStorage.getItem(USER_KEY)
      const newUser = newUserRaw ? (JSON.parse(newUserRaw) as User) : null
      setToken(newToken)
      setUser(newUser)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Allow OAuth flow to trigger state update
  const setAuthFromStorage = () => {
    const newToken = localStorage.getItem(TOKEN_KEY)
    const newUserRaw = localStorage.getItem(USER_KEY)
    const newUser = newUserRaw ? (JSON.parse(newUserRaw) as User) : null
    setToken(newToken)
    setUser(newUser)
  }

  async function signIn(emailOrUsername: string, password: string) {
    const result = await api.signIn(emailOrUsername, password)
    setToken(result.token)
    setUser(result.user)
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
  }

  async function signUp(name: string, email: string, password: string, username: string) {
    const result = await api.signUp(name, email, password, username)
    setToken(result.token)
    setUser(result.user)
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
  }

  function signOut() {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    // Mark logout time to prevent immediate Clerk re-auth
    localStorage.setItem(LOGOUT_TIME_KEY, Date.now().toString())
  }

  const value = useMemo(
    () => ({ token, user, signIn, signUp, signOut, setAuthFromStorage }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
