"use client"

import Image from "next/image"
import { Play, Pause, Heart, MoreHorizontal, Plus, Music4, PlusCircle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration, formatCount, type AudiusTrack } from "@/lib/audius"
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface TrackRowProps {
  track: AudiusTrack
  index: number
  queue: AudiusTrack[]
  showAlbum?: boolean
}

export function TrackRow({ track, index, queue, showAlbum = true }: TrackRowProps) {
  const { user } = useAuth()
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()
  const { isLiked, toggleLike } = useLiked()
  const { navigateToArtist, navigateToAlbum } = useNavigation()

  const liked = isLiked(track.id)
  const isCurrent = currentTrack?.id === track.id
  const showPause = isCurrent && isPlaying

  const cover = track.artwork?.["150x150"] || track.artwork?.["480x480"] || null

  // Fetch lists of custom playlists to display in the sub-menu
  const { data: playlists } = useSWR<any[]>(user ? "/api/playlists" : null, (url: string) =>
    fetch(url).then(res => res.json()).then(data => data.playlists)
  )

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue)
    }
  }

  const handleAddToPlaylist = async (playlistId: string, name: string) => {
    try {
      const res = await fetch("/api/playlists/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, track }),
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

  return (
    <div
      onClick={handlePlay}
      className={cn(
        "group grid grid-cols-[16px_1fr_auto] md:grid-cols-[16px_4fr_3fr_2fr_100px] items-center gap-2 md:gap-4 rounded-md px-2 md:px-4 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800/40 select-none cursor-pointer",
        isCurrent && "bg-neutral-800/20"
      )}
    >
      {/* Index / play button */}
      <div className="relative flex h-4 w-4 items-center justify-center">
        <span className={cn("tabular-nums group-hover:hidden", isCurrent && "hidden")}>
          {index + 1}
        </span>
        {isCurrent && (
          <span className="group-hover:hidden text-[#1db954]">
            {showPause ? <PlayingBars /> : <PlayingBarsStatic />}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePlay()
          }}
          aria-label={showPause ? "Pausa" : "Reproducir"}
          className="hidden text-white group-hover:flex"
        >
          {showPause ? <Pause className="h-4 w-4 text-[#1db954]" fill="currentColor" /> : <Play className="h-4 w-4 text-[#1db954]" fill="currentColor" />}
        </button>
      </div>

      {/* Title + artist */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-900 shadow-md">
          {cover && (
            <img
              src={cover}
              alt={track.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <div className={cn("truncate font-semibold", isCurrent ? "text-[#1db954]" : "text-white")}>
            {track.title}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (track.user?.id) {
                navigateToArtist(track.user.id, track.user.name)
              }
            }}
            className="truncate text-xs text-neutral-400 hover:text-[#1db954] hover:underline text-left cursor-pointer"
          >
            {track.user?.name}
          </button>
        </div>
      </div>

      {/* Genre / Album */}
      <div className="hidden truncate md:block text-neutral-400">
        {showAlbum ? (
          <span className="text-xs">{track.genre || "—"}</span>
        ) : ""}
      </div>

      {/* Popularity / Rank */}
      <div className="hidden text-xs tabular-nums md:block text-neutral-400">
        {track.play_count ? `${formatCount(track.play_count)} plays` : "—"}
      </div>

      {/* Like + dropdown + duration */}
      <div className="flex items-center justify-end gap-2 md:gap-3 text-right">
        {/* Heart icon */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleLike(track)
          }}
          aria-label={liked ? "Remove from liked songs" : "Add to liked songs"}
          className={cn(
            "md:opacity-0 transition-opacity hover:text-white md:group-hover:opacity-100 opacity-100 cursor-pointer",
            liked ? "text-[#1db954] opacity-100 hover:text-[#1db954]" : "text-neutral-400",
          )}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
        </button>

        {/* Plus circular icon button (dropdown playlist checklist) */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "md:opacity-0 transition-opacity hover:text-white md:group-hover:opacity-100 opacity-100 cursor-pointer text-neutral-400 hover:text-[#1db954]",
                  playlists?.some(p => p.tracks?.some((t: any) => t && t.id === track.id)) && "text-[#1db954] md:opacity-100 opacity-100"
                )}
                aria-label="Añadir a playlist"
              >
                <PlusCircle className="h-4.5 w-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-neutral-800 bg-[#181818] text-white">
              <div className="px-2 py-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">Añadir a...</div>
              
              {/* Liked Songs option */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLike(track)
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
              
              <div className="px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Mis Playlists</div>
              
              {playlists && playlists.map((p) => {
                const inPlaylist = p.tracks?.some((t: any) => t && t.id === track.id)
                return (
                  <DropdownMenuItem
                    key={p._id}
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (inPlaylist) {
                        await handleRemoveFromPlaylist(p._id, track.id, p.name)
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

        <span className="tabular-nums text-xs text-neutral-400">{formatDuration(track.duration)}</span>
      </div>
    </div>
  )
}

function PlayingBars() {
  return (
    <div className="flex h-3.5 items-end gap-[2px]">
      <span className="h-full w-[2px] animate-pulse bg-[#1db954]" style={{ animationDelay: "0ms" }} />
      <span className="h-2/3 w-[2px] animate-pulse bg-[#1db954]" style={{ animationDelay: "150ms" }} />
      <span className="h-full w-[2px] animate-pulse bg-[#1db954]" style={{ animationDelay: "300ms" }} />
    </div>
  )
}

function PlayingBarsStatic() {
  return (
    <div className="flex h-3.5 items-end gap-[2px]">
      <span className="h-full w-[2px] bg-[#1db954]" />
      <span className="h-2/3 w-[2px] bg-[#1db954]" />
      <span className="h-full w-[2px] bg-[#1db954]" />
    </div>
  )
}
