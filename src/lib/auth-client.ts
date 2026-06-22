"use client"

const sessionKey = "jidah_admin_session"

export function isLoggedIn() {
  if (typeof window === "undefined") return false
  const raw = window.localStorage.getItem(sessionKey)
  if (!raw) return false

  try {
    const session = JSON.parse(raw) as { expiresAt?: number }
    return Boolean(session.expiresAt && session.expiresAt > Date.now())
  } catch {
    return false
  }
}

export function loginSession(username: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    sessionKey,
    JSON.stringify({
      username,
      expiresAt: Date.now() + 1000 * 60 * 60 * 12,
    }),
  )
}

export function logoutSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(sessionKey)
}
