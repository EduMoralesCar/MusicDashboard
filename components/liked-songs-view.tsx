"use client"

import { Heart, Play, Pause } from "lucide-react"
import { useLiked } from "./liked-provider"
import { usePlayer } from "./player-provider"
import { TrackRow } from "./track-row"
import { cn } from "@/lib/utils"

export function LikedSongsView() {
  const { liked } = useLiked()
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()

  const queueIsLiked =
    currentTrack && liked.some((t) => t.id === currentTrack.id) && liked.length > 0
  const showPause = queueIsLiked && isPlaying

  const handlePlayAll = () => {
    if (liked.length === 0) return
    if (queueIsLiked) {
      togglePlay()
      return
    }
    playTrack(liked[0], liked)
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Hero */}
      <header className="-mx-6 -mt-4 flex items-end gap-6 bg-gradient-to-b from-primary/40 via-primary/15 to-transparent px-6 pb-6 pt-10">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent shadow-2xl sm:h-52 sm:w-52">
          <Heart className="h-20 w-20 text-primary-foreground" fill="currentColor" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider">Playlist</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Liked Songs</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {liked.length === 0
              ? "The songs you like will appear here"
              : `${liked.length} song${liked.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </header>

      {/* Play all */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayAll}
          disabled={liked.length === 0}
          aria-label={showPause ? "Pause" : "Play all liked songs"}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform",
            liked.length === 0
              ? "cursor-not-allowed opacity-40"
              : "hover:scale-105",
          )}
        >
          {showPause ? (
            <Pause className="h-6 w-6" fill="currentColor" />
          ) : (
            <Play className="h-6 w-6 translate-x-[2px]" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Track list */}
      {liked.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-card/50 px-6 py-16 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold">Songs you like will appear here</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Save songs by tapping the heart icon next to any track. Your likes persist in this browser.
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-card/50 p-2">
          <div className="grid grid-cols-[16px_4fr_3fr_2fr_60px] gap-4 border-b border-border px-4 pb-2 text-xs uppercase tracking-wider text-muted-foreground">
            <div>#</div>
            <div>Title</div>
            <div className="hidden md:block">Genre</div>
            <div className="hidden md:block">Plays</div>
            <div className="text-right">Time</div>
          </div>
          <div className="mt-2 flex flex-col">
            {liked.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} queue={liked} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
