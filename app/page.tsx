"use client"

import { AuthProvider } from "@/components/auth-provider"
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

function InnerPage() {
  const { view, activeId, navigateTo, navigateToArtist, navigateToAlbum } = useNavigation()

  return (
    <div className="flex h-svh flex-col bg-background text-foreground select-none">
      <div className="flex min-h-0 flex-1 gap-2 p-2">
        <Sidebar view={view} onViewChange={(v) => navigateTo(v)} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-b from-card to-background border border-neutral-900 shadow-xl">
          <TopBar />
          <div className="min-h-0 flex-1 overflow-y-auto px-6">
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
      <FullscreenView />
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <LikedProvider>
          <PlayerProvider>
            <InnerPage />
          </PlayerProvider>
        </LikedProvider>
      </NavigationProvider>
    </AuthProvider>
  )
}
