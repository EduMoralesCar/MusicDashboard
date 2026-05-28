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

// GET: List all custom playlists of the logged-in user
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    return NextResponse.json({ playlists: user.playlists || [] })
  } catch (error) {
    console.error("❌ Error fetching playlists:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// POST: Create a new custom playlist
export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "El nombre de la playlist es obligatorio." }, { status: 400 })
    }

    // Initialize custom playlists array if undefined
    if (!user.playlists) {
      user.playlists = []
    }

    // Add new playlist object (MongoDB automatically assigns an _id to sub-documents in arrays)
    user.playlists.push({
      name,
      description: description || "Tu playlist personalizada",
      tracks: []
    } as any)

    await user.save()

    return NextResponse.json({
      message: "Playlist creada correctamente.",
      playlists: user.playlists
    })
  } catch (error) {
    console.error("❌ Error creating playlist:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// DELETE: Remove a playlist
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Falta el ID de la playlist." }, { status: 400 })
    }

    user.playlists = user.playlists.filter(p => p._id.toString() !== id)
    await user.save()

    return NextResponse.json({
      message: "Playlist eliminada correctamente.",
      playlists: user.playlists
    })
  } catch (error) {
    console.error("❌ Error deleting playlist:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
