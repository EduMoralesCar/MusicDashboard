import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { verifyToken } from "@/lib/jwt"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("eumora_session")

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "No autenticado. Por favor inicia sesión." },
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

    await connectToDatabase()

    const user = await User.findById(payload.userId)

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        user: {
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          likedTracks: user.likedTracks || [],
          avatar: user.avatar || "",
          followedArtists: user.followedArtists || [],
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Error en endpoint /me:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al obtener el perfil de usuario." },
      { status: 500 }
    )
  }
}
