"use client"

import useSWR from "swr"
import { Play, Pause, Disc, ArrowLeft, Loader2, Calendar, User } from "lucide-react"
import { TrackRow } from "./track-row"
import { usePlayer } from "./player-provider"
import { useNavigation } from "./navigation-provider"
import type { AudiusTrack } from "@/lib/audius"

interface AlbumViewProps {
  albumId: string
  onViewChange: (view: any) => void
  onActiveIdChange: (id: string | null) => void
}

// Fetcher
const fetchAlbum = (url: string) => fetch(url).then(res => res.json()).then(data => data.album)

export function AlbumView({ albumId, onViewChange, onActiveIdChange }: AlbumViewProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const { goBack } = useNavigation()

  // Extract the numeric ID from deezer_album_XXX
  const numericId = albumId.replace("deezer_album_", "").replace("album_", "")

  // Fetch album details and tracks
  const { data: album, error, isLoading } = useSWR(
    `/api/deezer/album?id=${numericId}`,
    fetchAlbum
  )

  const handlePlayAlbum = () => {
    if (!album || !album.tracks || album.tracks.length === 0) return
    const isCurrentAlbum = album.tracks.some((t: any) => t.id === currentTrack?.id)
    if (isCurrentAlbum) {
      togglePlay()
    } else {
      playTrack(album.tracks[0], album.tracks)
    }
  }

  const isCurrentPlaying = album && currentTrack && isPlaying && album.tracks.some((t: any) => t.id === currentTrack.id)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-neutral-400">
        <Loader2 className="h-10 w-10 animate-spin text-[#1db954]" />
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="text-neutral-400">Ocurrió un error al cargar el álbum.</p>
        <button
          onClick={() => onViewChange("search")}
          className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#1ed760]"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a buscar
        </button>
      </div>
    )
  }

  const tracksCount = album.tracks?.length || 0
  const durationSumSeconds = album.tracks?.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || 0
  const durationMinutes = Math.floor(durationSumSeconds / 60)

  return (
    <div className="flex flex-col gap-8 pb-12 text-white">
      {/* Back button */}
      <div>
        <button
          onClick={goBack}
          className="flex items-center gap-2 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-sm font-bold text-white px-4 py-2"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
      </div>

      {/* Header Container */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        {/* Cover */}
        <div className="relative aspect-square w-48 shrink-0 overflow-hidden rounded-xl bg-neutral-900 shadow-2xl md:w-56 border border-neutral-800/40">
          {album.cover && (
            <img
              src={album.cover}
              alt={album.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Album details */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1db954]">
            Álbum Oficial
          </span>
          <h1 className="text-4xl font-extrabold md:text-5xl tracking-tight leading-none text-white">
            {album.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-300 font-semibold mt-2">
            <button
              onClick={() => {
                if (album.artist?.id) {
                  onActiveIdChange(album.artist.id)
                  onViewChange("artist")
                }
              }}
              className="flex items-center gap-1.5 font-bold text-white hover:text-[#1db954] hover:underline"
            >
              <User className="h-4 w-4 text-[#1db954]" />
              {album.artist?.name}
            </button>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span>{album.release_date ? new Date(album.release_date).getFullYear() : "N/A"}</span>
            </div>
            <span>·</span>
            <span>{tracksCount} canciones, {durationMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={handlePlayAlbum}
          disabled={tracksCount === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg hover:scale-105 hover:bg-[#1ed760] transition-all duration-300 disabled:opacity-50"
        >
          {isCurrentPlaying ? (
            <Pause className="h-7 w-7" fill="currentColor" />
          ) : (
            <Play className="h-7 w-7 translate-x-[1px]" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Tracklist Table */}
      <section>
        <div className="rounded-lg bg-card/45 border border-neutral-800/60 p-4">
          <div className="grid grid-cols-[20px_4fr_60px] gap-4 border-b border-neutral-800/80 px-4 pb-3 text-xs uppercase tracking-wider text-neutral-400 font-bold">
            <div>#</div>
            <div>Título</div>
            <div className="text-right">Duración</div>
          </div>
          <div className="mt-2 flex flex-col">
            {album.tracks?.map((t: any, i: number) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                queue={album.tracks}
                showAlbum={false}
              />
            ))}
            {tracksCount === 0 && (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">No hay canciones registradas en este álbum.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
