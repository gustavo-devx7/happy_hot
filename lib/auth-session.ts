import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "node:crypto"

const SESSION_COOKIE_NAME = "customer_session"
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

export function createSessionToken(email: string, expiresAt: Date) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Math.floor(expiresAt.getTime() / 1000),
    })
  ).toString("base64url")

  const signature = signValue(payload)
  return `${payload}.${signature}`
}

export function readSessionToken(token: string | undefined) {
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
      email?: string
      exp?: number
    }

    if (!parsed.email || !parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return { email: parsed.email }
  } catch {
    return null
  }
}

export async function setCustomerSession(email: string, expiresAt: Date) {
  const cookieStore = await cookies()
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))

  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(email, expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  })
}

export async function clearCustomerSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCustomerSession() {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = readSessionToken(rawToken)

  if (!session && rawToken) {
    cookieStore.delete(SESSION_COOKIE_NAME)
  }

  return session
}
