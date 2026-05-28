import nodemailer from "nodemailer"

// Create a transporter using environment variables
const getTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "465", 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  // If credentials are placeholder, return null so we can log to console instead of crashing
  if (
    !host ||
    !user ||
    !pass ||
    user.includes("tu_cuenta") ||
    pass.includes("tu_contraseña")
  ) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // True for 465, false for other ports like 587
    auth: {
      user,
      pass,
    },
  })
}

interface EmailOptions {
  to: string
  subject: string
  title: string
  message: string
  code: string
  buttonText: string
}

export async function sendOtpEmail({
  to,
  subject,
  title,
  message,
  code,
  buttonText,
}: EmailOptions) {
  const from = process.env.SMTP_FROM || "Eumora Music <onboarding@resend.dev>"
  const transporter = getTransporter()

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #121212;
            color: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 550px;
            margin: 40px auto;
            background-color: #181818;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            border: 1px solid #282828;
          }
          .header {
            background-color: #000000;
            padding: 30px;
            text-align: center;
            border-bottom: 2px solid #1DB954;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #1DB954;
            letter-spacing: -0.5px;
            text-transform: uppercase;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 20px;
            color: #ffffff;
            letter-spacing: -0.5px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            color: #b3b3b3;
            margin-top: 0;
            margin-bottom: 30px;
          }
          .code-box {
            background-color: #282828;
            border-radius: 8px;
            padding: 20px;
            margin: 20px auto 30px auto;
            display: inline-block;
            border: 1px solid #3e3e3e;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          .code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 6px;
            color: #1DB954;
            margin: 0;
            padding-left: 6px; /* offset letter-spacing for true center */
          }
          .footer {
            background-color: #0a0a0a;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #535353;
            border-top: 1px solid #1c1c1c;
          }
          .footer a {
            color: #1DB954;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="#" class="logo">
              🎵 Eumora Music
            </a>
          </div>
          <div class="content">
            <h1>${title}</h1>
            <p>${message}</p>
            <div class="code-box">
              <h2 class="code">${code}</h2>
            </div>
            <p style="font-size: 13px; color: #727272; margin-bottom: 0;">
              Este código expirará en 15 minutos. Si no solicitaste este correo, por favor ignóralo.
            </p>
          </div>
          <div class="footer">
            &copy; 2026 Eumora Music. Proyecto Académico de Universidad.<br>
            Plataforma libre impulsada por Audius API.
          </div>
        </div>
      </body>
    </html>
  `

  if (!transporter) {
    console.log("\n=======================================================")
    console.log("📨 [SIMULADOR DE EMAIL - CONFIGURACIÓN PENDIENTE]")
    console.log(`Para: ${to}`)
    console.log(`Asunto: ${subject}`)
    console.log(`Código OTP: ${code}`)
    console.log(`Mensaje: ${message}`)
    console.log("Nota: Configura SMTP_USER y SMTP_PASS en .env.local para enviar reales.")
    console.log("=======================================================\n")
    return true
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: htmlContent,
    })
    console.log(`📨 Correo enviado con éxito a ${to}. MessageId: ${info.messageId}`)
    return true
  } catch (error) {
    console.error("❌ Error al enviar el correo SMTP:", error)
    // Fallback: log to console so development isn't blocked by network/auth errors
    console.log("\n⚠️ [FALLBACK] Correo falló por SMTP. Imprimiendo código en consola para pruebas:")
    console.log(`Código OTP para ${to}: ${code}\n`)
    return false
  }
}
