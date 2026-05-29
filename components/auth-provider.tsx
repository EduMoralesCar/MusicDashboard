"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { toast } from "sonner"

interface User {
  username: string
  email: string
  isVerified: boolean
  likedTracks: string[]
  avatar?: string
  followedArtists?: any[]
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Error al obtener usuario:", err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (res.ok) {
        setUser(null)
        toast.success("Sesión cerrada correctamente.")
        // Force redirect to auth page and reload
        window.location.href = "/auth"
      } else {
        toast.error("Error al cerrar sesión.")
      }
    } catch (err) {
      toast.error("Error al cerrar sesión.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider")
  return ctx
}
