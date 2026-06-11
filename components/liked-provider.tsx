"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import type { AudiusTrack } from "@/lib/audius"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"

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

  // Get current storage key based on user session to avoid mixing tracks between accounts
  const getStorageKey = useCallback((email?: string) => {
    return email ? `eumora:liked-tracks:user:${email}` : "eumora:liked-tracks:guest"
  }, [])

  // 1. Initial Load: Load local tracks from localStorage on mount (starts as guest)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const key = getStorageKey() // guest key by default
      const raw = window.localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as AudiusTrack[]
        if (Array.isArray(parsed)) setLiked(parsed)
      }
    } catch (err) {
      console.log("Error reading liked tracks from localStorage:", err)
    }
    setHydrated(true)
  }, [getStorageKey])

  // 2. User Authentication and Sync
  useEffect(() => {
    if (!hydrated) return

    const syncUserTracks = async () => {
      if (user) {
        // We are logged in. Check if there are any guest tracks to merge first.
        let guestTracks: AudiusTrack[] = []
        try {
          const guestRaw = window.localStorage.getItem("eumora:liked-tracks:guest")
          if (guestRaw) {
            guestTracks = JSON.parse(guestRaw) as AudiusTrack[]
          }
        } catch (err) {
          console.error("Error reading guest tracks:", err)
        }

        // If guest tracks exist, merge them with the cloud database account
        if (guestTracks.length > 0) {
          try {
            const res = await fetch("/api/auth/liked-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ likedTracks: guestTracks }),
            })
            if (res.ok) {
              const data = await res.json()
              setLiked(data.likedTracks)
              window.localStorage.setItem(getStorageKey(user.email), JSON.stringify(data.likedTracks))
              // Clear guest tracks after successful merge
              window.localStorage.removeItem("eumora:liked-tracks:guest")
              return
            }
          } catch (err) {
            console.error("Error merging guest tracks:", err)
          }
        }

        // Otherwise (or if merge failed), set tracks directly from user database profile
        const userTracks = (user.likedTracks as unknown as AudiusTrack[]) || []
        setLiked(userTracks)
        window.localStorage.setItem(getStorageKey(user.email), JSON.stringify(userTracks))
      } else {
        // Logged out: Load guest local tracks
        try {
          const raw = window.localStorage.getItem("eumora:liked-tracks:guest")
          if (raw) {
            const parsed = JSON.parse(raw) as AudiusTrack[]
            if (Array.isArray(parsed)) {
              setLiked(parsed)
              return
            }
          }
        } catch (err) {
          console.error("Error loading guest tracks on logout:", err)
        }
        setLiked([])
      }
    }

    syncUserTracks()
  }, [user, hydrated, getStorageKey])

  // 3. Persist locally helper
  const persistLocally = useCallback((newLiked: AudiusTrack[]) => {
    if (typeof window === "undefined") return
    try {
      const key = getStorageKey(user?.email)
      window.localStorage.setItem(key, JSON.stringify(newLiked))
    } catch (err) {
      console.error("Error persisting liked tracks locally:", err)
    }
  }, [user, getStorageKey])

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
    [liked, user, persistLocally]
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
