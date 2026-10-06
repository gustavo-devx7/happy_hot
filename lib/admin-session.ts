import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "node:crypto"

const ADMIN_COOKIE_NAME = "admin_session"
const ADMIN_PASSWORD = "!15Admin07!"

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error("SESSION_SECRET não configurada")
  }

  return secret
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex")
}

function createAdminSessionToken(expiresAt: Date) {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Math.floor(expiresAt.getTime() / 1000),
    })
  ).toString("base64url")

  return `${payload}.${signValue(payload)}`
}

function readAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null
  }

  const [payload, signature] = token.split(".")

  if (!payload || !signature) {
    return null
  }

  const expectedSignature = signValue(payload)
  const provided = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as {
      role?: string
      exp?: number
    }

    if (parsed.role !== "admin" || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return { role: "admin" as const }
  } catch {
    return null
  }
}

export function isValidAdminPassword(password: string) {
  return password === ADMIN_PASSWORD
}

export async function setAdminSession() {
  const cookieStore = await cookies()

  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(new Date(Date.now() + 1000 * 60 * 60 * 12)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  const session = readAdminSessionToken(rawToken)

  if (!session && rawToken) {
    cookieStore.delete(ADMIN_COOKIE_NAME)
  }

  return session
}
