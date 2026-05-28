import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ data: [] })
    }

    // Call Deezer API server-side
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`, {
      headers,
      next: { revalidate: 300 } // cache for 5 minutes
    })

    if (!res.ok) {
      throw new Error(`Deezer API returned status ${res.status}`)
    }

    const data = await res.json()
    const tracks = data.data || []

    // Map Deezer tracks to compatible AudiusTrack schema
    const mappedTracks = tracks.map((track: any) => ({
      id: `deezer_${track.id}`, // prefix with deezer_
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

    return NextResponse.json({ data: mappedTracks })
  } catch (error: any) {
    console.error("❌ Error in Deezer search proxy:", error)
    return NextResponse.json({ error: "Error searching official music" }, { status: 500 })
  }
}
