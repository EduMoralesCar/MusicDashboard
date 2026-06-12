"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import { usePlayer } from "./player-provider"
import { useNavigation } from "./navigation-provider"
import { useLiked } from "./liked-provider"
import type { LyricLine } from "@/lib/lyrics"
import { Music4, Mic2, Tv, Minimize2, Loader2, AlertCircle, ChevronDown, Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1, Share2, ListMusic, Laptop2, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/audius"
import useSWR from "swr"

export function FullscreenView() {
  const { 
    currentTrack, 
    progress, 
    duration,
    isPlaying, 
    isLoading, 
    togglePlay, 
    next, 
    previous, 
    seek, 
    setVideoDimensions, 
    showVideo,
    toggleVideo,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat
  } = usePlayer()
  const { view, navigateTo, goBack, isFullscreen, setIsFullscreen, navigateToArtist, setShowQueue } = useNavigation()
  const { isLiked, toggleLike } = useLiked()

  const [isMobile, setIsMobile] = useState(false)
  // Track window size to adapt layout dynamically
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const videoPlaceholderRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setIsFullscreen])

  // Close fullscreen and go back if showVideo is toggled off while in fullscreen video
  useEffect(() => {
    if (isFullscreen && view === "video" && !showVideo) {
      setIsFullscreen(false)
      goBack()
    }
  }, [isFullscreen, view, showVideo, setIsFullscreen, goBack])

  // Fetch synced lyrics dynamically
  const { data, isLoading: isLoadingLyrics } = useSWR<{ isSynced: boolean; lyrics: LyricLine[] }>(
    currentTrack && (view === "lyrics" || isMobile)
      ? `/api/lyrics?track=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.user?.name || "")}`
      : null,
    (url: string) => fetch(url).then((res) => res.json())
  )

  const isSynced = data?.isSynced ?? true
  const lyrics = data?.lyrics ?? []

  // Find active line index
  const activeIndex = useMemo(() => {
    if (!isSynced || lyrics.length === 0) return -1
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

  // Scroll to active line in fullscreen
  useEffect(() => {
    if (view === "lyrics" && isSynced && activeIndex >= 0 && lineRefs.current[activeIndex]) {
      lineRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [activeIndex, isSynced, view])

  // Track video dimensions if view === "video" in fullscreen
  useEffect(() => {
    if (view !== "video" && !(isMobile && showVideo)) {
      return
    }

    let active = true

    const updateDimensions = () => {
      if (!active) return
      if (videoPlaceholderRef.current) {
        const rect = videoPlaceholderRef.current.getBoundingClientRect()
        setVideoDimensions({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        })
      }
    }

    // Run frame-perfect tracking loop in fullscreen view
    const tick = () => {
      if (!active) return
      updateDimensions()
      requestAnimationFrame(tick)
    }

    // Start loop
    tick()

    window.addEventListener("scroll", updateDimensions, true)
    window.addEventListener("resize", updateDimensions)

    return () => {
      active = false
      window.removeEventListener("scroll", updateDimensions, true)
      window.removeEventListener("resize", updateDimensions)
      setVideoDimensions(null)
    }
  }, [view, setVideoDimensions, isFullscreen, isMobile, showVideo])

  // Generate dynamic background gradient
  const backgroundGradient = useMemo(() => {
    if (!currentTrack) return "from-neutral-950 to-black"
    const hash = (currentTrack.user?.name || "").length % 4
    if (hash === 0) return "from-[#4e1026] via-[#1a050d] to-black" // deep crimson
    if (hash === 1) return "from-[#0d3b21] via-[#04120a] to-black" // deep emerald
    if (hash === 2) return "from-[#0d2a3f] via-[#040e15] to-black" // deep ocean blue
    return "from-[#2f0b54] via-[#10031d] to-black" // deep purple
  }, [currentTrack])

  if (!isFullscreen || !currentTrack) return null

  const liked = isLiked(currentTrack.id)
  const cover = currentTrack?.artwork?.["480x480"] ||
                currentTrack?.artwork?.["150x150"] ||
                currentTrack?.artwork?.["1000x1000"] ||
                null
  const pct = duration > 0 ? (progress / duration) * 100 : 0
  const trackDuration = duration || currentTrack?.duration || 0

  if (isMobile) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-gradient-to-b overflow-y-auto text-white select-none scrollbar-none",
          backgroundGradient
        )}
      >
        {/* Main Player Area: occupies at least full viewport height */}
        <div className="flex min-h-svh flex-col justify-between px-6 py-6 shrink-0">
          {/* Header */}
          <header className="flex items-center justify-between">
            <button 
              onClick={() => setIsFullscreen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Minimizar"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                REPRODUCIENDO DESDE
              </span>
              <h1 className="text-xs font-bold truncate max-w-[200px] mt-0.5">
                {view === "liked" ? "Tus me gusta" : view === "playlist" ? "Playlist" : "Biblioteca"}
              </h1>
            </div>
            <button className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-neutral-400 hover:text-white">
              <MoreVertical className="h-5 w-5" />
            </button>
          </header>

          {/* Album Cover or Video Placeholder */}
          <div className="flex-1 my-6 flex items-center justify-center">
            {showVideo ? (
              /* Video Container */
              <div
                ref={videoPlaceholderRef}
                className="w-full aspect-video rounded-xl bg-black border border-white/5 flex items-center justify-center overflow-hidden shadow-2xl relative"
              >
                <div className="flex flex-col items-center gap-2 text-neutral-500">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-[10px] uppercase tracking-wider font-bold">Cargando video...</span>
                </div>
                {/* Floating button to switch back to cover */}
                <button
                  onClick={toggleVideo}
                  className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/10 cursor-pointer shadow-md transition-colors"
                  aria-label="Ver carátula"
                >
                  <Music4 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* Album Cover Image */
              <div className="relative aspect-square w-full max-w-[300px] rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5">
                <img
                  src={cover || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
                {/* Floating button to switch to video if supported */}
                <button
                  onClick={toggleVideo}
                  className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 border border-white/10 cursor-pointer shadow-md transition-colors animate-pulse"
                  aria-label="Ver video"
                >
                  <Tv className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Track details */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 
                  onClick={() => {
                    setIsFullscreen(false)
                    if (currentTrack.user?.id) {
                      navigateToArtist(currentTrack.user.id.toString(), currentTrack.user.name)
                    }
                  }}
                  className="text-xl font-bold truncate hover:underline cursor-pointer"
                >
                  {currentTrack.title}
                </h2>
                <p 
                  onClick={() => {
                    setIsFullscreen(false)
                    if (currentTrack.user?.id) {
                      navigateToArtist(currentTrack.user.id.toString(), currentTrack.user.name)
                    }
                  }}
                  className="text-sm text-neutral-400 truncate mt-1 hover:underline cursor-pointer"
                >
                  {currentTrack.user?.name}
                </p>
              </div>
              
              <button
                onClick={() => toggleLike(currentTrack)}
                className={cn(
                  "transition-transform active:scale-90 cursor-pointer p-1",
                  liked ? "text-[#1db954]" : "text-neutral-400"
                )}
                aria-label={liked ? "Eliminar de me gusta" : "Añadir a me gusta"}
              >
                <Heart className="h-6 w-6" fill={liked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Timeline slider */}
          <div className="space-y-1">
            <ProgressSlider value={pct} onChange={(p) => seek((p / 100) * trackDuration)} disabled={!currentTrack} />
            <div className="flex justify-between text-[10px] text-neutral-400 font-bold tabular-nums">
              <span>{formatDuration(progress)}</span>
              <span>{formatDuration(trackDuration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between px-2 mt-4">
            <button
              onClick={toggleShuffle}
              className={cn(
                "transition-colors cursor-pointer p-2",
                shuffle ? "text-[#1db954] font-bold" : "text-neutral-400"
              )}
              aria-label="Reproducción aleatoria"
            >
              <Shuffle className="h-5 w-5" />
            </button>
            <button
              onClick={previous}
              disabled={!currentTrack}
              className="text-white active:scale-95 disabled:opacity-40 transition-transform cursor-pointer p-2"
              aria-label="Canción anterior"
            >
              <SkipBack className="h-7 w-7" fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black active:scale-95 transition-transform cursor-pointer shadow-lg"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-7 w-7" fill="currentColor" />
              ) : (
                <Play className="h-7 w-7 translate-x-[1px]" fill="currentColor" />
              )}
            </button>
            <button
              onClick={next}
              disabled={!currentTrack}
              className="text-white active:scale-95 disabled:opacity-40 transition-transform cursor-pointer p-2"
              aria-label="Canción siguiente"
            >
              <SkipForward className="h-7 w-7" fill="currentColor" />
            </button>
            <button
              onClick={cycleRepeat}
              className={cn(
                "transition-colors cursor-pointer p-2",
                repeat !== "off" ? "text-[#1db954] font-bold" : "text-neutral-400"
              )}
              aria-label="Repetir"
            >
              {repeat === "one" ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
            </button>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-2 mt-6 text-neutral-400">
            <button className="hover:text-white transition-colors cursor-pointer p-1">
              <Laptop2 className="h-5 w-5" />
            </button>
            <button className="hover:text-white transition-colors cursor-pointer p-1">
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => {
                setIsFullscreen(false)
                setShowQueue(true)
              }}
              className="hover:text-white transition-colors cursor-pointer p-1"
              aria-label="Ver cola de reproducción"
            >
              <ListMusic className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable lyrics section (deslizar hacia abajo) */}
        <div className="px-6 pb-24 shrink-0">
          <div className="rounded-2xl bg-black/45 border border-white/5 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <span className="text-xs uppercase tracking-widest font-extrabold text-[#1db954]">Letras</span>
              <Mic2 className="h-4 w-4 text-[#1db954]" />
            </div>

            {/* Lyrics content */}
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1 text-sm font-semibold scrollbar-thin scrollbar-thumb-neutral-800">
              {isLoadingLyrics ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-neutral-400">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs">Buscando letras...</span>
                </div>
              ) : lyrics.length > 0 ? (
                lyrics.map((line, idx) => {
                  const isActive = idx === activeIndex
                  return (
                    <p
                      key={idx}
                      className={cn(
                        "transition-all duration-200 py-0.5",
                        isActive ? "text-[#1db954] text-base font-extrabold" : "text-neutral-300"
                      )}
                    >
                      {line.text}
                    </p>
                  )
                })
              ) : (
                <p className="text-neutral-500 text-xs italic text-center py-8">
                  Letras no disponibles para esta canción.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isFullscreen || !currentTrack) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-gradient-to-b px-8 py-8 transition-all duration-700 ease-out text-white select-none",
        backgroundGradient
      )}
    >
      {/* Top Header controls */}
      <div className="flex items-center justify-between w-full border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded bg-neutral-900 shadow">
            {currentTrack.artwork?.["150x150"] && (
              <img
                src={currentTrack.artwork["150x150"]}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">{currentTrack.title}</h2>
            <p className="text-xs text-neutral-400 mt-1">{currentTrack.user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View button */}
          {showVideo && (
            <button
              onClick={() => navigateTo(view === "lyrics" ? "video" : "lyrics")}
              className="px-4 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all rounded-full border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              {view === "lyrics" ? (
                <>
                  <Tv className="h-3.5 w-3.5" />
                  <span>Ver video</span>
                </>
              ) : (
                <>
                  <Mic2 className="h-3.5 w-3.5" />
                  <span>Ver letra</span>
                </>
              )}
            </button>
          )}

          {/* Minimize / Exit button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Salir de pantalla completa"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden w-full max-w-5xl mx-auto">
        {view === "lyrics" ? (
          <div
            ref={scrollContainerRef}
            className="w-full flex-1 overflow-y-auto pr-2 scrollbar-none py-16 text-center select-none"
            style={{ maskImage: "linear-gradient(to bottom, transparent, white 25%, white 75%, transparent)" }}
          >
            {isLoadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm">Buscando letras en pantalla completa...</p>
              </div>
            ) : lyrics.length > 0 ? (
              <div className="flex flex-col gap-8 py-32 max-w-3xl mx-auto">
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeIndex
                  const isPast = idx < activeIndex

                  if (!isSynced) {
                    return (
                      <div
                        key={idx}
                        className="w-full text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight py-3 text-white/90"
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
                        "w-full text-center text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight transition-all duration-300 py-2 focus:outline-none cursor-pointer hover:scale-105 hover:text-white block",
                        isActive
                          ? "text-[#1db954] scale-[1.06] drop-shadow-[0_0_20px_rgba(29,185,84,0.4)] opacity-100"
                          : isPast
                          ? "text-white/80 opacity-80"
                          : "text-white/25 opacity-30"
                      )}
                    >
                      {line.text}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500">
                <AlertCircle className="h-10 w-10 text-neutral-600" />
                <p>No se encontraron letras disponibles en pantalla completa.</p>
              </div>
            )}
          </div>
        ) : (
          /* Video Fullscreen View */
          <div className="w-full h-full flex items-center justify-center py-6">
            <div
              ref={videoPlaceholderRef}
              className="relative w-full aspect-video max-h-[75vh] max-w-5xl rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-300"
            >
              <div className="flex flex-col items-center gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs uppercase tracking-widest font-bold text-neutral-500">
                  Cargando reproductor de video en pantalla completa...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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
    <div className="group relative flex h-4 flex-1 items-center select-none">
      <div className="absolute inset-x-0 h-1 rounded-full bg-neutral-800">
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
