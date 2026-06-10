"use client"

import Image from "next/image"
import { Play, Pause, Music2, Disc } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AudiusTrack } from "@/lib/audius"
import { usePlayer } from "./player-provider"
import { useNavigation } from "./navigation-provider"

interface TrackCardProps {
  track: any // using any to support album metadata comfortably
  queue: AudiusTrack[]
}

export function TrackCard({ track, queue }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const { navigateToArtist, navigateToAlbum } = useNavigation()

  const isCurrent = currentTrack?.id === track.id
  const showPause = isCurrent && isPlaying

  const cover = track.artwork?.["480x480"] || track.artwork?.["150x150"] || null

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrent) togglePlay()
    else playTrack(track, queue)
  }

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-lg border border-neutral-900/60 bg-[#181818]/60 p-4 transition-all hover:bg-neutral-800/80 active:scale-[0.99] select-none"
    >
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-neutral-900 shadow-md">
        {cover ? (
          <img
            src={cover}
            alt={track.title}
            className="h-full w-full object-cover shadow-md transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-800">
            <Music2 className="h-12 w-12 text-neutral-600" />
          </div>
        )}
        <button
          onClick={handlePlay}
          aria-label={showPause ? "Pausa" : "Reproducir"}
          className={cn(
            "absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-[#1db954] text-black opacity-0 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#1ed760] active:scale-95",
            "group-hover:translate-y-0 group-hover:opacity-100",
            isCurrent && "translate-y-0 opacity-100 bg-[#1db954]",
          )}
        >
          {showPause ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
          )}
        </button>
      </div>
      <div className="min-w-0 flex flex-col gap-1">
        <h3 className={cn("truncate text-sm font-bold tracking-tight", isCurrent ? "text-[#1db954]" : "text-white")}>
          {track.title}
        </h3>
        
        {/* Clickable artist name */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (track.user && track.user.id) {
              navigateToArtist(track.user.id, track.user.name)
            }
          }}
          className="truncate text-left text-xs font-semibold text-neutral-400 hover:text-[#1db954] hover:underline cursor-pointer"
        >
          {track.user?.name}
        </button>

        {track.album?.title && (
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-semibold mt-0.5">
            <Disc className="h-3 w-3 shrink-0" />
            <span className="truncate">{track.album.title}</span>
          </div>
        )}
      </div>
    </div>
  )
}
