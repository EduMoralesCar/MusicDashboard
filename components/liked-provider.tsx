"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import type { AudiusTrack } from "@/lib/audius"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"

const STORAGE_KEY = "eumora:liked-tracks:v1"

interface LikedContextValue {
  liked: AudiusTrack[]
  likedIds: Set<string>
  isLiked: (id: string) => boolean
  toggleLike: (track: AudiusTrack) => void
}

const LikedContext = createContext<LikedContextValue | null>(null)

export function LikedProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState<AudiusTrack[]>([])
  const [hydrated, setHydrated] = useState(false)

  // 1. Initial Load: Load local tracks from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AudiusTrack[]
        if (Array.isArray(parsed)) setLiked(parsed)
      }
    } catch (err) {
      console.log("Error reading liked tracks from localStorage:", err)
    }
    setHydrated(true)
  }, [])

  // 2. Cloud Sync: When user logs in/changes, merge with MongoDB
  useEffect(() => {
    if (!hydrated || !user) return

    const syncWithDb = async () => {
      try {
        const res = await fetch("/api/auth/liked-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ likedTracks: liked }), // Send current local tracks to merge
        })

        if (res.ok) {
          const data = await res.json()
          // Update state and localStorage with the fully merged list from the cloud
          setLiked(data.likedTracks)
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data.likedTracks))
        }
      } catch (err) {
        console.error("Error syncing favorites with database:", err)
      }
    }

    syncWithDb()
  }, [user, hydrated])

  // 3. Keep local storage up to date for offline or fast-load access
  const persistLocally = (newLiked: AudiusTrack[]) => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newLiked))
    } catch (err) {
      console.error("Error persisting liked tracks locally:", err)
    }
  }

  const likedIds = useMemo(() => new Set(liked.filter(Boolean).map((t) => t.id)), [liked])

  const isLiked = useCallback((id: string) => likedIds.has(id), [likedIds])

  const toggleLike = useCallback(
    async (track: AudiusTrack) => {
      const exists = liked.some((t) => t && t.id === track.id)
      const action = exists ? "remove" : "add"

      // Optimistic update local state for responsive UI
      let updatedLiked: AudiusTrack[] = []
      if (exists) {
        updatedLiked = liked.filter((t) => t && t.id !== track.id)
        toast.success(`Eliminada de tus canciones favoritas.`)
      } else {
        updatedLiked = [track, ...liked]
        toast.success(`Añadida a tus canciones favoritas.`)
      }
      
      setLiked(updatedLiked)
      persistLocally(updatedLiked)

      // If user is logged in, sync the single action with MongoDB
      if (user) {
        try {
          const res = await fetch("/api/auth/liked-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ track, action }),
          })

          if (!res.ok) {
            console.error("Failed to sync liked track action with DB")
          } else {
            const data = await res.json()
            // Make sure we have the absolute source of truth from DB
            setLiked(data.likedTracks)
            persistLocally(data.likedTracks)
          }
        } catch (err) {
          console.error("Network error syncing liked track:", err)
        }
      }
    },
    [liked, user]
  )

  const value = useMemo<LikedContextValue>(
    () => ({ liked: liked.filter(Boolean), likedIds, isLiked, toggleLike }),
    [liked, likedIds, isLiked, toggleLike],
  )

  return <LikedContext.Provider value={value}>{children}</LikedContext.Provider>
}

export function useLiked() {
  const ctx = useContext(LikedContext)
  if (!ctx) throw new Error("useLiked must be used within LikedProvider")
  return ctx
}
