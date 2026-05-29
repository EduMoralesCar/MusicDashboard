"use client"

import { useState } from "react"
import { Home, Search, Library, Plus, Heart, Music2, Music4 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiked } from "./liked-provider"
import { useNavigation } from "./navigation-provider"
import { useAuth } from "./auth-provider"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog"

export type View = "home" | "search" | "library" | "liked" | "artist" | "album" | "playlist" | "lyrics" | "settings"

interface SidebarProps {
  view: View
  onViewChange: (v: View) => void
}

const fetchPlaylists = (url: string) => fetch(url).then(res => res.json()).then(data => data.playlists as any[])

export function Sidebar({ view, onViewChange }: SidebarProps) {
  const { user } = useAuth()
  const { liked } = useLiked()
  const { activeId, navigateTo, navigateToPlaylist, navigateToArtist } = useNavigation()
 
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Fetch playlists from MongoDB using SWR
  const { data: playlists, mutate: mutatePlaylists } = useSWR(
    user ? "/api/playlists" : null,
    fetchPlaylists
  )

  const navItems: { id: View; label: string; icon: any }[] = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "search", label: "Buscar", icon: Search },
    { id: "library", label: "Tu Biblioteca", icon: Library },
  ]

  const handleCreatePlaylist = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para crear playlists.")
      return
    }
    setIsCreateOpen(true)
  }
 
  const handleCreatePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName || !newPlaylistName.trim()) {
      toast.error("El nombre de la playlist no puede estar vacío.")
      return
    }
 
    setIsCreating(true)
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlaylistName.trim() }),
      })
 
      if (res.ok) {
        const data = await res.json()
        toast.success("¡Playlist creada con éxito!")
        // Refresh local cache
        mutatePlaylists(data.playlists, false)
        setIsCreateOpen(false)
        setNewPlaylistName("")
        // Find the newly created playlist to navigate to it
        const newPlaylist = data.playlists[data.playlists.length - 1]
        if (newPlaylist) {
          navigateToPlaylist(newPlaylist._id)
        }
      } else {
        toast.error("Error al crear la playlist.")
      }
    } catch (err) {
      toast.error("Error de conexión al crear la playlist.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
    <aside className="flex h-full w-64 shrink-0 flex-col gap-2 bg-[#000000] p-2 text-sidebar-foreground select-none">
      {/* Logo + main nav */}
      <div className="rounded-lg bg-[#121212] p-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1db954]">
            <Music2 className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">Eumora Music</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center gap-4 rounded-md px-3 py-2.5 text-sm font-bold transition-all duration-200",
                  active
                    ? "bg-[#282828] text-white"
                    : "text-neutral-400 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Library & Custom Playlists */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-[#121212]">
        <div className="flex items-center justify-between p-4 pb-2">
          <button
            onClick={() => onViewChange("library")}
            className="flex items-center gap-3 text-sm font-bold text-neutral-400 transition-colors hover:text-white"
          >
            <Library className="h-5 w-5" />
            Tu Biblioteca
          </button>
          <button
            aria-label="Crear Playlist"
            onClick={handleCreatePlaylist}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
          {/* Liked Songs Item */}
          <button
            onClick={() => onViewChange("liked")}
            className={cn(
              "mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-neutral-800/40",
              view === "liked" && "bg-neutral-800/30",
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-indigo-950 border border-indigo-500/20 shadow-md">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">Tus me gusta</div>
              <div className="truncate text-xs text-neutral-400 mt-0.5">
                Playlist · {liked.length} canción{liked.length === 1 ? "" : "s"}
              </div>
            </div>
          </button>

          {/* MongoDB Custom User Playlists */}
          {user && playlists && playlists.map((p) => {
            const active = view === "playlist" && activeId === p._id
            const hasCover = p.tracks && p.tracks[0] && p.tracks[0].artwork?.["150x150"]
            return (
              <button
                key={p._id}
                onClick={() => navigateToPlaylist(p._id)}
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-neutral-800/40",
                  active && "bg-neutral-800/30",
                )}
              >
                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 shadow-md text-[#1db954] overflow-hidden">
                  {p.artwork ? (
                    <img
                      src={p.artwork}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : hasCover ? (
                    <img
                      src={p.tracks[0].artwork?.["150x150"]}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Music4 className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className={cn("truncate text-sm font-bold", active ? "text-[#1db954]" : "text-white")}>
                    {p.name}
                  </div>
                  <div className="truncate text-xs text-neutral-400 mt-0.5">
                    Playlist · {p.tracks?.length || 0} canción{(p.tracks?.length || 0) === 1 ? "" : "s"}
                  </div>
                </div>
              </button>
            )
          })}

          {/* Followed Artists in Sidebar Library */}
          {user && user.followedArtists && user.followedArtists.map((artist) => {
            const active = view === "artist" && activeId === artist.id
            return (
              <button
                key={artist.id}
                onClick={() => navigateToArtist(artist.id, artist.name)}
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-neutral-800/40",
                  active && "bg-neutral-800/30",
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 shadow-md overflow-hidden text-[#1db954]">
                  {artist.photo ? (
                    <img
                      src={artist.photo}
                      alt={artist.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-neutral-500 bg-neutral-800 font-bold text-sm">
                      {artist.name[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-sm font-bold", active ? "text-[#1db954]" : "text-white")}>
                    {artist.name}
                  </div>
                  <div className="truncate text-xs text-neutral-400 mt-0.5">
                    Artista
                  </div>
                </div>
              </button>
            )
          })}

          {/* If no playlists created yet */}
          {user && (!playlists || playlists.length === 0) && (
            <div className="px-4 py-8 text-center text-xs text-neutral-500 flex flex-col gap-2">
              <p>No tienes playlists creadas.</p>
              <button
                onClick={handleCreatePlaylist}
                className="text-[#1db954] font-bold hover:underline"
              >
                Crear una ahora
              </button>
            </div>
          )}

          {!user && (
            <div className="px-4 py-8 text-center text-xs text-neutral-500">
              Inicia sesión para crear tus propias playlists.
            </div>
          )}
        </div>
      </div>
    </aside>
 
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogContent className="border-neutral-800 bg-[#181818] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Crear Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreatePlaylistSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="playlist-name-input" className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Nombre de la playlist
            </label>
            <input
              id="playlist-name-input"
              type="text"
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Mi playlist nº 1"
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#1db954] focus:outline-none focus:ring-1 focus:ring-[#1db954] transition-all"
            />
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-full border border-neutral-600 bg-transparent px-5 py-2 text-xs font-bold uppercase text-neutral-300 hover:text-white hover:border-white transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating || !newPlaylistName.trim()}
              className="rounded-full bg-[#1db954] text-black px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#1ed760] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              {isCreating ? "Creando..." : "Crear"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
