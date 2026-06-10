"use client"

import { useEffect, useRef, useMemo } from "react"
import { usePlayer } from "./player-provider"
import { Music4, Loader2, Mic2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigation } from "./navigation-provider"

export function VideoView() {
  const { currentTrack, showVideo, setVideoDimensions } = usePlayer()
  const { navigateTo, goBack } = useNavigation()
  const videoPlaceholderRef = useRef<HTMLDivElement>(null)

  // Go back to previous view if showVideo is toggled off
  useEffect(() => {
    if (!showVideo) {
      goBack()
    }
  }, [showVideo, goBack])

  // Track and report video dimensions to the player provider when active
  useEffect(() => {
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

    // Run a frame-perfect tracking loop during view lifecycle
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
  }, [setVideoDimensions])

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
        <Music4 className="h-16 w-16 text-neutral-600 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Reproductor de Video</h2>
        <p className="max-w-md text-sm text-neutral-500">
          Reproduce una canción comercial oficial y activa el video para verlo aquí en pantalla grande.
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
        {/* Header info */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 w-full shrink-0">
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
                Reproduciendo Video
              </span>
              <h1 className="text-xl font-bold text-white line-clamp-1">{currentTrack.title}</h1>
              <p className="text-sm font-semibold text-neutral-400 mt-0.5">
                {currentTrack.user?.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo("lyrics")}
            className="px-4 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all rounded-full border border-white/10 flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105"
          >
            <Mic2 className="h-3.5 w-3.5" />
            <span>Ver letra</span>
          </button>
        </div>

        {/* Video Placeholder Container */}
        <div className="flex-1 min-h-0 flex items-center justify-center w-full py-4">
          <div
            ref={videoPlaceholderRef}
            className="relative w-full max-w-3xl aspect-video max-h-full rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs uppercase tracking-widest font-bold text-neutral-500">
                Sincronizando reproductor de video...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
