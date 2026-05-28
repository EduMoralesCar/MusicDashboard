import jwt from "jsonwebtoken"
import { serialize } from "cookie"

const JWT_SECRET = process.env.JWT_SECRET || "eumora_music_super_secret_jwt_key_2026_university_project_token_secret"

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // Session lasts 7 days
  })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  } catch (error) {
    return null
  }
}

export function createSessionCookie(token: string) {
  return serialize("eumora_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  })
}

export function createLogoutCookie() {
  return serialize("eumora_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1, // Expire immediately
    path: "/",
  })
}
