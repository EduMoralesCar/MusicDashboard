import { NextResponse } from "next/server"

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

    const res = await fetch(`https://api.deezer.com/album/${id}`, {
      headers,
      next: { revalidate: 3600 } // cache for 1 hour
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

    return NextResponse.json({ album })
  } catch (error: any) {
    console.error("❌ Error in Deezer album proxy:", error)
    return NextResponse.json({ error: "Error fetching album data" }, { status: 500 })
  }
}
