import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { signToken, createSessionCookie } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos (correo, código, nueva contraseña) son obligatorios." },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      )
    }

    // Check if recovery code matches
    if (!user.resetCode || user.resetCode !== code.trim()) {
      return NextResponse.json(
        { error: "El código de recuperación es incorrecto." },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (user.resetCodeExpires && new Date() > user.resetCodeExpires) {
      return NextResponse.json(
        { error: "El código de recuperación ha expirado. Por favor solicita uno nuevo." },
        { status: 400 }
      )
    }

    // Hashing new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Save user changes
    user.passwordHash = newPasswordHash
    user.resetCode = undefined
    user.resetCodeExpires = undefined
    // If the account was somehow unverified, verifying it now makes sense
    user.isVerified = true
    await user.save()

    // Sign JWT session to auto-login
    const token = signToken({ userId: user._id.toString(), email: user.email })
    const cookie = createSessionCookie(token)

    const response = NextResponse.json(
      {
        message: "Contraseña restablecida con éxito e inicio de sesión automático.",
        user: {
          username: user.username,
          email: user.email,
          isVerified: true,
          likedTracks: user.likedTracks,
        },
      },
      { status: 200 }
    )

    response.headers.set("Set-Cookie", cookie)

    return response
  } catch (error: any) {
    console.error("❌ Error al restablecer contraseña:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al restablecer tu contraseña." },
      { status: 500 }
    )
  }
}
