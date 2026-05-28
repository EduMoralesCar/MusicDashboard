import { NextResponse } from "next/server"
import { createLogoutCookie } from "@/lib/jwt"

export async function POST() {
  try {
    const logoutCookie = createLogoutCookie()
    
    const response = NextResponse.json(
      { message: "Sesión cerrada correctamente." },
      { status: 200 }
    )

    response.headers.set("Set-Cookie", logoutCookie)
    return response
  } catch (error: any) {
    console.error("❌ Error en cierre de sesión:", error)
    return NextResponse.json(
      { error: "Ocurrió un error al cerrar sesión." },
      { status: 500 }
    )
  }
}
