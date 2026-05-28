"use client"

import useSWR, { mutate } from "swr"
import { Play, Pause, Trash2, ArrowLeft, Loader2, Music4, Clock } from "lucide-react"
import { usePlayer } from "./player-provider"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"
import type { AudiusTrack } from "@/lib/audius"
import { formatDuration } from "@/lib/audius"
import { cn } from "@/lib/utils"

interface PlaylistViewProps {
  playlistId: string
  onViewChange: (view: any) => void
}

// Fetcher for user playlists
const fetchPlaylists = (url: string) => fetch(url).then(res => res.json()).then(data => data.playlists as any[])

export function PlaylistView({ playlistId, onViewChange }: PlaylistViewProps) {
  const { user } = useAuth()
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()

  // Fetch the latest playlists from DB
  const { data: playlists, isLoading, error } = useSWR("/api/playlists", fetchPlaylists)

  // Find current playlist details
  const playlist = playlists?.find(p => p._id === playlistId)

  const handlePlayPlaylist = () => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return
    const isCurrentPlaylist = playlist.tracks.some((t: any) => t.id === currentTrack?.id)
    if (isCurrentPlaylist) {
      togglePlay()
    } else {
      playTrack(playlist.tracks[0], playlist.tracks)
    }
  }

  const handleDeletePlaylist = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta playlist? Esta acción no se puede deshacer.")) return

    try {
      const res = await fetch(`/api/playlists?id=${playlistId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast.success("Playlist eliminada correctamente.")
        // Mutate SWR cache immediately
        mutate("/api/playlists")
        onViewChange("home")
      } else {
        toast.error("Error al eliminar la playlist.")
      }
    } catch (err) {
      toast.error("Error de conexión al eliminar la playlist.")
    }
  }

  const handleRemoveTrack = async (trackId: string) => {
    try {
      const res = await fetch(`/api/playlists/track?playlistId=${playlistId}&trackId=${trackId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast.success("Canción eliminada de la playlist.")
        // Update local SWR cache immediately
        mutate("/api/playlists")
      } else {
        toast.error("Error al quitar la canción.")
      }
    } catch (err) {
      toast.error("Error de conexión al quitar la canción.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-neutral-400">
        <Loader2 className="h-10 w-10 animate-spin text-[#1db954]" />
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="text-neutral-400">La playlist no se pudo cargar o fue eliminada.</p>
        <button
          onClick={() => onViewChange("home")}
          className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#1ed760]"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Inicio
        </button>
      </div>
    )
  }

  const tracksCount = playlist.tracks?.length || 0
  const durationSumSeconds = playlist.tracks?.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || 0
  const durationMinutes = Math.floor(durationSumSeconds / 60)

  const isCurrentPlaying = playlist && currentTrack && isPlaying && playlist.tracks.some((t: any) => t.id === currentTrack.id)

  return (
    <div className="flex flex-col gap-8 pb-12 text-white">
      {/* Header Container */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        {/* Cover Icon */}
        <div className="flex aspect-square w-48 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-800 shadow-2xl md:w-56 text-[#1db954]">
          {playlist.tracks && playlist.tracks[0] && playlist.tracks[0].artwork?.["480x480"] ? (
            <img
              src={playlist.tracks[0].artwork?.["480x480"]}
              alt={playlist.name}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <Music4 className="h-24 w-24" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1db954]">
            Playlist Personalizada
          </span>
          <h1 className="text-4xl font-extrabold md:text-5xl tracking-tight leading-none text-white">
            {playlist.name}
          </h1>
          <p className="text-sm text-neutral-400">{playlist.description}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-300 font-semibold mt-2">
            <span className="font-bold text-white">{user?.username}</span>
            <span>·</span>
            <span>{tracksCount} canciones, {durationMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-6">
        <button
          onClick={handlePlayPlaylist}
          disabled={tracksCount === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg hover:scale-105 hover:bg-[#1ed760] transition-all duration-300 disabled:opacity-50"
        >
          {isCurrentPlaying ? (
            <Pause className="h-7 w-7" fill="currentColor" />
          ) : (
            <Play className="h-7 w-7 translate-x-[1px]" fill="currentColor" />
          )}
        </button>
        <button
          onClick={handleDeletePlaylist}
          className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 text-sm font-bold text-red-400 transition-colors"
        >
          <Trash2 className="h-4.5 w-4.5" />
          Eliminar Playlist
        </button>
      </div>

      {/* Tracks Table */}
      <section>
        <div className="rounded-lg bg-card/45 border border-neutral-800/60 p-4">
          <div className="grid grid-cols-[30px_4fr_60px] gap-4 border-b border-neutral-800/80 px-4 pb-3 text-xs uppercase tracking-wider text-neutral-400 font-bold">
            <div>#</div>
            <div>Título</div>
            <div className="text-right">Acciones</div>
          </div>
          <div className="mt-2 flex flex-col">
            {playlist.tracks?.map((t: any, i: number) => {
              const isCurrent = currentTrack?.id === t.id
              const isCurrentAndPlaying = isCurrent && isPlaying
              return (
                <div
                  key={t.id}
                  className={cn(
                    "grid grid-cols-[30px_4fr_60px] gap-4 items-center rounded-md px-4 py-2 hover:bg-neutral-800/40 transition-colors group",
                    isCurrent && "bg-neutral-800/20"
                  )}
                >
                  <div className="text-sm font-semibold text-neutral-500">
                    <button
                      onClick={() => (isCurrent ? togglePlay() : playTrack(t, playlist.tracks))}
                      className="text-neutral-400 hover:text-white"
                    >
                      {isCurrentAndPlaying ? (
                        <Pause className="h-4 w-4 text-[#1db954]" fill="currentColor" />
                      ) : isCurrent ? (
                        <Play className="h-4 w-4 text-[#1db954]" fill="currentColor" />
                      ) : (
                        <span className="group-hover:hidden">{i + 1}</span>
                      )}
                      {!isCurrent && (
                        <Play className="hidden group-hover:block h-4 w-4" fill="currentColor" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-900">
                      {t.artwork?.["150x150"] && (
                        <img
                          src={t.artwork["150x150"]}
                          alt={t.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={cn("truncate text-sm font-semibold", isCurrent ? "text-[#1db954]" : "text-white")}>
                        {t.title}
                      </div>
                      <div className="truncate text-xs text-neutral-400 mt-0.5">{t.user?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 text-right">
                    <span className="text-xs text-neutral-400 group-hover:hidden">
                      {formatDuration(t.duration)}
                    </span>
                    <button
                      onClick={() => handleRemoveTrack(t.id)}
                      className="hidden group-hover:block text-red-500/80 hover:text-red-400 p-1"
                      aria-label="Quitar de la playlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
            {tracksCount === 0 && (
              <div className="px-4 py-16 text-center text-sm text-neutral-400 flex flex-col items-center gap-3">
                <Music4 className="h-12 w-12 text-neutral-600" />
                <p className="font-bold">Esta playlist está vacía</p>
                <p className="text-neutral-500 max-w-xs mt-1">Busca canciones oficiales o navega por los géneros y añádelas con el botón de tres puntos.</p>
                <button
                  onClick={() => onViewChange("search")}
                  className="rounded-full bg-white px-5 py-2 text-xs font-bold text-black hover:scale-105 transition-transform mt-3"
                >
                  Buscar música ahora
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
