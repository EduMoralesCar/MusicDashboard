import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { signToken, createSessionCookie } from "@/lib/jwt"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "El correo electrónico y el código de verificación son requeridos." },
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

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Esta cuenta ya ha sido verificada anteriormente. Por favor inicia sesión." },
        { status: 400 }
      )
    }

    // Check if verification code exists and matches
    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      return NextResponse.json(
        { error: "El código de verificación es incorrecto." },
        { status: 400 }
      )
    }

    // Check if code has expired
    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return NextResponse.json(
        { error: "El código de verificación ha expirado. Por favor regístrate de nuevo para obtener otro." },
        { status: 400 }
      )
    }

    // Activate the user
    user.isVerified = true
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    // Generate JWT token for session
    const token = signToken({ userId: user._id.toString(), email: user.email })
    const cookie = createSessionCookie(token)

    const response = NextResponse.json(
      {
        message: "Cuenta verificada con éxito. ¡Bienvenido a Eumora Music!",
        token,
        user: {
          username: user.username,
          email: user.email,
          isVerified: true,
          likedTracks: user.likedTracks,
        },
      },
      { status: 200 }
    )

    // Set JWT cookie so user logs in immediately!
    response.headers.set("Set-Cookie", cookie)

    return response
  } catch (error: any) {
    console.error("❌ Error en verificación OTP:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al verificar el código." },
      { status: 500 }
    )
  }
}
