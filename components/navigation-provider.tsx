"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
export type View = "home" | "search" | "library" | "liked" | "artist" | "album" | "playlist" | "lyrics" | "settings" | "video"

interface NavigationContextValue {
  view: View
  activeId: string | null
  activeName: string | null
  navigateTo: (view: View, id?: string | null, name?: string | null) => void
  navigateToArtist: (id: string, name?: string) => void
  navigateToAlbum: (id: string) => void
  navigateToPlaylist: (id: string) => void
  goBack: () => void
  canGoBack: boolean
  showQueue: boolean
  setShowQueue: (show: boolean) => void
  isFullscreen: boolean
  setIsFullscreen: (full: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("home")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeName, setActiveName] = useState<string | null>(null)
  const [historyStack, setHistoryStack] = useState<{ view: View; id: string | null; name: string | null }[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const navigateTo = useCallback((newView: View, id: string | null = null, name: string | null = null) => {
    // Add current state to history stack before navigating
    setHistoryStack((prev) => [...prev, { view, id: activeId, name: activeName }])
    
    setView(newView)
    setActiveId(id)
    setActiveName(name)
  }, [view, activeId, activeName])

  const navigateToArtist = useCallback((id: string, name?: string) => {
    navigateTo("artist", id, name || null)
  }, [navigateTo])

  const navigateToAlbum = useCallback((id: string) => {
    navigateTo("album", id, null)
  }, [navigateTo])

  const navigateToPlaylist = useCallback((id: string) => {
    navigateTo("playlist", id, null)
  }, [navigateTo])

  const goBack = useCallback(() => {
    if (historyStack.length === 0) return
    setHistoryStack((prev) => {
      const newStack = [...prev]
      const previousState = newStack.pop()
      if (previousState) {
        setView(previousState.view)
        setActiveId(previousState.id)
        setActiveName(previousState.name)
      }
      return newStack
    })
  }, [historyStack])

  const [showQueue, setShowQueue] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const value = {
    view,
    activeId,
    activeName,
    navigateTo,
    navigateToArtist,
    navigateToAlbum,
    navigateToPlaylist,
    goBack,
    canGoBack: historyStack.length > 0,
    showQueue,
    setShowQueue,
    isFullscreen,
    setIsFullscreen,
    searchQuery,
    setSearchQuery
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error("useNavigation debe usarse dentro de un NavigationProvider")
  return ctx
}
