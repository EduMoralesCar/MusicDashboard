"use client"

import useSWR, { mutate } from "swr"
import { Play, Pause, Trash2, ArrowLeft, Loader2, Music4, Clock, Shuffle, Pencil, Camera } from "lucide-react"
import { usePlayer } from "./player-provider"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"
import type { AudiusTrack } from "@/lib/audius"
import { formatDuration } from "@/lib/audius"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog"

interface PlaylistViewProps {
  playlistId: string
  onViewChange: (view: any) => void
}

// Fetcher for user playlists
const fetchPlaylists = (url: string) => fetch(url).then(res => res.json()).then(data => data.playlists as any[])

export function PlaylistView({ playlistId, onViewChange }: PlaylistViewProps) {
  const { user } = useAuth()
  const { currentTrack, isPlaying, playTrack, togglePlay, shuffle, toggleShuffle } = usePlayer()

  // Fetch the latest playlists from DB
  const { data: playlists, isLoading, error } = useSWR("/api/playlists", fetchPlaylists)

  // Find current playlist details
  const playlist = playlists?.find(p => p._id === playlistId)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editArtwork, setEditArtwork] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenEdit = () => {
    if (!playlist) return
    setEditName(playlist.name)
    setEditDesc(playlist.description || "")
    setEditArtwork(playlist.artwork || "")
    setIsEditOpen(true)
  }

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. El límite es de 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditArtwork(reader.result as string)
    }
    reader.onerror = () => {
      toast.error("Error al leer el archivo.")
    }
    reader.readAsDataURL(file)
  }

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName || !editName.trim()) {
      toast.error("El nombre de la playlist es obligatorio.")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/playlists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId,
          name: editName.trim(),
          description: editDesc.trim(),
          artwork: editArtwork
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("¡Playlist actualizada correctamente!")
        mutate("/api/playlists", data.playlists, false)
        setIsEditOpen(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al actualizar la playlist.")
      }
    } catch (err) {
      toast.error("Error de conexión al servidor.")
    } finally {
      setIsSaving(false)
    }
  }

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
    <>
    <div className="flex flex-col gap-8 pb-12 text-white">
      {/* Header Container */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        {/* Cover Icon */}
        <div
          onClick={handleOpenEdit}
          className="group relative flex aspect-square w-48 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-800 shadow-2xl md:w-56 text-[#1db954]"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 z-10">
            <Camera className="h-8 w-8 text-white mb-1.5" />
            <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">Editar foto</span>
          </div>

          {playlist.artwork ? (
            <img
              src={playlist.artwork}
              alt={playlist.name}
              className="h-full w-full object-cover shadow-md transition-transform duration-300 group-hover:scale-103"
            />
          ) : playlist.tracks && playlist.tracks[0] && playlist.tracks[0].artwork?.["480x480"] ? (
            <img
              src={playlist.tracks[0].artwork?.["480x480"]}
              alt={playlist.name}
              className="h-full w-full object-cover shadow-md transition-transform duration-300 group-hover:scale-103"
            />
          ) : (
            <Music4 className="h-24 w-24 transition-transform duration-300 group-hover:scale-105" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1db954]">
            Playlist Personalizada
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold md:text-5xl tracking-tight leading-none text-white">
              {playlist.name}
            </h1>
            <button
              onClick={handleOpenEdit}
              className="rounded-full p-1.5 bg-neutral-800/60 border border-neutral-700 hover:border-white text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Editar nombre de playlist"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-neutral-400">{playlist.description || "Sin descripción"}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-300 font-semibold mt-2">
            <span className="font-bold text-white">{user?.username}</span>
            <span>·</span>
            <span>{tracksCount} canciones, {durationMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPlaylist}
          disabled={tracksCount === 0}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954] text-black shadow-lg hover:scale-105 hover:bg-[#1ed760] transition-all duration-300 disabled:opacity-50 cursor-pointer"
        >
          {isCurrentPlaying ? (
            <Pause className="h-7 w-7" fill="currentColor" />
          ) : (
            <Play className="h-7 w-7 translate-x-[1px]" fill="currentColor" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (tracksCount === 0) return
            toggleShuffle()
            if (!shuffle) {
              const randomTrack = playlist.tracks[Math.floor(Math.random() * tracksCount)]
              playTrack(randomTrack, playlist.tracks)
            } else {
              playTrack(playlist.tracks[0], playlist.tracks)
            }
          }}
          disabled={tracksCount === 0}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${
            shuffle
              ? "bg-[#1db954] border-[#1db954] text-black shadow-md animate-in fade-in"
              : "bg-transparent border-neutral-700 text-neutral-400 hover:text-white hover:border-white"
          }`}
          aria-label="Escuchar aleatorio"
        >
          <Shuffle className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={handleDeletePlaylist}
          className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 text-sm font-bold text-red-400 transition-colors cursor-pointer"
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

    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="border-neutral-800 bg-[#181818] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Editar detalles de la playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveDetails} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Left: Artwork editor */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-36 w-36 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-neutral-700 bg-neutral-800 transition-all hover:border-[#1db954] shadow-lg text-[#1db954]"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                  <Camera className="h-6 w-6 text-white mb-1" />
                  <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Cambiar foto</span>
                </div>
                
                {editArtwork ? (
                  <img
                    src={editArtwork}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : playlist.tracks && playlist.tracks[0] && playlist.tracks[0].artwork?.["480x480"] ? (
                  <img
                    src={playlist.tracks[0].artwork["480x480"]}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Music4 className="h-10 w-10" />
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleArtworkChange}
                accept="image/*"
                className="hidden"
              />
              <span className="text-[10px] text-neutral-500 text-center max-w-[130px] font-medium leading-normal">
                Límite de 2MB. Recomendado JPG o PNG.
              </span>
            </div>

            {/* Right: Text fields */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="playlist-edit-name" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Nombre
                </label>
                <input
                  id="playlist-edit-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nombre de la playlist"
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#1db954] focus:outline-none focus:ring-1 focus:ring-[#1db954] transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="playlist-edit-desc" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                  id="playlist-edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Añade una descripción opcional"
                  rows={3}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#1db954] focus:outline-none focus:ring-1 focus:ring-[#1db954] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-full border border-neutral-600 bg-transparent px-5 py-2 text-xs font-bold uppercase text-neutral-300 hover:text-white hover:border-white transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !editName.trim()}
              className="rounded-full bg-[#1db954] text-black px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#1ed760] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
