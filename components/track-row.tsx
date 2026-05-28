"use client"

import Image from "next/image"
import { Play, Pause, Heart, MoreHorizontal, Plus, Music4 } from "lucide-react"
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
  const { data: playlists } = useSWR<any[]>(user ? "/api/playlists" : null, (url) =>
    fetch(url).then(res => res.json()).then(data => data.playlists)
  )

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      playTrack(track, queue)
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const res = await fetch("/api/playlists/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, track }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Añadida a la playlist.")
        // Refresh local cache for all playlists
        mutate("/api/playlists")
      } else {
        toast.error(data.error || "Error al añadir la canción.")
      }
    } catch (err) {
      toast.error("Error de conexión al servidor.")
    }
  }

  return (
    <div
      className={cn(
        "group grid grid-cols-[16px_4fr_3fr_2fr_80px] items-center gap-4 rounded-md px-4 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800/40 select-none",
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
          onClick={handlePlay}
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
      <div className="flex items-center justify-end gap-3 text-right">
        {/* Heart icon */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleLike(track)
          }}
          aria-label={liked ? "Remove from liked songs" : "Add to liked songs"}
          className={cn(
            "opacity-0 transition-opacity hover:text-white group-hover:opacity-100",
            liked && "text-[#1db954] opacity-100 hover:text-[#1db954]",
          )}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
        </button>

        {/* Dropdown Menu (Add to Playlist) */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="opacity-0 transition-opacity text-neutral-400 hover:text-white group-hover:opacity-100 cursor-pointer"
                aria-label="Más acciones"
              >
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-neutral-800 bg-[#181818] text-white">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer">
                  <Plus className="h-4 w-4 text-[#1db954]" />
                  <span>Añadir a playlist</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48 border-neutral-800 bg-[#242424] text-white">
                  {playlists && playlists.map((p) => (
                    <DropdownMenuItem
                      key={p._id}
                      onClick={() => handleAddToPlaylist(p._id)}
                      className="flex items-center gap-2 hover:bg-neutral-800 cursor-pointer text-xs"
                    >
                      <Music4 className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="truncate">{p.name}</span>
                    </DropdownMenuItem>
                  ))}
                  {playlists && playlists.length === 0 && (
                    <DropdownMenuItem disabled className="text-[11px] text-neutral-500 py-2 text-center">
                      No tienes playlists.
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
