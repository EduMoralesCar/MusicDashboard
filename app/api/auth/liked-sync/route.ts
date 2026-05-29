import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("eumora_session")

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No autorizado. Por favor inicia sesión." },
        { status: 401 }
      )
    }

    const payload = verifyToken(sessionCookie.value)

    if (!payload) {
      return NextResponse.json(
        { error: "Sesión inválida o expirada. Por favor inicia sesión de nuevo." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { likedTracks, track, action } = body

    await connectToDatabase()

    // Option A: Sync the entire array of track objects from local storage
    if (likedTracks && Array.isArray(likedTracks)) {
      const user = await User.findById(payload.userId)

      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado." },
          { status: 404 }
        )
      }

      // Merge unique tracks by id
      const existingMap = new Map()
      // First, add existing database tracks
      if (Array.isArray(user.likedTracks)) {
        user.likedTracks.forEach((t: any) => {
          if (t && t.id) existingMap.set(t.id, t)
        })
      }
      // Then, add incoming tracks (they take precedence)
      likedTracks.forEach((t: any) => {
        if (t && t.id) existingMap.set(t.id, t)
      })

      const mergedTracks = Array.from(existingMap.values())

      // Use findOneAndUpdate instead of save() to avoid concurrency VersionError (OCC)
      const updatedUser = await User.findOneAndUpdate(
        { _id: payload.userId },
        { $set: { likedTracks: mergedTracks } },
        { new: true }
      )

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Usuario no encontrado al actualizar." },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { message: "Lista de favoritos sincronizada con éxito.", likedTracks: updatedUser.likedTracks },
        { status: 200 }
      )
    }

    // Option B: Add or remove a single track object
    if (track && track.id) {
      let updatedUser

      if (action === "add") {
        // Use atomic push only if track.id is not already in likedTracks
        updatedUser = await User.findOneAndUpdate(
          { _id: payload.userId, "likedTracks.id": { $ne: track.id } },
          { $push: { likedTracks: track } },
          { new: true }
        )

        // If updatedUser is null, it means it already exists, so we just get the current document
        if (!updatedUser) {
          updatedUser = await User.findById(payload.userId)
        }
      } else if (action === "remove") {
        // Use atomic pull to remove track by id
        updatedUser = await User.findOneAndUpdate(
          { _id: payload.userId },
          { $pull: { likedTracks: { id: track.id } } },
          { new: true }
        )
      } else {
        return NextResponse.json(
          { error: "Acción no válida. Utiliza 'add' o 'remove'." },
          { status: 400 }
        )
      }

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Usuario no encontrado." },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { message: `Canción ${action === "add" ? "añadida a" : "eliminada de"} favoritos.`, likedTracks: updatedUser.likedTracks },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: "Solicitud no válida. Debes proporcionar likedTracks o track y action." },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("❌ Error en sincronización de favoritos:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al sincronizar las canciones favoritas." },
      { status: 500 }
    )
  }
}
