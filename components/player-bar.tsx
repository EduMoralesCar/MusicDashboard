"use client"

import Image from "next/image"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Mic2,
  ListMusic,
  Laptop2,
  Maximize2,
} from "lucide-react"
import { usePlayer } from "./player-provider"
import { useLiked } from "./liked-provider"
import { formatDuration } from "@/lib/audius"
import { cn } from "@/lib/utils"

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer()

  const { isLiked, toggleLike } = useLiked()
  const liked = currentTrack ? isLiked(currentTrack.id) : false
  const cover =
    currentTrack?.artwork?.["480x480"] ||
    currentTrack?.artwork?.["150x150"] ||
    currentTrack?.artwork?.["1000x1000"] ||
    null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <footer className="flex h-20 w-full items-center gap-4 border-t border-border bg-card px-4 text-card-foreground">
      {/* Left: track info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {currentTrack ? (
          <>
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {cover && (
                <Image
                  src={cover || "/placeholder.svg"}
                  alt={currentTrack.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{currentTrack.title}</div>
              <div className="truncate text-xs text-muted-foreground">{currentTrack.user.name}</div>
            </div>
            <button
              onClick={() => currentTrack && toggleLike(currentTrack)}
              aria-label={liked ? "Remove from liked songs" : "Add to liked songs"}
              className={cn(
                "ml-2 shrink-0 transition-colors",
                liked ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-14 w-14 rounded-md bg-muted" />
            <div>Select a track to play</div>
          </div>
        )}
      </div>

      {/* Center: controls */}
      <div className="flex max-w-xl flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button
            aria-label="Shuffle"
            onClick={toggleShuffle}
            className={cn(
              "transition-colors",
              shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            aria-label="Previous"
            onClick={previous}
            disabled={!currentTrack}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <SkipBack className="h-5 w-5" fill="currentColor" />
          </button>
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
            disabled={!currentTrack}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 disabled:opacity-40"
          >
            {isLoading ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" />
            )}
          </button>
          <button
            aria-label="Next"
            onClick={next}
            disabled={!currentTrack}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <SkipForward className="h-5 w-5" fill="currentColor" />
          </button>
          <button
            aria-label="Repeat"
            onClick={cycleRepeat}
            className={cn(
              "transition-colors",
              repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex w-full items-center gap-2">
          <span className="w-10 text-right text-[10px] tabular-nums text-muted-foreground">
            {formatDuration(progress)}
          </span>
          <ProgressSlider value={pct} onChange={(p) => seek((p / 100) * duration)} disabled={!currentTrack} />
          <span className="w-10 text-[10px] tabular-nums text-muted-foreground">
            {formatDuration(duration || currentTrack?.duration || 0)}
          </span>
        </div>
      </div>

      {/* Right: volume & misc */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <button
          aria-label="Lyrics"
          className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
        >
          <Mic2 className="h-4 w-4" />
        </button>
        <button
          aria-label="Queue"
          className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
        >
          <ListMusic className="h-4 w-4" />
        </button>
        <button
          aria-label="Devices"
          className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
        >
          <Laptop2 className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <VolumeSlider value={isMuted ? 0 : volume * 100} onChange={(v) => setVolume(v / 100)} />
        </div>
        <button
          aria-label="Fullscreen"
          className="hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </footer>
  )
}

function ProgressSlider({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="group relative flex h-4 flex-1 items-center">
      <div className="absolute inset-x-0 h-1 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-foreground group-hover:bg-primary"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground opacity-0 group-hover:opacity-100"
          style={{ left: `${value}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        aria-label="Seek"
      />
    </div>
  )
}

function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="group relative flex h-4 w-24 items-center">
      <div className="absolute inset-x-0 h-1 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-foreground group-hover:bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Volume"
      />
    </div>
  )
}
