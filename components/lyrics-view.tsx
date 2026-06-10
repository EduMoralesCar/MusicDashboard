"use client"

import { useEffect, useRef, useMemo } from "react"
import { usePlayer } from "./player-provider"
import type { LyricLine } from "@/lib/lyrics"
import { Music4, Mic2, AlertCircle, Loader2, Tv } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { useNavigation } from "./navigation-provider"

export function LyricsView() {
  const { currentTrack, progress, seek, isPlaying, showVideo } = usePlayer()
  const { navigateTo } = useNavigation()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Fetch synced lyrics dynamically from LRCLIB API with automatic cache revalidation
  const { data, isLoading } = useSWR<{ isSynced: boolean; lyrics: LyricLine[] }>(
    currentTrack
      ? `/api/lyrics?track=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.user?.name || "")}`
      : null,
    (url: string) => fetch(url).then((res) => res.json())
  )

  const isSynced = data?.isSynced ?? true
  const lyrics = data?.lyrics ?? []

  // Find the index of the currently active line
  const activeIndex = useMemo(() => {
    if (!isSynced || lyrics.length === 0) return -1
    // Find the latest line where time <= progress
    let active = -1
    for (let i = 0; i < lyrics.length; i++) {
      if (progress >= lyrics[i].time) {
        active = i
      } else {
        break
      }
    }
    return active
  }, [lyrics, progress, isSynced])

  // Smoothly scroll the active lyric line to the center of the viewport
  useEffect(() => {
    if (isSynced && activeIndex >= 0 && lineRefs.current[activeIndex]) {
      lineRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [activeIndex, isSynced])

  // Generate a dynamic gradient background based on the artist name length
  const backgroundGradient = useMemo(() => {
    if (!currentTrack) return "from-neutral-900 to-black"
    const hash = (currentTrack.user?.name || "").length % 4
    if (hash === 0) return "from-[#3e0b1d] via-[#120308] to-[#000000]" // deep crimson
    if (hash === 1) return "from-[#082a17] via-[#020d07] to-[#000000]" // deep emerald
    if (hash === 2) return "from-[#081d2a] via-[#020a0d] to-[#000000]" // deep ocean blue
    return "from-[#22073e] via-[#0c0216] to-[#000000]" // deep purple
  }, [currentTrack])

  if (!currentTrack) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center text-neutral-400">
        <Mic2 className="h-16 w-16 text-neutral-600 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Letras Sincronizadas</h2>
        <p className="max-w-md text-sm text-neutral-500">
          Reproduce una canción comercial oficial de tus artistas favoritos y presiona el micrófono para ver la letra cantada al compás de la música.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center text-neutral-400">
        <Loader2 className="h-12 w-12 animate-spin text-[#1db954]" />
        <h2 className="text-2xl font-bold text-white">Sincronizando letras...</h2>
        <p className="max-w-md text-sm text-neutral-500">
          Estamos buscando las letras en vivo y sincronizándolas con el audio de la canción...
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col bg-gradient-to-b px-8 py-6 transition-all duration-1000 overflow-hidden",
        backgroundGradient
      )}
    >
      <div className="mx-auto w-full max-w-4xl h-full flex flex-col justify-between animate-in fade-in duration-300">
        {/* Album header info */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-900 shadow-lg">
              {currentTrack.artwork?.["150x150"] ? (
                <img
                  src={currentTrack.artwork["150x150"]}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover animate-in fade-in duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-600">
                  <Music4 className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#1db954]">
                Reproduciendo
              </span>
              <h1 className="text-xl font-bold text-white line-clamp-1">{currentTrack.title}</h1>
              <p className="text-sm font-semibold text-neutral-400 mt-0.5">
                {currentTrack.user?.name}
              </p>
            </div>
          </div>

          {showVideo && (
            <button
              onClick={() => navigateTo("video")}
              className="px-4 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all rounded-full border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <Tv className="h-3.5 w-3.5" />
              <span>Cambiar a video</span>
            </button>
          )}
        </div>

        {/* Scrollable lyrics area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pr-4 scrollbar-thin select-none py-6 min-h-0"
          style={{ maskImage: "linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)" }}
        >
          <div className="flex flex-col gap-6 py-20">
            {lyrics.map((line, idx) => {
              const isActive = idx === activeIndex
              const isPast = idx < activeIndex
              
              if (!isSynced) {
                return (
                  <div
                    key={idx}
                    className="w-full text-left text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight py-2 text-white/90 selection:bg-[#1db954]/30 selection:text-white"
                  >
                    {line.text}
                  </div>
                )
              }

              return (
                <button
                  key={idx}
                  ref={(el) => {
                    lineRefs.current[idx] = el
                  }}
                  onClick={() => seek(line.time)}
                  className={cn(
                    "w-full text-left text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight transition-all duration-300 py-1.5 focus:outline-none cursor-pointer origin-left hover:scale-[1.01] hover:text-white",
                    isActive
                      ? "text-[#1db954] scale-[1.03] drop-shadow-[0_0_15px_rgba(29,185,84,0.3)] opacity-100"
                      : isPast
                      ? "text-white/80 opacity-80"
                      : "text-white/30 opacity-40"
                  )}
                >
                  {line.text}
                </button>
              )
            })}

            {lyrics.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-neutral-500">
                <AlertCircle className="h-10 w-10 text-neutral-600" />
                <p>No se encontraron letras para esta canción.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sync hint */}
        <div className="mt-4 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase flex items-center justify-center gap-1.5 border-t border-white/5 pt-4 shrink-0">
          <Mic2 className="h-3.5 w-3.5 text-[#1db954]" />
          {isSynced
            ? "Haz clic en cualquier verso para saltar directamente a ese momento de la canción"
            : "Letras estáticas proporcionadas en vivo por LRCLIB"}
        </div>
      </div>
    </div>
  )
}
