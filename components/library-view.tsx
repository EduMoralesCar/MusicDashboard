"use client"

import { useState } from "react"
import useSWR from "swr"
import { useAuth } from "./auth-provider"
import { useLiked } from "./liked-provider"
import { useNavigation } from "./navigation-provider"
import { Music4, Heart, User, Loader2, Music2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog"

// SWR playlist fetcher
const fetchPlaylists = (url: string) => fetch(url).then(res => res.json()).then(data => data.playlists as any[])

export function LibraryView() {
  const { user } = useAuth()
  const { liked } = useLiked()
  const { navigateTo, navigateToPlaylist, navigateToArtist } = useNavigation()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Fetch custom playlists from MongoDB Atlas
  const { data: playlists, isLoading, mutate: mutatePlaylists } = useSWR(
    user ? "/api/playlists" : null,
    fetchPlaylists
  )

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
        // Navigate to the newly created playlist
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

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-neutral-400">
        <Loader2 className="h-10 w-10 animate-spin text-[#1db954]" />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-10 pb-16 text-white select-none">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Tu Biblioteca</h1>
            <p className="mt-1 text-sm text-neutral-400 font-medium">Administra tus listas de reproducción, canciones favoritas y artistas que sigues.</p>
          </div>
          {/* Create playlist button for mobile & desktop convenience */}
          <button
            onClick={handleCreatePlaylist}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-all active:scale-95 cursor-pointer border border-white/5 shadow-md shrink-0 ml-4 hover:border-neutral-600"
            title="Crear Playlist"
          >
            <Plus className="h-5 w-5" />
          </button>
        </header>

        {/* Grid containing Liked Songs featured card and Custom Playlists */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Playlists y Colecciones</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            
            {/* Liked Songs Featured Big Card */}
            <div
              onClick={() => navigateTo("liked")}
              className="group relative col-span-2 cursor-pointer rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-900 to-indigo-950 p-6 border border-indigo-500/20 shadow-xl transition-all duration-300 hover:shadow-indigo-500/5 active:scale-[0.99] flex flex-col justify-end min-h-[190px]"
            >
              <div className="absolute top-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-indigo-700 shadow-md group-hover:scale-105 transition-transform">
                <Heart className="h-7 w-7 text-indigo-600" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">Tus me gusta</h2>
                <p className="mt-3 text-sm font-semibold text-indigo-200">
                  {liked.length} canción{liked.length === 1 ? "" : "s"} favorita{liked.length === 1 ? "" : "s"} guardada{liked.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* User-created MongoDB custom playlists */}
            {user && playlists && playlists.map((p) => {
              const hasCover = p.tracks && p.tracks[0] && p.tracks[0].artwork?.["150x150"]
              const tracksCount = p.tracks?.length || 0
              
              return (
                <div
                  key={p._id}
                  onClick={() => navigateToPlaylist(p._id)}
                  className="group cursor-pointer rounded-lg border border-neutral-900 bg-[#181818]/60 p-4 transition-all hover:bg-neutral-800/80 active:scale-[0.98]"
                >
                  <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 shadow-md text-[#1db954] flex items-center justify-center">
                    {p.artwork ? (
                      <img
                        src={p.artwork}
                        alt={p.name}
                        className="h-full w-full object-cover shadow-md transition-transform duration-300 group-hover:scale-103"
                      />
                    ) : hasCover ? (
                      <img
                        src={p.tracks[0].artwork["150x150"]}
                        alt={p.name}
                        className="h-full w-full object-cover shadow-md transition-transform duration-300 group-hover:scale-103"
                      />
                    ) : (
                      <Music4 className="h-14 w-14 transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute right-3 bottom-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-[#1db954] text-black opacity-0 shadow-2xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 active:scale-95">
                      <PlayButtonIcon />
                    </div>
                  </div>
                  <h3 className="truncate text-sm font-bold text-white group-hover:text-[#1db954] transition-colors">{p.name}</h3>
                  <p className="mt-1 truncate text-xs text-neutral-400 font-semibold">
                    Playlist · {tracksCount} canción{tracksCount === 1 ? "" : "s"}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Followed/Featured Artists Section */}
        <section className="flex flex-col gap-4 mt-4">
          <h2 className="text-2xl font-bold tracking-tight">Artistas que sigues</h2>
          
          {user && user.followedArtists && user.followedArtists.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {user.followedArtists.map((artist: any) => (
                <div
                  key={artist.id}
                  onClick={() => navigateToArtist(artist.id, artist.name)}
                  className="group cursor-pointer rounded-lg border border-neutral-900/60 bg-[#181818]/60 p-4 transition-all hover:bg-neutral-800/80 active:scale-[0.98]"
                >
                  <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-full bg-neutral-900 shadow-md">
                    <img
                      src={artist.photo || "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&q=80"}
                      alt={artist.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white group-hover:text-[#1db954] transition-colors">{artist.name}</h3>
                    <p className="mt-0.5 truncate text-xs text-neutral-400 font-semibold">
                      Artista
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-[#181818]/30 px-6 py-12 text-center shadow-lg">
              <User className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">Tu biblioteca de artistas está vacía</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                Busca tus artistas favoritos y haz clic en el botón de "Seguir" para agregarlos a tu biblioteca personalizada.
              </p>
              <button
                onClick={() => navigateTo("search")}
                className="rounded-full bg-white text-black px-6 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Ir a Buscar Artistas
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Create Playlist Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-neutral-800 bg-[#181818] text-white">
          <DialogHeader>
            <DialogTitle>Crear lista de reproducción</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-semibold text-neutral-400">
                Nombre de la lista
              </label>
              <input
                id="name"
                type="text"
                placeholder="Mi lista de reproducción espectacular"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2.5 text-sm text-white outline-none focus:border-[#1db954]"
                autoFocus
              />
            </div>
            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full bg-transparent px-5 py-2 text-xs font-bold text-white hover:underline cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-full bg-[#1db954] px-5 py-2 text-xs font-bold text-black hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
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

function PlayButtonIcon() {
  return (
    <svg
      role="img"
      height="18"
      width="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="translate-x-[1px]"
    >
      <path d="M7.05 3.606l13.49 7.79a.75.75 0 010 1.298L7.05 20.484a.75.75 0 01-1.125-.65V4.256a.75.75 0 011.125-.65z"></path>
    </svg>
  )
}
