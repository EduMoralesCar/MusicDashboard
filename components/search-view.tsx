"use client"

import { Search as SearchIcon, Play, Pause } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import type { AudiusTrack } from "@/lib/audius"
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

  // Preload a query via URL hash (used by sidebar quick playlists)
  useEffect(() => {
    if (typeof window === "undefined") return
    const readHash = () => {
      const hash = window.location.hash.replace(/^#/, "")
      const params = new URLSearchParams(hash)
      const q = params.get("q")
      if (q) {
        setQuery(q)
        // Clear the hash to avoid conflicts
        history.replaceState(null, "", window.location.pathname + window.location.search)
      }
    }
    readHash()
    window.addEventListener("hashchange", readHash)
    return () => window.removeEventListener("hashchange", readHash)
  }, [])

  // Call our server-side Deezer search proxy
  const { data: tracks, isLoading: loadingTracks } = useSWR<AudiusTrack[]>(
    hasQuery ? ["search-tracks", debounced] : null,
    () =>
      fetch(`/api/deezer/search?q=${encodeURIComponent(debounced)}`)
        .then((r) => r.json())
        .then((d) => d.data as AudiusTrack[])
  )

  // Fetch official trending songs for the "Popular" category when search is empty
  const { data: browse, isLoading: loadingBrowse } = useSWR<AudiusTrack[]>(
    !hasQuery ? "browse" : null,
    () =>
      fetch("/api/deezer/trending?type=trending")
        .then((r) => r.json())
        .then((d) => d.data as AudiusTrack[])
  )

  const genres = [
    { name: "Reggaetón", query: "reggaeton", color: "oklch(0.65 0.2 340)" },
    { name: "Música Mexicana", query: "mexico", color: "oklch(0.55 0.18 100)" },
    { name: "Rock Latino", query: "rock", color: "oklch(0.5 0.2 40)" },
    { name: "Pop Latino", query: "pop", color: "oklch(0.6 0.22 330)" },
    { name: "Salsa & Bachata", query: "latin", color: "oklch(0.6 0.22 25)" },
    { name: "Colombia", query: "colombia", color: "oklch(0.55 0.22 280)" },
    { name: "Argentina", query: "argentina", color: "oklch(0.5 0.18 220)" },
    { name: "Perú", query: "peru", color: "oklch(0.45 0.18 60)" }
  ]

  // Extract matching artists from the search results dynamically
  const artists = useMemo(() => {
    if (!tracks) return []
    const uniqueArtistsMap = new Map()
    tracks.forEach((t) => {
      if (t.user) {
        uniqueArtistsMap.set(t.user.id, t.user)
      }
    })
    return Array.from(uniqueArtistsMap.values())
  }, [tracks])

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            autoFocus
            type="text"
            placeholder="¿Qué quieres escuchar hoy?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-neutral-800 bg-[#181818] py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-[#1db954] focus:outline-none focus:ring-2 focus:ring-[#1db954]/20"
          />
        </div>
      </header>

      {/* DEFAULT EXPLORE SURFACES */}
      {!hasQuery && (
        <>
          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">Explorar todo</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
              {genres.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setQuery(g.query)}
                  className="relative aspect-[16/10] text-left cursor-pointer overflow-hidden rounded-lg p-4 transition-all hover:scale-[1.03] active:scale-[0.98] border border-neutral-900 shadow-lg"
                  style={{ background: g.color }}
                >
                  <span className="text-sm font-extrabold text-black tracking-tight">{g.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-white font-extrabold">Canciones populares hoy</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {loadingBrowse && (!browse || browse.length === 0)
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : browse?.slice(0, 12).map((t) => <TrackCard key={t.id} track={t} queue={browse} />)}
            </div>
          </section>
        </>
      )}

      {/* ACTIVE SEARCH RESULTS SURFACE */}
      {hasQuery && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Top Result */}
            <section className="lg:col-span-2">
              <h2 className="mb-4 text-xl font-bold text-white">Resultado principal</h2>
              {loadingTracks ? (
                <div className="h-56 animate-pulse rounded-lg bg-card/60" />
              ) : tracks && tracks[0] ? (
                <TopResult track={tracks[0]} queue={tracks} />
              ) : (
                <div className="rounded-lg border border-neutral-800 bg-[#181818]/40 p-12 text-center text-sm text-neutral-400">
                  Ningún resultado coincide con tu búsqueda
                </div>
              )}
            </section>

            {/* Songs */}
            <section className="lg:col-span-3">
              <h2 className="mb-4 text-xl font-bold text-white">Canciones oficiales</h2>
              <div className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-[#181818]/40 p-2">
                {loadingTracks
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : tracks?.slice(0, 5).map((t, i) => (
                      <TrackRow key={t.id} track={t} index={i} queue={tracks.slice(0, 5)} showAlbum={false} />
                    ))}
                {!loadingTracks && (!tracks || tracks.length === 0) && (
                  <div className="px-4 py-8 text-center text-sm text-neutral-500">No se encontraron canciones</div>
                )}
              </div>
            </section>
          </div>

          {/* Artists */}
          {artists.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">Artistas</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {loadingTracks
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} circle />)
                  : artists.slice(0, 6).map((u) => <ArtistCard key={u.id} user={u} />)}
              </div>
            </section>
          )}

          {/* More songs */}
          {tracks && tracks.length > 5 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">Más canciones oficiales</h2>
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

import { useMemo } from "react"

function TopResult({ track, queue }: { track: AudiusTrack; queue: AudiusTrack[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const isCurrent = currentTrack?.id === track.id
  const showPause = isCurrent && isPlaying
  const cover = track.artwork?.["480x480"] || track.artwork?.["150x150"] || null

  return (
    <div className="group relative rounded-lg border border-neutral-800 bg-[#181818]/60 p-6 transition-all hover:bg-neutral-800/80">
      <div className="relative mb-6 h-28 w-28 overflow-hidden rounded-md bg-neutral-900 shadow-2xl transition-transform duration-300 group-hover:scale-105">
        {cover && (
          <Image
            src={cover}
            alt={track.title}
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        )}
      </div>
      <h3 className="truncate text-3xl font-extrabold text-white tracking-tight">{track.title}</h3>
      <p className="mt-3 text-sm text-neutral-400 font-semibold flex items-center gap-2">
        <span className="rounded-full bg-[#1db954]/10 border border-[#1db954]/20 px-2.5 py-0.5 text-xs font-bold text-[#1db954]">
          Canción Oficial
        </span>
        · {track.user.name}
      </p>
      <button
        onClick={() => (isCurrent ? togglePlay() : playTrack(track, queue))}
        aria-label={showPause ? "Pausa" : "Reproducir"}
        className={cn(
          "absolute bottom-6 right-6 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-[#1db954] text-black opacity-0 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#1ed760] active:scale-95",
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
