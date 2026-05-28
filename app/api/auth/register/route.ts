import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { sendOtpEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Validations
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos (usuario, correo, contraseña) son obligatorios." },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "El nombre de usuario debe tener al menos 3 caracteres." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() })
    const existingUserByUsername = await User.findOne({ username })

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          { error: "El correo electrónico ya está registrado e iniciado." },
          { status: 400 }
        )
      } else {
        // If they registered but haven't verified yet, we resend a new OTP and update details
        const passwordHash = await bcrypt.hash(password, 10)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

        existingUserByEmail.username = username
        existingUserByEmail.passwordHash = passwordHash
        existingUserByEmail.verificationCode = verificationCode
        existingUserByEmail.verificationCodeExpires = verificationCodeExpires
        await existingUserByEmail.save()

        await sendOtpEmail({
          to: email,
          subject: "Verifica tu cuenta - Eumora Music",
          title: "¡Bienvenido a Eumora Music!",
          message: "Usa el siguiente código de verificación de 6 dígitos para activar tu cuenta de música:",
          code: verificationCode,
          buttonText: "Verificar Cuenta",
        })

        return NextResponse.json(
          { message: "Usuario pre-existente actualizado. Código OTP enviado.", email: existingUserByEmail.email },
          { status: 200 }
        )
      }
    }

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "El nombre de usuario ya está en uso." },
        { status: 400 }
      )
    }

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10)

    // Generate 6-digit OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 mins

    // Create user in inactive status
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      passwordHash,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
      likedTracks: [],
    })

    await newUser.save()

    // Send the email with the OTP code
    await sendOtpEmail({
      to: email,
      subject: "Verifica tu cuenta - Eumora Music",
      title: "¡Bienvenido a Eumora Music!",
      message: "Usa el siguiente código de verificación de 6 dígitos para activar tu cuenta de música:",
      code: verificationCode,
      buttonText: "Verificar Cuenta",
    })

    return NextResponse.json(
      { message: "Registro exitoso. Se ha enviado un código de verificación por correo.", email: newUser.email },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Error en registro:", error)
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al registrar el usuario." },
      { status: 500 }
    )
  }
}
