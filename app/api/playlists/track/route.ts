import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"

// Helper to authenticate user from session cookie
async function getAuthUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("eumora_session")

  if (!sessionCookie) return null

  const payload = verifyToken(sessionCookie.value)
  if (!payload) return null

  await connectToDatabase()
  return await User.findById(payload.userId)
}

// POST: Add a track to a custom playlist
export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { playlistId, track } = await request.json()

    if (!playlistId || !track || !track.id) {
      return NextResponse.json({ error: "Faltan datos requeridos (playlistId o track)." }, { status: 400 })
    }

    // Find the specific playlist
    const playlist = user.playlists.find(p => p._id.toString() === playlistId)

    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada." }, { status: 404 })
    }

    // Prevent duplicates in the playlist
    const exists = playlist.tracks.some((t: any) => t && t.id === track.id)
    if (exists) {
      return NextResponse.json({ message: "La canción ya está en esta playlist.", playlists: user.playlists })
    }

    // Add track to playlist
    playlist.tracks.push(track)
    await user.save()

    return NextResponse.json({
      message: "Canción añadida a la playlist.",
      playlists: user.playlists
    })
  } catch (error) {
    console.error("❌ Error adding track to playlist:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// DELETE: Remove a track from a custom playlist
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("playlistId")
    const trackId = searchParams.get("trackId")

    if (!playlistId || !trackId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos (playlistId o trackId)." }, { status: 400 })
    }

    // Find the specific playlist
    const playlist = user.playlists.find(p => p._id.toString() === playlistId)

    if (!playlist) {
      return NextResponse.json({ error: "Playlist no encontrada." }, { status: 404 })
    }

    // Remove the track
    playlist.tracks = playlist.tracks.filter((t: any) => t && t.id !== trackId)
    await user.save()

    return NextResponse.json({
      message: "Canción eliminada de la playlist.",
      playlists: user.playlists
    })
  } catch (error) {
    console.error("❌ Error removing track from playlist:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
