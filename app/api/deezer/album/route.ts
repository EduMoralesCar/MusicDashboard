import { NextResponse } from "next/server"
import { LATAM_HITS } from "@/lib/latam-hits"

// Map Deezer tracks inside album to compatible AudiusTrack schema
function mapDeezerAlbumTracks(tracks: any[], albumDetails: any) {
  return tracks.map((track: any) => ({
    id: `deezer_${track.id}`,
    title: track.title,
    duration: track.duration,
    genre: "Latin",
    play_count: track.rank || 500000,
    favorite_count: Math.floor((track.rank || 500000) / 10),
    repost_count: Math.floor((track.rank || 500000) / 50),
    artwork: {
      "150x150": albumDetails.cover_medium || albumDetails.cover_small,
      "480x480": albumDetails.cover_big || albumDetails.cover_medium,
      "1000x1000": albumDetails.cover_xl || albumDetails.cover_big,
    },
    user: {
      id: `deezer_artist_${albumDetails.artist?.id}`,
      handle: albumDetails.artist?.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "",
      name: albumDetails.artist?.name || "",
      profile_picture: {
        "150x150": albumDetails.artist?.picture_medium || albumDetails.artist?.picture_small || "",
      },
      follower_count: 1000000,
      is_verified: true,
    },
  }))
}

const memoryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

const fallbackAlbumNames: Record<string, string> = {
  latam_1: "Un Verano Sin Ti",
  latam_2: "MAÑANA SERÁ BONITO",
  latam_3: "Bzrp Sessions Vol. 52",
  latam_4: "FERXXOCALIPSIS",
  latam_5: "Canción Animal",
  latam_6: "Desvelado",
  latam_7: "54+1",
  latam_8: "Soy Como Quiero Ser",
  latam_9: "MAÑANA SERÁ BONITO",
  latam_10: "VICE VERSA",
  latam_11: "Big Bang",
  latam_12: "Corazones",
  latam_13: "El Comienzo",
  latam_14: "Bzrp Sessions Vol. 53",
  latam_15: "Intuición",
  latam_16: "Mi Sangre",
  latam_17: "3.0",
  latam_18: "Fórmula, Vol. 2",
  latam_19: "Visualízate",
  latam_20: "Me Dejé Llevar"
}

export async function GET(request: Request) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing album ID" }, { status: 400 })
    }

    // Check if this is a local fallback album
    if (id.startsWith("latam_") || isNaN(Number(id))) {
      const cleanId = id.replace("deezer_album_", "").replace("album_", "")
      const track = LATAM_HITS.find(t => t.id === cleanId || t.id === `latam_${cleanId}`)
      
      if (track) {
        const albumTitle = fallbackAlbumNames[track.id] || `${track.title} (Single)`
        const mockAlbum = {
          album: {
            id: `deezer_album_${track.id}`,
            title: albumTitle,
            cover: track.artwork?.["480x480"] || track.artwork?.["150x150"] || "",
            release_date: "2024-01-01",
            artist: {
              id: track.user?.id || "unknown_artist",
              name: track.user?.name || "Unknown Artist"
            },
            tracks: [
              {
                id: track.id,
                title: track.title,
                duration: track.duration,
                genre: track.genre || "Latin",
                play_count: track.play_count,
                favorite_count: track.favorite_count,
                repost_count: track.repost_count,
                artwork: track.artwork,
                user: track.user,
                album: {
                  id: `deezer_album_${track.id}`,
                  title: albumTitle
                }
              }
            ]
          }
        }
        return NextResponse.json(mockAlbum)
      }
    }

    const cacheKey = `${id}`

    // Check memory cache
    const cached = memoryCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data)
    }

    const res = await fetch(`https://api.deezer.com/album/${id}`, {
      headers,
      next: { revalidate: 86400 } // cache for 1 day
    })

    if (!res.ok) {
      throw new Error(`Deezer API returned status ${res.status}`)
    }

    const data = await res.json()

    const album = {
      id: `deezer_album_${data.id}`,
      title: data.title,
      cover: data.cover_big || data.cover_medium,
      release_date: data.release_date,
      artist: {
        id: `deezer_artist_${data.artist?.id}`,
        name: data.artist?.name,
      },
      tracks: mapDeezerAlbumTracks(data.tracks?.data || [], data)
    }

    const result = { album }
    memoryCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("❌ Error in Deezer album proxy:", error)
    return NextResponse.json({ error: "Error fetching album data" }, { status: 500 })
  }
}
