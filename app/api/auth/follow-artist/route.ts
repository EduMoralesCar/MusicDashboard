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
    const { artistId, name, photo, action } = body

    if (!artistId || !name || !action) {
      return NextResponse.json(
        { error: "Solicitud no válida. Se requiere artistId, name y action." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    let updatedUser

    if (action === "follow") {
      // Add artist atomically if not already followed
      const artistObj = { id: artistId, name, photo }
      updatedUser = await User.findOneAndUpdate(
        { _id: payload.userId, "followedArtists.id": { $ne: artistId } },
        { $push: { followedArtists: artistObj } },
        { new: true }
      )

      if (!updatedUser) {
        // If null, it means already followed, just retrieve the current user
        updatedUser = await User.findById(payload.userId)
      }
    } else if (action === "unfollow") {
      // Remove artist atomically
      updatedUser = await User.findOneAndUpdate(
        { _id: payload.userId },
        { $pull: { followedArtists: { id: artistId } } },
        { new: true }
      )
    } else {
      return NextResponse.json(
        { error: "Acción inválida. Utiliza 'follow' o 'unfollow'." },
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
      {
        message: action === "follow" ? `Siguiendo a ${name}.` : `Has dejado de seguir a ${name}.`,
        followedArtists: updatedUser.followedArtists || [],
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Error en follow-artist:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al procesar la solicitud." },
      { status: 500 }
    )
  }
}
