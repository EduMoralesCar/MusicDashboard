"use client"

import Image from "next/image"
import { Play, Pause, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration, formatCount, type AudiusTrack } from "@/lib/audius"
import { usePlayer } from "./player-provider"
import { useLiked } from "./liked-provider"

interface TrackRowProps {
  track: AudiusTrack
  index: number
  queue: AudiusTrack[]
  showAlbum?: boolean
}

export function TrackRow({ track, index, queue, showAlbum = true }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const { isLiked, toggleLike } = useLiked()
  const liked = isLiked(track.id)

  const isCurrent = currentTrack?.id === track.id
  const showPause = isCurrent && isPlaying

  const cover = track.artwork?.["150x150"] || track.artwork?.["480x480"] || null

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue)
    }
  }

  return (
    <div
      className={cn(
        "group grid grid-cols-[16px_4fr_3fr_2fr_60px] items-center gap-4 rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent",
        isCurrent && "text-primary",
      )}
    >
      {/* Index / play button */}
      <div className="relative flex h-4 w-4 items-center justify-center">
        <span className={cn("tabular-nums group-hover:hidden", isCurrent && "hidden")}>
          {isCurrent ? (
            <PlayingBars />
          ) : (
            index + 1
          )}
        </span>
        {isCurrent && !showPause && <span className="group-hover:hidden">{index + 1}</span>}
        {isCurrent && showPause && (
          <span className="group-hover:hidden">
            <PlayingBars />
          </span>
        )}
        <button
          onClick={handlePlay}
          aria-label={showPause ? "Pause" : "Play"}
          className="hidden text-foreground group-hover:flex"
        >
          {showPause ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
        </button>
      </div>

      {/* Title + artist */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
          {cover && (
            <Image
              src={cover || "/placeholder.svg"}
              alt={track.title}
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="min-w-0">
          <div className={cn("truncate font-medium", isCurrent ? "text-primary" : "text-foreground")}>
            {track.title}
          </div>
          <div className="truncate text-xs">{track.user.name}</div>
        </div>
      </div>

      {/* Album / genre */}
      <div className="hidden truncate md:block">{showAlbum ? track.genre || "—" : ""}</div>

      {/* Plays */}
      <div className="hidden text-xs tabular-nums md:block">{formatCount(track.play_count)} plays</div>

      {/* Like + duration */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleLike(track)
          }}
          aria-label={liked ? "Remove from liked songs" : "Add to liked songs"}
          className={cn(
            "opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100",
            liked && "text-primary opacity-100 hover:text-primary",
          )}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
        </button>
        <span className="tabular-nums">{formatDuration(track.duration)}</span>
      </div>
    </div>
  )
}

function PlayingBars() {
  return (
    <div className="flex h-3 items-end gap-[2px]">
      <span className="h-full w-[2px] animate-pulse bg-primary" style={{ animationDelay: "0ms" }} />
      <span className="h-2/3 w-[2px] animate-pulse bg-primary" style={{ animationDelay: "150ms" }} />
      <span className="h-full w-[2px] animate-pulse bg-primary" style={{ animationDelay: "300ms" }} />
    </div>
  )
}
