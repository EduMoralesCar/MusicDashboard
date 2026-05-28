"use client"

import useSWR from "swr"
import { useAuth } from "./auth-provider"
import { useLiked } from "./liked-provider"
import { useNavigation } from "./navigation-provider"
import { Music4, Heart, User, Loader2, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"

// SWR playlist fetcher
const fetchPlaylists = (url: string) => fetch(url).then(res => res.json()).then(data => data.playlists as any[])

export function LibraryView() {
  const { user } = useAuth()
  const { liked } = useLiked()
  const { navigateTo, navigateToPlaylist, navigateToArtist } = useNavigation()

  // Fetch custom playlists from MongoDB Atlas
  const { data: playlists, isLoading } = useSWR(
    user ? "/api/playlists" : null,
    fetchPlaylists
  )

  // Curated list of major artists in followed library
  const followedArtists = [
    { id: "deezer_artist_4697334", name: "Bad Bunny", photo: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&q=80", followers: "78M" },
    { id: "deezer_artist_4493015", name: "KAROL G", photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", followers: "45M" },
    { id: "deezer_artist_10583404", name: "Feid", photo: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=200&q=80", followers: "24M" },
    { id: "deezer_artist_412", name: "Soda Stereo", photo: "https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=200&q=80", followers: "12M" },
    { id: "deezer_artist_78502", name: "Gian Marco", photo: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=200&q=80", followers: "3M" },
    { id: "deezer_artist_1251", name: "Juanes", photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", followers: "15M" },
  ]

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-neutral-400">
        <Loader2 className="h-10 w-10 animate-spin text-[#1db954]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 pb-16 text-white select-none">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Tu Biblioteca</h1>
        <p className="mt-1 text-sm text-neutral-400 font-medium">Administra tus listas de reproducción, canciones favoritas y artistas que sigues.</p>
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
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-none">Canciones que te gustan</h2>
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
                  {hasCover ? (
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {followedArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => navigateToArtist(artist.id, artist.name)}
              className="group cursor-pointer rounded-lg border border-neutral-900/60 bg-[#181818]/60 p-4 transition-all hover:bg-neutral-800/80 active:scale-[0.98]"
            >
              <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-full bg-neutral-900 shadow-md">
                <img
                  src={artist.photo}
                  alt={artist.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-white group-hover:text-[#1db954] transition-colors">{artist.name}</h3>
                <p className="mt-0.5 truncate text-xs text-neutral-400 font-semibold">
                  {artist.followers} de oyentes · Artista
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
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
