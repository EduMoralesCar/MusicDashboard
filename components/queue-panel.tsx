"use client"

import Image from "next/image"
import { Play, X } from "lucide-react"
import { usePlayer } from "./player-provider"
import { useNavigation } from "./navigation-provider"
import { cn } from "@/lib/utils"

export function QueuePanel() {
  const { showQueue, setShowQueue } = useNavigation()
  const { currentTrack, queue, playTrack } = usePlayer()

  // Get index of currently playing song to identify upcoming list
  const currentIndex = currentTrack
    ? queue.findIndex((t) => t.id === currentTrack.id)
    : -1

  // Slice upcoming tracks from active queue
  const upcoming = currentIndex !== -1 ? queue.slice(currentIndex + 1) : []

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full overflow-hidden rounded-lg bg-card border border-neutral-900 shadow-2xl transition-all duration-300 ease-in-out shrink-0",
        showQueue ? "md:w-80 opacity-100" : "w-0 opacity-0 border-none pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-900 bg-neutral-950/30">
        <h2 className="font-bold text-sm text-white tracking-wide">Fila de reproducción</h2>
        <button
          onClick={() => setShowQueue(false)}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-neutral-800/50 rounded-full"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
        
        {/* Active song */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sonando ahora</h3>
          {currentTrack ? (
            <div className="flex items-center gap-3 p-2 rounded-md bg-neutral-800/20 border border-neutral-800/10">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                {(currentTrack.artwork?.["150x150"] ||
                  currentTrack.artwork?.["480x480"]) && (
                  <Image
                    src={
                      currentTrack.artwork?.["150x150"] ||
                      currentTrack.artwork?.["480x480"] ||
                      "/placeholder.svg"
                    }
                    alt={currentTrack.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-primary">{currentTrack.title}</div>
                <div className="truncate text-[11px] text-neutral-400">{currentTrack.user?.name}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 py-2 italic">No hay ninguna canción reproduciéndose</div>
          )}
        </div>

        {/* Upcoming songs queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Siguiente</h3>
            {upcoming.length > 0 && (
              <span className="text-[10px] text-neutral-500 font-medium">
                {upcoming.length} {upcoming.length === 1 ? "canción" : "canciones"}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {upcoming.length > 0 ? (
              upcoming.map((track, idx) => {
                const coverUrl =
                  track.artwork?.["150x150"] ||
                  track.artwork?.["480x480"] ||
                  null
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, queue)}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-neutral-800/30 cursor-pointer group transition-colors border border-transparent hover:border-neutral-800/20"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {coverUrl && (
                        <Image
                          src={coverUrl}
                          alt={track.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      )}
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-3.5 w-3.5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-white group-hover:text-primary transition-colors">
                        {track.title}
                      </div>
                      <div className="truncate text-[11px] text-neutral-400">{track.user?.name}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-xs text-neutral-500 py-6 text-center border border-dashed border-neutral-800/80 rounded-lg">
                La cola de reproducción está vacía
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
