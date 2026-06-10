"use client"

import { useState } from "react"
import { Play, Pause, Disc, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlayer } from "./player-provider"
import { useNavigation } from "./navigation-provider"

export interface DeezerAlbum {
  id: string
  title: string
  cover: string
  artist: {
    id: string
    name: string
  }
}

interface AlbumCardProps {
  album: DeezerAlbum
}

export function AlbumCard({ album }: AlbumCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const { navigateToAlbum, navigateToArtist } = useNavigation()
  const [isLoadingTracks, setIsLoadingTracks] = useState(false)

  // Clean numeric ID for Deezer API call
  const numericId = album.id.replace("deezer_album_", "").replace("album_", "")

  // Check if this album is currently playing
  const isCurrentAlbumPlaying = currentTrack?.album?.id === album.id || currentTrack?.album?.id === `deezer_album_${numericId}`
  const showPause = isCurrentAlbumPlaying && isPlaying

  const handlePlayAlbum = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrentAlbumPlaying) {
      togglePlay()
      return
    }

    setIsLoadingTracks(true)
    try {
      const res = await fetch(`/api/deezer/album?id=${numericId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.album && data.album.tracks && data.album.tracks.length > 0) {
          playTrack(data.album.tracks[0], data.album.tracks)
        }
      }
    } catch (err) {
      console.error("❌ Error fetching album tracks for autoplay:", err)
    } finally {
      setIsLoadingTracks(false)
    }
  }

  const handleCardClick = () => {
    navigateToAlbum(album.id)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-lg border border-neutral-900/60 bg-[#181818]/60 p-4 transition-all hover:bg-neutral-800/80 active:scale-[0.99] select-none"
    >
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-neutral-900 shadow-md">
        {album.cover ? (
          <img
            src={album.cover}
            alt={album.title}
            className="h-full w-full object-cover shadow-md transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-800">
            <Disc className="h-12 w-12 text-neutral-600 animate-spin" />
          </div>
        )}
        
        {/* Play/Pause hover button */}
        <button
          onClick={handlePlayAlbum}
          disabled={isLoadingTracks}
          aria-label={showPause ? "Pausa" : "Reproducir álbum"}
          className={cn(
            "absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-[#1db954] text-black opacity-0 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#1ed760] active:scale-95 disabled:opacity-75 cursor-pointer",
            "group-hover:translate-y-0 group-hover:opacity-100",
            isCurrentAlbumPlaying && "translate-y-0 opacity-100 bg-[#1db954]",
          )}
        >
          {isLoadingTracks ? (
            <Loader2 className="h-5 w-5 animate-spin text-black" />
          ) : showPause ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
          )}
        </button>
      </div>

      <div className="min-w-0 flex flex-col gap-1">
        <h3 className={cn("truncate text-sm font-bold tracking-tight", isCurrentAlbumPlaying ? "text-[#1db954]" : "text-white")}>
          {album.title}
        </h3>
        
        {/* Clickable artist name */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (album.artist && album.artist.id) {
              navigateToArtist(album.artist.id, album.artist.name)
            }
          }}
          className="truncate text-left text-xs font-semibold text-neutral-400 hover:text-[#1db954] hover:underline cursor-pointer"
        >
          {album.artist?.name || "Unknown Artist"}
        </button>

        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
          Álbum
        </span>
      </div>
    </div>
  )
}
