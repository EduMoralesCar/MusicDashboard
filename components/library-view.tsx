"use client"

import useSWR from "swr"
import { getTrendingPlaylists, type AudiusPlaylist } from "@/lib/audius"
import Image from "next/image"
import { Music2 } from "lucide-react"
import { formatCount } from "@/lib/audius"

export function LibraryView() {
  const { data: playlists, isLoading } = useSWR<AudiusPlaylist[]>("trending-playlists", getTrendingPlaylists)

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">Trending playlists you can add to your library</p>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-card p-4">
                <div className="aspect-square w-full rounded-md bg-muted" />
                <div className="mt-4 h-3 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </div>
            ))
          : playlists?.map((p) => <PlaylistCard key={p.id} playlist={p} />)}
      </section>
    </div>
  )
}

function PlaylistCard({ playlist }: { playlist: AudiusPlaylist }) {
  const cover = playlist.artwork?.["480x480"] || playlist.artwork?.["150x150"] || null
  return (
    <div className="group cursor-pointer rounded-lg bg-card p-4 transition-colors hover:bg-accent">
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-muted shadow-lg">
        {cover ? (
          <Image
            src={cover || "/placeholder.svg"}
            alt={playlist.playlist_name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="truncate text-sm font-semibold">{playlist.playlist_name}</h3>
      <p className="mt-1 truncate text-xs text-muted-foreground">
        By {playlist.user.name} · {formatCount(playlist.total_play_count)} plays
      </p>
    </div>
  )
}
