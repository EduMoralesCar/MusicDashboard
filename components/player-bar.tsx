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
  Tv,
  PlusCircle,
  Check,
  Music4,
} from "lucide-react"
import { usePlayer } from "./player-provider"
import { useLiked } from "./liked-provider"
import { useNavigation } from "./navigation-provider"
import { useAuth } from "./auth-provider"
import useSWR, { mutate } from "swr"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
    showVideo,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleVideo,
  } = usePlayer()

  const { view, navigateTo, goBack, showQueue, setShowQueue, isFullscreen, setIsFullscreen } = useNavigation()
  const { isLiked, toggleLike } = useLiked()
  const liked = currentTrack ? isLiked(currentTrack.id) : false
  const cover =
    currentTrack?.artwork?.["480x480"] ||
    currentTrack?.artwork?.["150x150"] ||
    currentTrack?.artwork?.["1000x1000"] ||
    null

  const { user } = useAuth()

  // Fetch playlists from MongoDB using SWR
  const { data: playlists } = useSWR<any[]>(
    user ? "/api/playlists" : null,
    (url: string) => fetch(url).then(res => res.json()).then(data => data.playlists)
  )

  const handleAddToPlaylist = async (playlistId: string, name: string) => {
    if (!currentTrack) return
    try {
      const res = await fetch("/api/playlists/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, track: currentTrack }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`Añadida a ${name}`)
        // Refresh local cache for all playlists
        mutate("/api/playlists")
      } else {
        toast.error(data.error || "Error al añadir la canción.")
      }
    } catch (err) {
      toast.error("Error de conexión al servidor.")
    }
  }

  const handleRemoveFromPlaylist = async (playlistId: string, trackId: string, name: string) => {
    try {
      const res = await fetch(`/api/playlists/track?playlistId=${playlistId}&trackId=${trackId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast.success(`Eliminada de ${name}`)
        // Refresh local cache for all playlists
        mutate("/api/playlists")
      } else {
        toast.error("Error al quitar la canción.")
      }
    } catch (err) {
      toast.error("Error de conexión al servidor.")
    }
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <footer className="relative flex h-20 w-full items-center gap-4 border-t border-border bg-card px-4 text-card-foreground">
      {/* 2px Progress Bar at the top of the player bar for mobile/desktop visual feedback */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-neutral-800">
        <div 
          className="h-full bg-primary transition-all duration-100" 
          style={{ width: `${pct}%` }}
        />
      </div>
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
                liked ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
            </button>

            {/* Plus circular icon button (dropdown playlist checklist) */}
            {user && currentTrack ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                       "ml-1 shrink-0 transition-colors cursor-pointer text-muted-foreground hover:text-foreground",
                       playlists?.some(p => p.tracks?.some((t: any) => t && t.id === currentTrack.id)) && "text-primary"
                    )}
                    aria-label="Añadir a playlist"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 border-neutral-800 bg-[#181818] text-white">
                  <div className="px-2 py-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">Añadir a...</div>
                  
                  {/* Liked Songs option */}
                  <DropdownMenuItem
                    onClick={() => {
                      toggleLike(currentTrack)
                    }}
                    className="flex items-center justify-between hover:bg-neutral-800 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className={cn("h-3.5 w-3.5", liked ? "text-[#1db954]" : "text-neutral-400")} fill={liked ? "currentColor" : "none"} />
                      <span>Tus me gusta</span>
                    </div>
                    {liked && <Check className="h-3.5 w-3.5 text-[#1db954]" />}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-neutral-800/80" />
                  
                  <div className="px-2 py-1 text-[10px] font-bold text-[#1db954] uppercase tracking-wider">Mis Playlists</div>
                  
                  {playlists && playlists.map((p) => {
                    const inPlaylist = p.tracks?.some((t: any) => t && t.id === currentTrack.id)
                    return (
                      <DropdownMenuItem
                        key={p._id}
                        onClick={async () => {
                          if (inPlaylist) {
                            await handleRemoveFromPlaylist(p._id, currentTrack.id, p.name)
                          } else {
                            await handleAddToPlaylist(p._id, p.name)
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between hover:bg-neutral-800 cursor-pointer text-xs",
                          inPlaylist && "text-[#1db954]"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Music4 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{p.name}</span>
                        </div>
                        {inPlaylist && <Check className="h-3.5 w-3.5 text-[#1db954]" />}
                      </DropdownMenuItem>
                    )
                  })}

                  {playlists && playlists.length === 0 && (
                    <div className="px-2 py-2 text-[11px] text-neutral-500 text-center">
                      No tienes playlists
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </>
        ) : (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-14 w-14 rounded-md bg-muted" />
            <div>Select a track to play</div>
          </div>
        )}
      </div>

      {/* Center: controls (desktop only) */}
      <div className="hidden md:flex max-w-xl flex-1 flex-col items-center gap-1">
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

      {/* Right: volume & misc (desktop only) */}
      <div className="hidden md:flex min-w-0 flex-1 items-center justify-end gap-3">
        <button
          onClick={() => {
            if (view === "lyrics") {
              goBack()
            } else {
              navigateTo("lyrics")
            }
          }}
          disabled={!currentTrack}
          aria-label="Letras"
          className={cn(
            "text-muted-foreground transition-colors hover:text-foreground inline-flex disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
            view === "lyrics" ? "text-primary hover:text-[#1ed760]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Mic2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowQueue(!showQueue)}
          aria-label="Queue"
          className={cn(
            "hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex",
            showQueue ? "text-primary hover:text-[#1ed760]" : "text-muted-foreground hover:text-foreground"
          )}
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
          onClick={toggleVideo}
          disabled={!currentTrack}
          aria-label="Toggle Video Clip"
          className={cn(
            "hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex",
            showVideo ? "text-primary hover:text-[#1ed760]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Tv className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          disabled={!currentTrack || (view !== "lyrics" && view !== "video")}
          aria-label="Fullscreen"
          className={cn(
            "hidden text-muted-foreground transition-colors hover:text-foreground md:inline-flex disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
            isFullscreen ? "text-primary hover:text-[#1ed760]" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile-only Play/Pause and Like controls (shown only on screens < 768px) */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => currentTrack && toggleLike(currentTrack)}
          aria-label={liked ? "Quitar de tus me gusta" : "Añadir a tus me gusta"}
          className={cn(
            "transition-colors cursor-pointer p-1.5 hover:bg-neutral-800/40 rounded-full",
            liked ? "text-primary" : "text-neutral-400"
          )}
        >
          <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
        </button>
        <button
          onClick={togglePlay}
          disabled={!currentTrack}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black active:scale-95 transition-all cursor-pointer shadow-md"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
          )}
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
