"use client"

import { useState } from "react"
import { PlayerProvider } from "@/components/player-provider"
import { LikedProvider } from "@/components/liked-provider"
import { Sidebar, type View } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { PlayerBar } from "@/components/player-bar"
import { HomeView } from "@/components/home-view"
import { SearchView } from "@/components/search-view"
import { LibraryView } from "@/components/library-view"
import { LikedSongsView } from "@/components/liked-songs-view"

export default function Page() {
  const [view, setView] = useState<View>("home")

  return (
    <LikedProvider>
      <PlayerProvider>
        <div className="flex h-svh flex-col bg-background text-foreground">
          <div className="flex min-h-0 flex-1 gap-2 p-2">
            <Sidebar view={view} onViewChange={setView} />
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-b from-card to-background">
              <TopBar />
              <div className="min-h-0 flex-1 overflow-y-auto px-6">
                {view === "home" && <HomeView />}
                {view === "search" && <SearchView />}
                {view === "library" && <LibraryView />}
                {view === "liked" && <LikedSongsView />}
              </div>
            </main>
          </div>
          <PlayerBar />
        </div>
      </PlayerProvider>
    </LikedProvider>
  )
}
