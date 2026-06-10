import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import { sendOtpEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: "No existe ninguna cuenta registrada con este correo electrónico." },
        { status: 404 }
      )
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "Esta cuenta ya está verificada. Por favor inicia sesión directamente." },
        { status: 400 }
      )
    }

    // Generate a new 6-digit OTP code for verification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

    user.verificationCode = verificationCode
    user.verificationCodeExpires = verificationCodeExpires
    await user.save()

    // Send the email with the OTP code
    await sendOtpEmail({
      to: user.email,
      subject: "Verifica tu cuenta - Eumora Music",
      title: "Verifica tu cuenta",
      message: "Usa el siguiente código de verificación de 6 dígitos para activar tu cuenta de música:",
      code: verificationCode,
      buttonText: "Verificar Cuenta",
    })

    return NextResponse.json(
      { message: "Código de verificación reenviado con éxito a tu correo." },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Error al reenviar código OTP:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al procesar tu solicitud." },
      { status: 500 }
    )
  }
}
