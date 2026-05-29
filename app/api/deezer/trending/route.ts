import { NextResponse } from "next/server"
import { LATAM_HITS } from "@/lib/latam-hits"

// Map Deezer tracks to compatible AudiusTrack schema
function mapDeezerTracks(tracks: any[]) {
  return tracks.map((track: any) => ({
    id: `deezer_${track.id}`,
    title: track.title,
    duration: track.duration,
    genre: track.genre_id ? `Genre ${track.genre_id}` : "Latin",
    play_count: track.rank || 500000,
    favorite_count: Math.floor((track.rank || 500000) / 10),
    repost_count: Math.floor((track.rank || 500000) / 50),
    artwork: {
      "150x150": track.album.cover_medium || track.album.cover_small,
      "480x480": track.album.cover_big || track.album.cover_medium,
      "1000x1000": track.album.cover_xl || track.album.cover_big,
    },
    album: track.album ? {
      id: `deezer_album_${track.album.id}`,
      title: track.album.title,
    } : undefined,
    user: {
      id: `deezer_artist_${track.artist.id}`,
      handle: track.artist.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      name: track.artist.name,
      profile_picture: {
        "150x150": track.artist.picture_medium || track.artist.picture_small,
      },
      follower_count: 1000000,
      is_verified: true,
    },
  }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "trending"

  try {
    let query = "latin hits"
    if (type === "trending") {
      query = "bad bunny karol g feid shakira peso pluma"
    } else if (type === "reggaeton") {
      query = "reggaeton hits 2026"
    } else if (type === "rock") {
      query = "rock en espanol classics"
    } else if (type === "pop") {
      query = "pop latino hits"
    } else if (type === "mexico") {
      query = "regional mexicano"
    } else if (type === "colombia") {
      query = "colombia hits"
    } else if (type === "argentina") {
      query = "rock nacional argentino"
    } else if (type === "peru") {
      query = "cumbia peruana armonia 10"
    }

    let tracks: any[] = []
    try {
      const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`, {
        next: { revalidate: 3600 } // cache for 1 hour
      })
      if (res.ok) {
        const data = await res.json()
        tracks = data.data || []
      }
    } catch (e) {
      console.warn("⚠️ Deezer live API search failed, falling back to curated local LATAM hits:", e)
    }

    // Fallback if Deezer API is unreachable or returned empty list
    if (tracks.length === 0) {
      const getFallbackData = () => {
        const lowercaseType = type.toLowerCase()
        if (lowercaseType === "reggaeton") {
          return LATAM_HITS.filter(t => (t.genre || "").toLowerCase().includes("reggaeton") || (t.genre || "").toLowerCase().includes("urbano"))
        }
        if (lowercaseType === "rock") {
          return LATAM_HITS.filter(t => (t.genre || "").toLowerCase().includes("rock"))
        }
        if (lowercaseType === "pop") {
          return LATAM_HITS.filter(t => (t.genre || "").toLowerCase().includes("pop"))
        }
        if (lowercaseType === "mexico") {
          return LATAM_HITS.filter(t => (t.genre || "").toLowerCase().includes("mexico") || (t.genre || "").toLowerCase().includes("mariachi"))
        }
        if (lowercaseType === "colombia") {
          return LATAM_HITS.filter(t => (t.genre || "").toLowerCase().includes("colombia"))
        }
        if (lowercaseType === "argentina") {
          return LATAM_HITS.filter(t => (t.genre || "").toLowerCase().includes("argentina"))
        }
        if (lowercaseType === "peru") {
          return LATAM_HITS.filter(t => (t.genre || "").toLowerCase().includes("peru") || (t.user?.name || "").toLowerCase().includes("marco"))
        }
        return LATAM_HITS
      }

      const fallbackList = getFallbackData()
      return NextResponse.json({ data: fallbackList.length > 0 ? fallbackList : LATAM_HITS })
    }

    return NextResponse.json({ data: mapDeezerTracks(tracks) })
  } catch (error: any) {
    console.error("❌ Error in Deezer trending proxy GET:", error)
    return NextResponse.json({ data: LATAM_HITS }) // Absolute fallback to guarantee beautiful Home
  }
}
