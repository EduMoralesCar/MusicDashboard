"use client"

import { useAuth } from "@/components/auth-provider"
import { PlayerProvider } from "@/components/player-provider"
import { LikedProvider } from "@/components/liked-provider"
import { NavigationProvider, useNavigation } from "@/components/navigation-provider"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { PlayerBar } from "@/components/player-bar"
import { HomeView } from "@/components/home-view"
import { SearchView } from "@/components/search-view"
import { LibraryView } from "@/components/library-view"
import { LikedSongsView } from "@/components/liked-songs-view"
import { ArtistView } from "@/components/artist-view"
import { AlbumView } from "@/components/album-view"
import { PlaylistView } from "@/components/playlist-view"
import { LyricsView } from "@/components/lyrics-view"
import { SettingsView } from "@/components/settings-view"
import { QueuePanel } from "@/components/queue-panel"
import { VideoView } from "@/components/video-view"
import { FullscreenView } from "@/components/fullscreen-view"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2, Home, Search, Library } from "lucide-react"

function InnerPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { view, activeId, navigateTo } = useNavigation()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center bg-black text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-[#1db954]" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-svh flex-col bg-background text-foreground select-none">
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <Sidebar view={view} onViewChange={(v) => navigateTo(v)} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-b from-card to-background border border-neutral-900 shadow-xl">
          <TopBar />
          <div className={cn(
            "min-h-0 flex-1",
            (view === "video" || view === "lyrics") ? "overflow-hidden px-0" : "overflow-y-auto px-6"
          )}>
            {view === "home" && <HomeView />}
            {view === "search" && <SearchView />}
            {view === "library" && <LibraryView />}
            {view === "liked" && <LikedSongsView />}
            {view === "lyrics" && <LyricsView />}
            {view === "settings" && <SettingsView />}
            {view === "video" && <VideoView />}
            
            {/* Dynamic Interactive Spotify Detail Views */}
            {view === "artist" && activeId && (
              <ArtistView 
                artistId={activeId} 
                onViewChange={(v) => navigateTo(v)} 
                onActiveIdChange={(id) => navigateTo("artist", id)} 
              />
            )}
            
            {view === "album" && activeId && (
              <AlbumView 
                albumId={activeId} 
                onViewChange={(v) => navigateTo(v)} 
                onActiveIdChange={(id) => navigateTo("artist", id)} 
              />
            )}
            
            {view === "playlist" && activeId && (
              <PlaylistView 
                playlistId={activeId} 
                onViewChange={(v) => navigateTo(v)} 
              />
            )}
          </div>
        </main>
        <QueuePanel />
      </div>
      <PlayerBar />
      
      {/* Mobile Bottom Navigation */}
      <nav className="flex h-16 items-center justify-around border-t border-neutral-900 bg-black/95 backdrop-blur-md px-6 py-2 md:hidden shrink-0">
        {[
          { id: "home" as const, label: "Inicio", icon: Home },
          { id: "search" as const, label: "Buscar", icon: Search },
          { id: "library" as const, label: "Biblioteca", icon: Library },
        ].map((item) => {
          const Icon = item.icon
          const active = view === item.id || (item.id === "library" && (view === "liked" || view === "playlist"))
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all duration-200 cursor-pointer",
                active ? "text-[#1db954]" : "text-neutral-400 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      
      <FullscreenView />
    </div>
  )
}

export default function Page() {
  return (
    <NavigationProvider>
      <LikedProvider>
        <PlayerProvider>
          <InnerPage />
        </PlayerProvider>
      </LikedProvider>
    </NavigationProvider>
  )
}
