"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import type { AudiusTrack } from "@/lib/audius"

const STORAGE_KEY = "wavify:liked-tracks:v1"

interface LikedContextValue {
  liked: AudiusTrack[]
  likedIds: Set<string>
  isLiked: (id: string) => boolean
  toggleLike: (track: AudiusTrack) => void
}

const LikedContext = createContext<LikedContextValue | null>(null)

export function LikedProvider({ children }: { children: React.ReactNode }) {
  const [liked, setLiked] = useState<AudiusTrack[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AudiusTrack[]
        if (Array.isArray(parsed)) setLiked(parsed)
      }
    } catch (err) {
      console.log("[v0] Failed to read liked tracks:", (err as Error).message)
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever list changes (after initial hydration)
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(liked))
    } catch (err) {
      console.log("[v0] Failed to persist liked tracks:", (err as Error).message)
    }
  }, [liked, hydrated])

  const likedIds = useMemo(() => new Set(liked.map((t) => t.id)), [liked])

  const isLiked = useCallback((id: string) => likedIds.has(id), [likedIds])

  const toggleLike = useCallback((track: AudiusTrack) => {
    setLiked((prev) => {
      const exists = prev.some((t) => t.id === track.id)
      if (exists) return prev.filter((t) => t.id !== track.id)
      // Newest first
      return [track, ...prev]
    })
  }, [])

  const value = useMemo<LikedContextValue>(
    () => ({ liked, likedIds, isLiked, toggleLike }),
    [liked, likedIds, isLiked, toggleLike],
  )

  return <LikedContext.Provider value={value}>{children}</LikedContext.Provider>
}

export function useLiked() {
  const ctx = useContext(LikedContext)
  if (!ctx) throw new Error("useLiked must be used within LikedProvider")
  return ctx
}
