import { NextResponse } from "next/server"
import { LATAM_HITS } from "@/lib/latam-hits"

// In-memory cache to completely avoid Deezer API rate limits
const memoryCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

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

function mapDeezerAlbums(albums: any[]) {
  return albums.map((album: any) => ({
    id: `deezer_album_${album.id}`,
    title: album.title,
    cover: album.cover_medium || album.cover_big || album.cover,
    artist: {
      id: `deezer_artist_${album.artist?.id || ""}`,
      name: album.artist?.name || "Unknown Artist"
    }
  }))
}

const fallbackAlbumRealIds: Record<string, string> = {
  latam_1: "deezer_album_316164367",
  latam_2: "deezer_album_408659277",
  latam_3: "deezer_album_332352037",
  latam_4: "deezer_album_518463332",
  latam_5: "deezer_album_1222449",
  latam_6: "deezer_album_434457587",
  latam_7: "deezer_album_90802612",
  latam_8: "deezer_album_6755148",
  latam_9: "deezer_album_408659277",
  latam_10: "deezer_album_274810622",
  latam_11: "deezer_album_334996",
  latam_12: "deezer_album_335034",
  latam_13: "deezer_album_824446221",
  latam_14: "deezer_album_395194257",
  latam_15: "deezer_album_716965901",
  latam_16: "deezer_album_123701",
  latam_17: "deezer_album_6736087",
  latam_18: "deezer_album_7441191",
  latam_19: "deezer_album_12920706",
  latam_20: "deezer_album_46566682"
}

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

function extractAlbumsFromTracks(tracks: any[]) {
  const seen = new Set()
  const albums: any[] = []
  for (const t of tracks) {
    const albumId = fallbackAlbumRealIds[t.id] || t.album?.id || `album_${t.id}`
    if (!seen.has(albumId)) {
      seen.add(albumId)
      albums.push({
        id: albumId,
        title: t.album?.title || fallbackAlbumNames[t.id] || `${t.title} (Single)`,
        cover: t.artwork?.["480x480"] || t.artwork?.["150x150"] || "",
        artist: {
          id: t.user?.id || "",
          name: t.user?.name || "Unknown Artist"
        }
      })
    }
  }
  return albums
}

function selectRotatedSubset(items: any[], targetLength: number = 18, step: number = 6) {
  if (items.length <= targetLength) return items

  const date = new Date()
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)

  const maxStart = items.length - targetLength
  const startIndex = (dayOfYear * step) % (maxStart + 1)

  return items.slice(startIndex, startIndex + targetLength)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "trending"

  // Calculate day of the year for rotation
  const date = new Date()
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)

  // Curated lists of rotated search terms to vary content daily
  const queries: Record<string, string[]> = {
    trending: [
      "bad bunny karol g feid shakira peso pluma",
      "j balvin maluma rauw alejandro myke towers ozuna",
      "anuel aa daddy yankee don omar wisin y yandel",
      "rosalia manuel turizo camilo sebastian yatra",
      "bizarrap quevedo duki trueno maria becerra"
    ],
    reggaeton: [
      "reggaeton hits 2026",
      "reggaeton clasicos perreo",
      "urbano latino exitos",
      "reggaeton nuevo flow"
    ],
    rock: [
      "rock en espanol clasicos",
      "soda stereo caifanes mana prisioneros",
      "enanitos verdes hombres g el cuarteto de nos",
      "andres calamaro fito paez spinetta babasonicos"
    ],
    pop: [
      "pop latino hits",
      "pop urbano exitos",
      "baladas pop latino romanticas",
      "pop en espanol actual"
    ],
    mexico: [
      "regional mexicano banda norteño",
      "corridos tumbados peso pluma natanael cano",
      "musica ranchera mariachi exitos",
      "grupo frontera carin leon christian nodal"
    ],
    colombia: [
      "colombia hits pop",
      "vallenato exitos colombianos",
      "cumbia colombiana folklor",
      "carlos vives fonseca juanes shakira"
    ],
    argentina: [
      "rock nacional argentino clasicos",
      "trap argentino duki trueno maria becerra",
      "cumbia argentina cuarteto exitos",
      "los fabulosos cadillacs bersuit autoplay"
    ],
    peru: [
      "cumbia peruana exitos",
      "grupo 5 armonia 10 agua marina",
      "rock peruano pedro suarez-vertiz libido",
      "salsa peruana exitos tondero"
    ]
  }

  const typeQueries = queries[type] || ["latin hits"]
  const queryIndex = dayOfYear % typeQueries.length
  const query = typeQueries[queryIndex]

  const cacheKey = `${type}_${queryIndex}`

  // Check in-memory cache first
  const cached = memoryCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return NextResponse.json({ data: cached.data })
  }

  const getFallbackTracks = () => {
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

  try {
    if (type === "trending") {
      // Fetch tracks for top 6 grid
      let tracks: any[] = []
      try {
        const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=30`, {
          next: { revalidate: 86400 }
        })
        if (res.ok) {
          const data = await res.json()
          tracks = data.data || []
        }
      } catch (e) {
        console.warn("⚠️ Deezer live API search failed, falling back to curated local LATAM hits:", e)
      }

      if (tracks.length === 0) {
        const fallbackList = getFallbackTracks()
        const fallbackResult = fallbackList.length > 0 ? fallbackList : LATAM_HITS
        return NextResponse.json({ data: fallbackResult })
      }

      const mappedResult = mapDeezerTracks(tracks)
      memoryCache.set(cacheKey, { data: mappedResult, timestamp: Date.now() })
      return NextResponse.json({ data: mappedResult })
    } else {
      // Fetch albums for homepage rows
      let albums: any[] = []
      try {
        const res = await fetch(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=35`, {
          next: { revalidate: 86400 }
        })
        if (res.ok) {
          const data = await res.json()
          albums = data.data || []
        }
      } catch (e) {
        console.warn("⚠️ Deezer live API album search failed:", e)
      }

      if (albums.length === 0) {
        const fallbackTracks = getFallbackTracks()
        const fallbackAlbums = extractAlbumsFromTracks(fallbackTracks.length > 0 ? fallbackTracks : LATAM_HITS)
        const rotatedFallback = selectRotatedSubset(fallbackAlbums, 18, 6)
        return NextResponse.json({ data: rotatedFallback })
      }

      const mappedAlbums = mapDeezerAlbums(albums)
      const rotatedAlbums = selectRotatedSubset(mappedAlbums, 18, 6)
      memoryCache.set(cacheKey, { data: rotatedAlbums, timestamp: Date.now() })
      return NextResponse.json({ data: rotatedAlbums })
    }
  } catch (error: any) {
    console.error("❌ Error in Deezer trending proxy GET:", error)
    if (type === "trending") {
      return NextResponse.json({ data: LATAM_HITS })
    } else {
      const fallbackAlbums = extractAlbumsFromTracks(LATAM_HITS)
      return NextResponse.json({ data: selectRotatedSubset(fallbackAlbums, 18, 6) })
    }
  }
}
