import { NextResponse } from "next/server"
import { getSyncedLyrics } from "@/lib/lyrics"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const track = searchParams.get("track")
    const artist = searchParams.get("artist")

    if (!track || !artist) {
      return NextResponse.json({ isSynced: false, lyrics: [] })
    }

    // Helper functions for cleaning and parsing
    const cleanText = (str: string) => {
      return str
        .replace(/\(.*?\)/g, "") // remove content inside parentheses e.g. (remix)
        .replace(/\[.*?\]/g, "") // remove content inside brackets
        .replace(/\bfeat\b.*$/gi, "") // remove feat. ...
        .replace(/\bft\b.*$/gi, "")
        .replace(/\bfeaturing\b.*$/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    }

    const getPrimaryArtist = (artistStr: string) => {
      const clean = cleanText(artistStr)
      const parts = clean.split(/[,&xXyY]|\band\b|\bwith\b/i)
      return parts[0]?.trim() || clean
    }

    const cleanTrack = cleanText(track)
    const cleanArtist = cleanText(artist)
    const primaryArtist = getPrimaryArtist(artist)

    let syncedLyrics: string | null = null
    let plainLyrics: string | null = null

    // 1. Try exact match using lrclib's GET endpoint with primary artist
    try {
      const exactUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(primaryArtist)}&track_name=${encodeURIComponent(cleanTrack)}`
      const res = await fetch(exactUrl, {
        headers: {
          "User-Agent": "EumoraMusic/1.0 (Academic Project)"
        },
        next: { revalidate: 86400 } // cache for 24 hours
      })
      if (res.ok) {
        const data = await res.json()
        if (data.syncedLyrics) syncedLyrics = data.syncedLyrics
        else if (data.plainLyrics) plainLyrics = data.plainLyrics
      }
    } catch (e) {
      console.warn("Exact LRCLIB match failed, trying search fallback...")
    }

    // 2. Fallback: Search using lrclib's search endpoint with primary artist + track
    if (!syncedLyrics && !plainLyrics) {
      try {
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(primaryArtist + " " + cleanTrack)}`
        const res = await fetch(searchUrl, {
          headers: {
            "User-Agent": "EumoraMusic/1.0 (Academic Project)"
          },
          next: { revalidate: 86400 }
        })
        if (res.ok) {
          const results = await res.json()
          if (Array.isArray(results) && results.length > 0) {
            // Find first synced option
            const syncedOpt = results.find(r => r.syncedLyrics)
            if (syncedOpt) syncedLyrics = syncedOpt.syncedLyrics
            else {
              // Fallback to plain
              const plainOpt = results.find(r => r.plainLyrics)
              if (plainOpt) plainLyrics = plainOpt.plainLyrics
            }
          }
        }
      } catch (e) {
        console.warn("LRCLIB search fallback 1 failed...")
      }
    }

    // 3. Last fallback: Search with full artist + full track
    if (!syncedLyrics && !plainLyrics && cleanArtist !== primaryArtist) {
      try {
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanArtist + " " + cleanTrack)}`
        const res = await fetch(searchUrl, {
          headers: {
            "User-Agent": "EumoraMusic/1.0 (Academic Project)"
          },
          next: { revalidate: 86400 }
        })
        if (res.ok) {
          const results = await res.json()
          if (Array.isArray(results) && results.length > 0) {
            const syncedOpt = results.find(r => r.syncedLyrics)
            if (syncedOpt) syncedLyrics = syncedOpt.syncedLyrics
            else {
              const plainOpt = results.find(r => r.plainLyrics)
              if (plainOpt) plainLyrics = plainOpt.plainLyrics
            }
          }
        }
      } catch (e) {
        console.warn("LRCLIB search fallback 2 failed...")
      }
    }

    // Process Synced Lyrics
    if (syncedLyrics) {
      const lines = syncedLyrics.split("\n")
      const parsed: { time: number; text: string }[] = []
      
      lines.forEach((line: string) => {
        const match = line.match(/^\[(\d+):(\d+)(?:\.(\d+))?\](.*)$/)
        if (match) {
          const mins = parseInt(match[1], 10)
          const secs = parseInt(match[2], 10)
          const ms = match[3] ? parseInt(match[3], 10) : 0
          
          const centisecondsDivisor = match[3] && match[3].length === 3 ? 1000 : 100
          const totalSeconds = mins * 60 + secs + ms / centisecondsDivisor
          const text = match[4].trim()
          
          if (text) {
            parsed.push({ time: totalSeconds, text })
          }
        }
      })

      if (parsed.length > 0) {
        return NextResponse.json({ isSynced: true, lyrics: parsed })
      }
    }

    // Process Plain Lyrics
    if (plainLyrics) {
      const lines = plainLyrics.split("\n")
      const parsed = lines
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((text: string) => ({
          time: -1,
          text
        }))

      if (parsed.length > 0) {
        return NextResponse.json({ isSynced: false, lyrics: parsed })
      }
    }

    // Local catalog fallback
    const fallbackLyrics = getSyncedLyrics(track, artist)
    return NextResponse.json({ isSynced: true, lyrics: fallbackLyrics })
  } catch (error: any) {
    console.error("❌ Error in lyrics API proxy:", error)
    const { searchParams } = new URL(request.url)
    const track = searchParams.get("track") || ""
    const artist = searchParams.get("artist") || ""
    const fallbackLyrics = getSyncedLyrics(track, artist)
    return NextResponse.json({ isSynced: true, lyrics: fallbackLyrics })
  }
}
