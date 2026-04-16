"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react"
import type { AudiusTrack } from "@/lib/audius"
import { getStreamUrl } from "@/lib/audius"

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
  playTrack: (track: AudiusTrack, queue?: AudiusTrack[]) => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (seconds: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
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

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return
    const audio = new Audio()
    audio.preload = "auto"
    audioRef.current = audio

    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => setIsLoading(false)
    const onCanPlay = () => setIsLoading(false)

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("playing", onPlaying)
    audio.addEventListener("canplay", onCanPlay)

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("playing", onPlaying)
      audio.removeEventListener("canplay", onCanPlay)
    }
  }, [])

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const playTrack = useCallback((track: AudiusTrack, newQueue?: AudiusTrack[]) => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTrack(track)
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue)
    }
    setIsLoading(true)
    setProgress(0)

    getStreamUrl(track.id).then((url) => {
      audio.src = url
      audio.play().catch((err) => {
        console.log("[v0] Playback error:", err?.message)
        setIsLoading(false)
      })
    })
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (audio.paused) {
      audio.play().catch((e) => console.log("[v0] play err", e?.message))
    } else {
      audio.pause()
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
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    const i = getNextIndex(-1)
    if (i >= 0) playTrack(queue[i])
  }, [getNextIndex, playTrack, queue])

  // Handle track end
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        next()
      }
    }
    audio.addEventListener("ended", onEnded)
    return () => audio.removeEventListener("ended", onEnded)
  }, [next, repeat])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = seconds
    setProgress(seconds)
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (v > 0) setIsMuted(false)
  }, [])

  const toggleMute = useCallback(() => setIsMuted((m) => !m), [])
  const toggleShuffle = useCallback(() => setShuffle((s) => !s), [])
  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"))
  }, [])

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
      playTrack,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
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
      playTrack,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider")
  return ctx
}
