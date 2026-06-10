"use client"

import { useEffect, useRef, useMemo } from "react"
import { usePlayer } from "./player-provider"
import { useNavigation } from "./navigation-provider"
import type { LyricLine } from "@/lib/lyrics"
import { Music4, Mic2, Tv, Minimize2, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from "swr"

export function FullscreenView() {
  const { currentTrack, progress, seek, setVideoDimensions, showVideo } = usePlayer()
  const { view, navigateTo, isFullscreen, setIsFullscreen } = useNavigation()
  
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

  // Fetch synced lyrics dynamically
  const { data, isLoading } = useSWR<{ isSynced: boolean; lyrics: LyricLine[] }>(
    currentTrack && view === "lyrics"
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
    if (view !== "video") {
      return
    }

    const updateDimensions = () => {
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

    const timeoutId = setTimeout(updateDimensions, 150)

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    if (videoPlaceholderRef.current) {
      resizeObserver.observe(videoPlaceholderRef.current)
    }

    window.addEventListener("resize", updateDimensions)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateDimensions)
      setVideoDimensions(null)
    }
  }, [view, setVideoDimensions, isFullscreen])

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
            {isLoading ? (
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
