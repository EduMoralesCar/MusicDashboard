import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the session cookie
  const sessionToken = request.cookies.get("eumora_session")

  // Define public paths that shouldn't require authentication
  const isAuthPage = pathname.startsWith("/auth")
  const isAuthApi = pathname.startsWith("/api/auth/login") ||
                    pathname.startsWith("/api/auth/register") ||
                    pathname.startsWith("/api/auth/verify") ||
                    pathname.startsWith("/api/auth/forgot-password") ||
                    pathname.startsWith("/api/auth/reset-password") ||
                    pathname.startsWith("/api/auth/resend-otp")

  // Let other API routes, public assets, or _next static files pass through
  const isStaticFile = pathname.includes(".") || pathname.startsWith("/_next")

  // If user is trying to access auth page but is already logged in, redirect to home
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If user is NOT logged in and is trying to access a protected page, redirect to auth page
  if (!sessionToken && !isAuthPage && !isAuthApi && !isStaticFile && pathname !== "/favicon.ico") {
    // Redirect to the login/register screen
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  return NextResponse.next()
}

// Config to specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login, api/auth/register, api/auth/verify, api/auth/forgot-password, api/auth/reset-password
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
