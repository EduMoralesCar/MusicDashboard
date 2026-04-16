"use client"

import { Search as SearchIcon, Play, Pause } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import {
  searchTracks,
  searchUsers,
  getTrendingTracks,
  type AudiusTrack,
  type AudiusUser,
} from "@/lib/audius"
import { TrackCard } from "./track-card"
import { TrackRow } from "./track-row"
import { ArtistCard } from "./artist-card"
import { SkeletonCard, SkeletonRow } from "./skeletons"
import { usePlayer } from "./player-provider"
import { cn } from "@/lib/utils"

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function SearchView() {
  const [query, setQuery] = useState("")
  const debounced = useDebounced(query, 350)
  const hasQuery = debounced.trim().length > 0

  // Allow other components (e.g. sidebar playlists) to preload a query via `#q=...`
  useEffect(() => {
    if (typeof window === "undefined") return
    const readHash = () => {
      const hash = window.location.hash.replace(/^#/, "")
      const params = new URLSearchParams(hash)
      const q = params.get("q")
      if (q) {
        setQuery(q)
        // Clear the hash so it doesn't fight with the user's next keystrokes
        history.replaceState(null, "", window.location.pathname + window.location.search)
      }
    }
    readHash()
    window.addEventListener("hashchange", readHash)
    return () => window.removeEventListener("hashchange", readHash)
  }, [])

  const { data: tracks, isLoading: loadingTracks } = useSWR<AudiusTrack[]>(
    hasQuery ? ["search-tracks", debounced] : null,
    () => searchTracks(debounced),
  )
  const { data: users, isLoading: loadingUsers } = useSWR<AudiusUser[]>(
    hasQuery ? ["search-users", debounced] : null,
    () => searchUsers(debounced),
  )
  const { data: browse } = useSWR<AudiusTrack[]>(!hasQuery ? "browse" : null, () => getTrendingTracks("month"))

  const genres = [
    { name: "Electronic", color: "oklch(0.55 0.22 280)" },
    { name: "Hip-Hop", color: "oklch(0.6 0.22 25)" },
    { name: "Rock", color: "oklch(0.5 0.2 40)" },
    { name: "Pop", color: "oklch(0.65 0.2 340)" },
    { name: "R&B", color: "oklch(0.5 0.22 300)" },
    { name: "Jazz", color: "oklch(0.45 0.18 60)" },
    { name: "Classical", color: "oklch(0.5 0.15 200)" },
    { name: "Folk", color: "oklch(0.55 0.18 100)" },
    { name: "Ambient", color: "oklch(0.5 0.18 220)" },
    { name: "House", color: "oklch(0.6 0.22 330)" },
    { name: "Techno", color: "oklch(0.45 0.2 260)" },
    { name: "Lo-Fi", color: "oklch(0.55 0.15 180)" },
  ]

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header>
        <div className="relative max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </header>

      {!hasQuery && (
        <>
          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight">Browse all</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {genres.map((g) => (
                <div
                  key={g.name}
                  className="relative aspect-[16/10] cursor-pointer overflow-hidden rounded-lg p-4 transition-transform hover:scale-[1.02]"
                  style={{ background: g.color }}
                >
                  <span className="text-xl font-bold text-primary-foreground">{g.name}</span>
                </div>
              ))}
            </div>
          </section>

          {browse && browse.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Popular this month</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {browse.slice(0, 12).map((t) => (
                  <TrackCard key={t.id} track={t} queue={browse} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {hasQuery && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <section className="lg:col-span-2">
              <h2 className="mb-4 text-xl font-bold">Top result</h2>
              {loadingTracks ? (
                <div className="h-56 animate-pulse rounded-lg bg-card" />
              ) : tracks && tracks[0] ? (
                <TopResult track={tracks[0]} queue={tracks} />
              ) : (
                <div className="rounded-lg bg-card p-6 text-sm text-muted-foreground">No results</div>
              )}
            </section>
            <section className="lg:col-span-3">
              <h2 className="mb-4 text-xl font-bold">Songs</h2>
              <div className="flex flex-col gap-1 rounded-lg bg-card/50 p-2">
                {loadingTracks
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : tracks?.slice(0, 5).map((t, i) => (
                      <TrackRow key={t.id} track={t} index={i} queue={tracks.slice(0, 5)} showAlbum={false} />
                    ))}
                {!loadingTracks && (!tracks || tracks.length === 0) && (
                  <div className="px-4 py-4 text-sm text-muted-foreground">No songs found</div>
                )}
              </div>
            </section>
          </div>

          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight">Artists</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {loadingUsers
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} circle />)
                : users?.slice(0, 12).map((u) => <ArtistCard key={u.id} user={u} />)}
            </div>
            {!loadingUsers && (!users || users.length === 0) && (
              <p className="text-sm text-muted-foreground">No artists found</p>
            )}
          </section>

          {tracks && tracks.length > 5 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">All songs</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {tracks.slice(5, 24).map((t) => (
                  <TrackCard key={t.id} track={t} queue={tracks} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function TopResult({ track, queue }: { track: AudiusTrack; queue: AudiusTrack[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const isCurrent = currentTrack?.id === track.id
  const showPause = isCurrent && isPlaying
  const cover = track.artwork?.["480x480"] || track.artwork?.["150x150"] || null

  return (
    <div className="group relative rounded-lg bg-card p-5 transition-colors hover:bg-accent">
      <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-md bg-muted shadow-xl">
        {cover && (
          <Image
            src={cover || "/placeholder.svg"}
            alt={track.title}
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        )}
      </div>
      <h3 className="truncate text-3xl font-bold">{track.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">Song</span> ·{" "}
        {track.user.name}
      </p>
      <button
        onClick={() => (isCurrent ? togglePlay() : playTrack(track, queue))}
        aria-label={showPause ? "Pause" : "Play"}
        className={cn(
          "absolute bottom-5 right-5 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition-all hover:scale-105",
          "group-hover:translate-y-0 group-hover:opacity-100",
          isCurrent && "translate-y-0 opacity-100",
        )}
      >
        {showPause ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
        )}
      </button>
    </div>
  )
}
