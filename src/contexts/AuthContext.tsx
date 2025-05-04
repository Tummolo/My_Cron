import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react'

export interface User {
  id: number
  username: string
  role: 'admin' | 'patient'
  nome?: string
  cognome?: string
  malattia?: string
}

interface AuthContextType {
  user: User | null
  login: (u: string, p: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API = import.meta.env.VITE_API_BASE as string

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // appena parte l’app, provo a leggere /api/auth/me.php
  useEffect(() => {
    fetch(`${API}/auth/me.php`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((u: User) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API}/auth/login.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      throw new Error(e.error || 'Login fallito')
    }
    const u: User = await res.json()
    setUser(u)
  }

  const logout = async () => {
    await fetch(`${API}/auth/logout.php`, {
      method: 'POST',
      credentials: 'include'
    })
    setUser(null)
  }

  if (loading) return null // o uno spinner

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve stare dentro AuthProvider')
  return ctx
}
