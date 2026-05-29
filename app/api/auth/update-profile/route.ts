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
    const { username, avatar } = body

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: "El nombre de usuario debe tener al menos 3 caracteres." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Build the update object
    const updateData: any = { username: username.trim() }
    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: payload.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: "Perfil actualizado con éxito.",
        user: {
          username: updatedUser.username,
          email: updatedUser.email,
          isVerified: updatedUser.isVerified,
          likedTracks: updatedUser.likedTracks || [],
          avatar: updatedUser.avatar || "",
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Error en update-profile:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al actualizar el perfil." },
      { status: 500 }
    )
  }
}
