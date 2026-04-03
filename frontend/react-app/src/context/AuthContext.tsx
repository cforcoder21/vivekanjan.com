import { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { User } from '../types'

type AuthContextType = {
  token: string | null
  user: User | null
  signIn: (emailOrUsername: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, username: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'vas_token'
const USER_KEY = 'vas_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  })

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
  }

  const value = useMemo(
    () => ({ token, user, signIn, signUp, signOut }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
