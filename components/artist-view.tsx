"use client"

import useSWR from "swr"
import { useState } from "react"
import { Play, Pause, Disc, ArrowLeft, Loader2, Award, Calendar, MoreHorizontal, Shuffle } from "lucide-react"
import { TrackRow } from "./track-row"
import { usePlayer } from "./player-provider"
import { useNavigation } from "./navigation-provider"
import { useAuth } from "./auth-provider"
import { toast } from "sonner"
import type { AudiusTrack } from "@/lib/audius"
import { SkeletonCard, SkeletonRow } from "./skeletons"

interface ArtistViewProps {
  artistId: string
  onViewChange: (view: any) => void
  onActiveIdChange: (id: string | null) => void
}

// Fetchers
const fetchDetails = (url: string) => fetch(url).then(res => res.json()).then(data => data.artist)
const fetchList = (url: string) => fetch(url).then(res => res.json()).then(data => data.data)

export function ArtistView({ artistId, onViewChange, onActiveIdChange }: ArtistViewProps) {
  const { user, refreshUser } = useAuth()
  const { currentTrack, isPlaying, playTrack, togglePlay, shuffle, toggleShuffle } = usePlayer()
  const { goBack } = useNavigation()

  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false)

  // Extract the numeric ID from deezer_artist_XXX
  const numericId = artistId.replace("deezer_artist_", "").replace("artist_", "")

  // Fetch artist details
  const { data: artist, error: errorDetails, isLoading: loadingDetails } = useSWR(
    `/api/deezer/artist?id=${numericId}&type=details`,
    fetchDetails
  )

  // Fetch top tracks
  const { data: topTracks, isLoading: loadingTracks } = useSWR<AudiusTrack[]>(
    `/api/deezer/artist?id=${numericId}&type=top`,
    fetchList
  )

  // Fetch albums
  const { data: albums, isLoading: loadingAlbums } = useSWR<any[]>(
    `/api/deezer/artist?id=${numericId}&type=albums`,
    fetchList
  )

  const handlePlayArtist = () => {
    if (!topTracks || topTracks.length === 0) return
    const isCurrentArtist = topTracks.some(t => t.id === currentTrack?.id)
    if (isCurrentArtist) {
      togglePlay()
    } else {
      playTrack(topTracks[0], topTracks.slice(0, 20))
    }
  }

  const isCurrentPlaying = topTracks && currentTrack && isPlaying && topTracks.some(t => t.id === currentTrack.id)

  if (loadingDetails) {
    return (
      <div className="flex h-96 items-center justify-center text-neutral-400">
        <Loader2 className="h-10 w-10 animate-spin text-[#1db954]" />
      </div>
    )
  }

  if (errorDetails || !artist) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="text-neutral-400">Ocurrió un error al cargar el perfil del artista.</p>
        <button
          onClick={() => onViewChange("search")}
          className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#1ed760]"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a buscar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-12 text-white">
      {/* Dynamic Header Banner */}
      <div
        className="relative -mx-6 -mt-6 flex h-[350px] flex-col justify-end p-8 bg-cover bg-center"
        style={{ backgroundImage: `url(${artist.picture})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
        
        <button
          onClick={goBack}
          className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 transition-all border border-neutral-800 text-white"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#1db954]" fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#1db954]">
              Artista Verificado
            </span>
          </div>
          <h1 className="text-5xl font-extrabold md:text-7xl tracking-tight leading-none drop-shadow-2xl">
            {artist.name}
          </h1>
          <p className="text-sm font-semibold text-neutral-300 mt-2 drop-shadow-md">
            {artist.followers ? `${artist.followers.toLocaleString()} oyentes mensuales` : "Oyente mensual"}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayArtist}
          disabled={!topTracks || topTracks.length === 0}
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
            if (!topTracks || topTracks.length === 0) return
            toggleShuffle()
            if (!shuffle) {
              const randomTrack = topTracks[Math.floor(Math.random() * topTracks.length)]
              playTrack(randomTrack, topTracks.slice(0, 20))
            } else {
              playTrack(topTracks[0], topTracks.slice(0, 20))
            }
          }}
          disabled={!topTracks || topTracks.length === 0}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${
            shuffle
              ? "bg-[#1db954] border-[#1db954] text-black shadow-md animate-in fade-in"
              : "bg-transparent border-neutral-700 text-neutral-400 hover:text-white hover:border-white"
          }`}
          aria-label="Escuchar aleatorio"
        >
          <Shuffle className="h-4.5 w-4.5" />
        </button>

        {user && (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault()
              if (isUpdatingFollow) return
              setIsUpdatingFollow(true)
              const isFollowed = user.followedArtists?.some((a: any) => a.id === artistId) || false
              try {
                const res = await fetch("/api/auth/follow-artist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    artistId,
                    name: artist.name,
                    photo: artist.picture || "",
                    action: isFollowed ? "unfollow" : "follow",
                  }),
                })

                if (res.ok) {
                  await refreshUser()
                  toast.success(isFollowed ? `Dejaste de seguir a ${artist.name}.` : `¡Ahora sigues a ${artist.name}!`)
                } else {
                  const data = await res.json()
                  toast.error(data.error || "Error al actualizar la biblioteca.")
                }
              } catch (err) {
                toast.error("Error de conexión al servidor.")
              } finally {
                setIsUpdatingFollow(false)
              }
            }}
            disabled={isUpdatingFollow}
            className={`rounded-full border px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${
              user.followedArtists?.some((a: any) => a.id === artistId)
                ? "bg-transparent text-white border-neutral-500 hover:border-white"
                : "bg-white text-black border-white hover:bg-neutral-100"
            }`}
          >
            {isUpdatingFollow ? (
              <div className="h-4 w-12 flex items-center justify-center">
                <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              </div>
            ) : user.followedArtists?.some((a: any) => a.id === artistId) ? (
              "Siguiendo"
            ) : (
              "Seguir"
            )}
          </button>
        )}

        {user && (
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Más opciones"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Top Tracks */}
      <section>
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">Éxitos y Canciones Populares</h2>
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-[#181818]/30 p-2">
          {loadingTracks
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : topTracks?.slice(0, 20).map((t, i) => (
                <TrackRow key={t.id} track={t} index={i} queue={topTracks.slice(0, 20)} showAlbum={true} />
              ))}
          {!loadingTracks && (!topTracks || topTracks.length === 0) && (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">No hay canciones oficiales disponibles.</p>
          )}
        </div>
      </section>

      {/* Albums Grid */}
      <section>
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">Álbumes</h2>
        {loadingAlbums ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : albums && albums.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => {
                  onActiveIdChange(album.id)
                  onViewChange("album")
                }}
                className="group flex cursor-pointer flex-col gap-3 rounded-lg border border-neutral-900 bg-[#181818]/60 p-4 transition-all hover:bg-neutral-800/80 active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-900 shadow-xl transition-transform duration-300 group-hover:scale-103">
                  {album.cover && (
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute right-3 bottom-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-[#1db954] text-black opacity-0 shadow-2xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 active:scale-95">
                    <Play className="h-5 w-5 fill-current translate-x-[1px]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">{album.title}</div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                    <Disc className="h-3.5 w-3.5" />
                    <span>Álbum</span>
                    {album.release_date && (
                      <>
                        <span>·</span>
                        <span>{new Date(album.release_date).getFullYear()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No hay álbumes oficiales registrados.</p>
        )}
      </section>
    </div>
  )
}
