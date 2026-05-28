import { NextResponse } from "next/server"

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
      "150x150": track.album?.cover_medium || track.album?.cover_small || "",
      "480x480": track.album?.cover_big || track.album?.cover_medium || "",
      "1000x1000": track.album?.cover_xl || track.album?.cover_big || "",
    },
    user: {
      id: `deezer_artist_${track.artist?.id}`,
      handle: track.artist?.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "",
      name: track.artist?.name || "",
      profile_picture: {
        "150x150": track.artist?.picture_medium || track.artist?.picture_small || "",
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
    const type = searchParams.get("type") || "details" // details, top, albums

    if (!id) {
      return NextResponse.json({ error: "Missing artist ID" }, { status: 400 })
    }

    let url = `https://api.deezer.com/artist/${id}`
    
    if (type === "top") {
      try {
        // Fetch artist official name first to query up to 300 songs using specific artist filter
        const artistRes = await fetch(`https://api.deezer.com/artist/${id}`, { headers })
        if (artistRes.ok) {
          const artistData = await artistRes.json()
          if (artistData.name) {
            url = `https://api.deezer.com/search?q=artist:"${encodeURIComponent(artistData.name)}"\&limit=300`
          } else {
            url = `https://api.deezer.com/artist/${id}/top?limit=150`
          }
        } else {
          url = `https://api.deezer.com/artist/${id}/top?limit=150`
        }
      } catch (err) {
        url = `https://api.deezer.com/artist/${id}/top?limit=150`
      }
    } else if (type === "albums") {
      url = `https://api.deezer.com/artist/${id}/albums?limit=100`
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 } // cache for 1 hour
    })

    if (!res.ok) {
      throw new Error(`Deezer API returned status ${res.status}`)
    }

    const data = await res.json()

    if (type === "details") {
      return NextResponse.json({
        artist: {
          id: `deezer_artist_${data.id}`,
          name: data.name,
          picture: data.picture_xl || data.picture_big || data.picture_medium,
          followers: data.nb_fan,
          albumsCount: data.nb_album,
        }
      })
    } else if (type === "top") {
      return NextResponse.json({ data: mapDeezerTracks(data.data || []) })
    } else if (type === "albums") {
      // Map albums
      const mappedAlbums = (data.data || []).map((album: any) => ({
        id: `deezer_album_${album.id}`,
        title: album.title,
        cover: album.cover_medium,
        release_date: album.release_date,
        genre: "Album"
      }))
      return NextResponse.json({ data: mappedAlbums })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error: any) {
    console.error("❌ Error in Deezer artist proxy:", error)
    return NextResponse.json({ error: "Error fetching artist data" }, { status: 500 })
  }
}
