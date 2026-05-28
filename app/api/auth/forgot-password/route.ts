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

    // Generate a 6-digit OTP code for password recovery
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

    user.resetCode = resetCode
    user.resetCodeExpires = resetCodeExpires
    await user.save()

    // Send the email with the OTP code
    await sendOtpEmail({
      to: email,
      subject: "Recupera tu contraseña - Eumora Music",
      title: "Recuperación de Contraseña",
      message: "Has solicitado restablecer tu contraseña. Usa el siguiente código de seguridad de 6 dígitos:",
      code: resetCode,
      buttonText: "Restablecer Contraseña",
    })

    return NextResponse.json(
      { message: "Código de recuperación enviado al correo.", email: user.email },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Error en solicitud de recuperación:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al procesar la solicitud." },
      { status: 500 }
    )
  }
}
