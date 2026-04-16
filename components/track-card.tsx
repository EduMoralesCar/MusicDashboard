"use client"

import Image from "next/image"
import { Play, Pause, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AudiusTrack } from "@/lib/audius"
import { usePlayer } from "./player-provider"

interface TrackCardProps {
  track: AudiusTrack
  queue: AudiusTrack[]
}

export function TrackCard({ track, queue }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const isCurrent = currentTrack?.id === track.id
  const showPause = isCurrent && isPlaying

  const cover = track.artwork?.["480x480"] || track.artwork?.["150x150"] || null

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCurrent) togglePlay()
    else playTrack(track, queue)
  }

  return (
    <div className="group relative cursor-pointer rounded-lg bg-card p-4 transition-colors hover:bg-accent">
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-muted shadow-lg">
        {cover ? (
          <Image
            src={cover || "/placeholder.svg"}
            alt={track.title}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Music2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <button
          onClick={handlePlay}
          aria-label={showPause ? "Pause" : "Play"}
          className={cn(
            "absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition-all hover:scale-105",
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
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-card-foreground">{track.title}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{track.user.name}</p>
      </div>
    </div>
  )
}
