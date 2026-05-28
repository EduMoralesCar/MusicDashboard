import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { signToken, createSessionCookie } from "@/lib/jwt"
import { sendOtpEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "El correo electrónico y la contraseña son obligatorios." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: "El correo electrónico o la contraseña son incorrectos." },
        { status: 401 }
      )
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "El correo electrónico o la contraseña son incorrectos." },
        { status: 401 }
      )
    }

    // Check if account is verified
    if (!user.isVerified) {
      // Generate a new OTP code to help them verify easily
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000)

      user.verificationCode = verificationCode
      user.verificationCodeExpires = verificationCodeExpires
      await user.save()

      await sendOtpEmail({
        to: user.email,
        subject: "Verifica tu cuenta - Eumora Music",
        title: "Completa tu registro",
        message: "Tu cuenta aún no está verificada. Usa este código de seguridad para verificar tu cuenta e ingresar:",
        code: verificationCode,
        buttonText: "Verificar Cuenta",
      })

      return NextResponse.json(
        {
          error: "Tu cuenta no está verificada. Hemos enviado un nuevo código OTP a tu correo.",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      )
    }

    // Generate session JWT
    const token = signToken({ userId: user._id.toString(), email: user.email })
    const cookie = createSessionCookie(token)

    const response = NextResponse.json(
      {
        message: "Inicio de sesión exitoso.",
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
    console.error("❌ Error en inicio de sesión:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al iniciar sesión." },
      { status: 500 }
    )
  }
}
