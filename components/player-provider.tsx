"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react"
import type { AudiusTrack } from "@/lib/audius"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useNavigation } from "./navigation-provider"
import { X } from "lucide-react"

interface PlayerContextValue {
  currentTrack: AudiusTrack | null
  queue: AudiusTrack[]
  isPlaying: boolean
  isLoading: boolean
  progress: number
  duration: number
  volume: number
  isMuted: boolean
  shuffle: boolean
  repeat: "off" | "all" | "one"
  showVideo: boolean
  playTrack: (track: AudiusTrack, queue?: AudiusTrack[]) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  toggleVideo: () => void
  sleepTimerDuration: number | null
  sleepTimerRemaining: number | null
  setSleepTimer: (minutes: number | null) => void
  videoDimensions: { top: number; left: number; width: number; height: number } | null
  setVideoDimensions: (dims: { top: number; left: number; width: number; height: number } | null) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: any
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { view, navigateTo, goBack } = useNavigation()
  const [currentTrack, setCurrentTrack] = useState<AudiusTrack | null>(null)
  const [queue, setQueue] = useState<AudiusTrack[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off")
  const [showVideo, setShowVideo] = useState(false)
  const [sleepTimerDuration, setSleepTimerDuration] = useState<number | null>(null)
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null)
  const [videoDimensions, setVideoDimensionsState] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  // Mobile/Desktop Drag-to-Dismiss and Double-Tap Fullscreen States
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isHoveringDismiss, setIsHoveringDismiss] = useState(false)

  const dragStartRef = useRef({ x: 0, y: 0 })
  const currentOffsetRef = useRef({ x: 0, y: 0 })
  const lastTapRef = useRef<number>(0)

  // Keep ref synchronized with state to read current offset inside global listeners
  useEffect(() => {
    currentOffsetRef.current = dragOffset
  }, [dragOffset])

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (view === "video") return // Disable dragging in fullscreen view
    
    // Ignore right click
    if ("button" in e && e.button !== 0) return

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    dragStartRef.current = { x: clientX, y: clientY }
    setIsDragging(true)
  }

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    // Prevent default scrolling on mobile when dragging the video window
    if (e.cancelable) {
      e.preventDefault()
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const dx = clientX - dragStartRef.current.x
    const dy = clientY - dragStartRef.current.y

    const newOffset = {
      x: currentOffsetRef.current.x + dx,
      y: currentOffsetRef.current.y + dy
    }

    setDragOffset(newOffset)
    dragStartRef.current = { x: clientX, y: clientY }

    // Distance calculation for Dismiss X Circle bottom center
    const defaultX = 16
    const defaultY = window.innerHeight - 231
    const newX = defaultX + newOffset.x
    const newY = defaultY + newOffset.y
    const boundX = Math.max(8, Math.min(newX, window.innerWidth - 240 - 8))
    const boundY = Math.max(8, Math.min(newY, window.innerHeight - 135 - 8))

    const videoCenterX = boundX + 120
    const videoCenterY = boundY + 67.5

    const targetX = window.innerWidth / 2
    const targetY = window.innerHeight - 64

    const dist = Math.sqrt(Math.pow(videoCenterX - targetX, 2) + Math.pow(videoCenterY - targetY, 2))
    setIsHoveringDismiss(dist < 100)
  }, [isDragging])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    if (isHoveringDismiss) {
      setShowVideo(false)
      // Reset position
      setDragOffset({ x: 0, y: 0 })
    }
    setIsHoveringDismiss(false)
  }, [isDragging, isHoveringDismiss])

  // Attach dynamic window event listeners during active dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove, { passive: false })
      window.addEventListener("mouseup", handleDragEnd)
      window.addEventListener("touchmove", handleDragMove, { passive: false })
      window.addEventListener("touchend", handleDragEnd)
    } else {
      window.removeEventListener("mousemove", handleDragMove)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchmove", handleDragMove)
      window.removeEventListener("touchend", handleDragEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchmove", handleDragMove)
      window.removeEventListener("touchend", handleDragEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  const handleTouchStartTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      // Double tap detected on mobile!
      if (view === "video") {
        goBack()
      } else {
        navigateTo("video")
      }
    }
    lastTapRef.current = now
  }


  const setVideoDimensions = useCallback((dims: { top: number; left: number; width: number; height: number } | null) => {
    setVideoDimensionsState((prev) => {
      if (!dims && !prev) return null
      if (dims && prev &&
          dims.top === prev.top &&
          dims.left === prev.left &&
          dims.width === prev.width &&
          dims.height === prev.height) {
        return prev
      }
      return dims
    })
  }, [])

  const playerRef = useRef<any>(null)
  const progressIntervalRef = useRef<any>(null)
  const isApiLoadedRef = useRef(false)
  const handleTrackEndedRef = useRef<() => void>(() => {})
  const currentVideoIdsRef = useRef<string[]>([])
  const currentVideoIdIndexRef = useRef<number>(0)
  const handlePlayerErrorRef = useRef<(err: any) => void>(() => {})

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerDuration(null)
      setSleepTimerRemaining(null)
    } else {
      setSleepTimerDuration(minutes)
      setSleepTimerRemaining(minutes * 60)
    }
  }, [])

  // Count down sleep timer
  useEffect(() => {
    if (sleepTimerRemaining === null) return

    if (sleepTimerRemaining <= 0) {
      const player = playerRef.current
      if (player && typeof player.pauseVideo === "function") {
        player.pauseVideo()
      }
      setIsPlaying(false)
      setSleepTimerDuration(null)
      setSleepTimerRemaining(null)
      return
    }

    const timer = setTimeout(() => {
      setSleepTimerRemaining((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearTimeout(timer)
  }, [sleepTimerRemaining])

  // 1. Initialize YouTube Player API script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return

    // Callback when API is ready
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer()
    }

    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    } else {
      initializePlayer()
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  // Helper to initialize the player once the API is loaded
  const initializePlayer = () => {
    if (playerRef.current || !window.YT) return

    playerRef.current = new window.YT.Player("yt-player", {
      height: "100%",
      width: "100%",
      videoId: "",
      playerVars: {
        playsinline: 1,
        controls: 0, // hide standard youtube controls
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (event: any) => {
          // Set initial volume
          event.target.setVolume(volume * 100)
          if (isMuted) event.target.mute()
        },
        onStateChange: (event: any) => {
          // Handle play, pause, end states
          // window.YT.PlayerState.PLAYING = 1
          // window.YT.PlayerState.PAUSED = 2
          // window.YT.PlayerState.ENDED = 0
          // window.YT.PlayerState.BUFFERING = 3
          
          const state = event.data
          if (state === 1) {
            setIsPlaying(true)
            setIsLoading(false)
            startProgressTracker()
          } else if (state === 2) {
            setIsPlaying(false)
            stopProgressTracker()
          } else if (state === 3) {
            setIsLoading(true)
          } else if (state === 0) {
            setIsPlaying(false)
            stopProgressTracker()
            handleTrackEndedRef.current?.()
          }
        },
        onError: (err: any) => {
          console.error("YouTube Player Error:", err)
          handlePlayerErrorRef.current?.(err)
        }
      }
    })
  }

  // Tracking playback progress
  const startProgressTracker = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    progressIntervalRef.current = setInterval(() => {
      const player = playerRef.current
      if (player && typeof player.getCurrentTime === "function") {
        setProgress(player.getCurrentTime())
        setDuration(player.getDuration() || 0)
      }
    }, 500)
  }

  const stopProgressTracker = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  // Play a track: Searches YouTube first, then loads video!
  const playTrack = useCallback((track: AudiusTrack, newQueue?: AudiusTrack[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue)
    }
    
    setCurrentTrack(track)
    setIsLoading(true)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)

    // Generate query: e.g. "Bad Bunny - Ojitos Lindos"
    const artistName = track.user?.name || ""
    const query = `${artistName} ${track.title}`

    // Fetch video ID from our server-side YouTube search proxy
    fetch(`/api/youtube?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Video search failed")
        return res.json()
      })
      .then((data) => {
        if (!data.videoId) throw new Error("No video ID returned")
        
        currentVideoIdsRef.current = data.videoIds || [data.videoId]
        currentVideoIdIndexRef.current = 0

        const player = playerRef.current
        if (player && typeof player.loadVideoById === "function") {
          player.loadVideoById(data.videoId)
          player.playVideo()
        } else {
          // If player isn't fully ready yet, try to reinitialize
          initializePlayer()
          // Fallback to reload after a brief timeout
          setTimeout(() => {
            const p = playerRef.current
            if (p && typeof p.loadVideoById === "function") {
              p.loadVideoById(data.videoId)
              p.playVideo()
            }
          }, 1000)
        }
      })
      .catch((err) => {
        console.error("Playback error:", err.message)
        setIsLoading(false)
        setIsPlaying(false)
      })
  }, [volume, isMuted])

  const togglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player || !currentTrack) return

    const state = player.getPlayerState()
    if (state === 1) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }, [currentTrack])

  const getNextIndex = useCallback(
    (delta: number) => {
      if (!currentTrack || queue.length === 0) return -1
      const idx = queue.findIndex((t) => t.id === currentTrack.id)
      if (idx === -1) return -1
      if (shuffle && delta > 0) {
        if (queue.length <= 1) return idx
        let r = idx
        while (r === idx) r = Math.floor(Math.random() * queue.length)
        return r
      }
      let nextIdx = idx + delta
      if (nextIdx < 0) nextIdx = repeat === "all" ? queue.length - 1 : 0
      if (nextIdx >= queue.length) nextIdx = repeat === "all" ? 0 : -1
      return nextIdx
    },
    [currentTrack, queue, shuffle, repeat],
  )

  const next = useCallback(() => {
    const i = getNextIndex(1)
    if (i >= 0) playTrack(queue[i])
  }, [getNextIndex, playTrack, queue])

  const previous = useCallback(() => {
    const player = playerRef.current
    if (player && typeof player.getCurrentTime === "function" && player.getCurrentTime() > 3) {
      player.seekTo(0, true)
      setProgress(0)
      return
    }
    const i = getNextIndex(-1)
    if (i >= 0) playTrack(queue[i])
  }, [getNextIndex, playTrack, queue])

  const handleTrackEnded = () => {
    if (repeat === "one") {
      const player = playerRef.current
      if (player && typeof player.seekTo === "function") {
        player.seekTo(0, true)
        player.playVideo()
      }
    } else {
      next()
    }
  }

  const handlePlayerError = (err: any) => {
    const nextIndex = currentVideoIdIndexRef.current + 1
    if (nextIndex < currentVideoIdsRef.current.length) {
      const nextVideoId = currentVideoIdsRef.current[nextIndex]
      currentVideoIdIndexRef.current = nextIndex
      console.log(`🔄 Retrying with alternative video ID (${nextIndex + 1}/${currentVideoIdsRef.current.length}): ${nextVideoId}`)
      toast("Este video está restringido. Intentando con otra fuente...")
      
      const player = playerRef.current
      if (player && typeof player.loadVideoById === "function") {
        setIsLoading(true)
        player.loadVideoById(nextVideoId)
        player.playVideo()
      }
    } else {
      console.error("❌ All alternative YouTube video IDs failed to play.")
      setIsLoading(false)
      setIsPlaying(false)
      toast.error("No se pudo reproducir este tema. Pasando al siguiente...")
      next()
    }
  }

  // Update refs on every render to prevent stale closure bug
  useEffect(() => {
    handleTrackEndedRef.current = handleTrackEnded
    handlePlayerErrorRef.current = handlePlayerError
  })

  // Volume & controls handlers
  const seek = useCallback((seconds: number) => {
    const player = playerRef.current
    if (!player || typeof player.seekTo !== "function") return
    player.seekTo(seconds, true)
    setProgress(seconds)
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    const player = playerRef.current
    if (player && typeof player.setVolume === "function") {
      player.setVolume(v * 100)
    }
    if (v > 0) {
      setIsMuted(false)
      if (player && typeof player.unMute === "function") player.unMute()
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((m) => {
      const newMuted = !m
      const player = playerRef.current
      if (player) {
        if (newMuted && typeof player.mute === "function") player.mute()
        if (!newMuted && typeof player.unMute === "function") {
          player.unMute()
          player.setVolume(volume * 100)
        }
      }
      return newMuted
    })
  }, [volume])

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), [])
  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))
  }, [])
  const toggleVideo = useCallback(() => setShowVideo((v) => !v), [])

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentTrack,
      queue,
      isPlaying,
      isLoading,
      progress,
      duration,
      volume,
      isMuted,
      shuffle,
      repeat,
      showVideo,
      playTrack,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      toggleVideo,
      sleepTimerDuration,
      sleepTimerRemaining,
      setSleepTimer,
      videoDimensions,
      setVideoDimensions,
    }),
    [
      currentTrack,
      queue,
      isPlaying,
      isLoading,
      progress,
      duration,
      volume,
      isMuted,
      shuffle,
      repeat,
      showVideo,
      playTrack,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      toggleVideo,
      sleepTimerDuration,
      sleepTimerRemaining,
      setSleepTimer,
      videoDimensions,
      setVideoDimensions,
    ],
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Premium Video Container - floating element bottom-left corner or expanded in lyrics/video */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={(e) => {
          handleDragStart(e)
          handleTouchStartTap()
        }}
        onDoubleClick={() => {
          if (view === "video") {
            goBack()
          } else {
            navigateTo("video")
          }
        }}
        className={cn(
          "fixed z-[70] overflow-hidden rounded-xl border border-neutral-800 bg-black shadow-2xl select-none",
          showVideo && currentTrack
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
          isDragging ? "cursor-grabbing border-[#1db954]/40 shadow-[#1db954]/5" : "cursor-grab hover:border-neutral-700"
        )}
        style={(() => {
          if (showVideo && currentTrack && videoDimensions) {
            return {
              left: `${videoDimensions.left}px`,
              top: `${videoDimensions.top}px`,
              width: `${videoDimensions.width}px`,
              height: `${videoDimensions.height}px`,
              borderRadius: "12px",
            }
          }
          if (showVideo && currentTrack) {
            const defaultX = 16
            const defaultY = window.innerHeight - 231
            const newX = defaultX + dragOffset.x
            const newY = defaultY + dragOffset.y
            const boundX = Math.max(8, Math.min(newX, window.innerWidth - 240 - 8))
            const boundY = Math.max(8, Math.min(newY, window.innerHeight - 135 - 8))
            
            return {
              left: `${boundX}px`,
              top: `${boundY}px`,
              width: "240px",
              height: "135px",
              borderRadius: "12px",
              transform: isHoveringDismiss ? "scale(0.8)" : "scale(1)",
              transition: isDragging ? "transform 0.15s ease" : "left 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.2s ease, opacity 0.3s ease, scale 0.3s ease",
            }
          }
          return {
            left: "16px",
            top: "calc(100vh - 96px)",
            width: "0px",
            height: "0px",
            borderRadius: "12px",
          }
        })()}
      >
        <div id="yt-player" className="h-full w-full rounded-xl pointer-events-none" />
      </div>

      {/* Dismiss target for drag-to-close gesture */}
      {isDragging && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] flex flex-col items-center gap-2.5 animate-in fade-in slide-in-from-bottom-6 duration-200 select-none pointer-events-none">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full bg-red-600/75 backdrop-blur-md border border-red-500 text-white shadow-2xl transition-all duration-200",
            isHoveringDismiss ? "scale-125 bg-red-600 border-red-400 shadow-red-500/50" : "scale-100"
          )}>
            <X className={cn("h-7 w-7", isHoveringDismiss ? "scale-110" : "animate-pulse")} />
          </div>
          <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-black/80 px-4 py-1.5 rounded-full border border-white/5 shadow-md">
            Soltar para cerrar
          </span>
        </div>
      )}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider")
  return ctx
}
