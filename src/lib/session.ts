"use server"

import { cookies } from "next/headers"

// Type definition for the session data
type SessionData = {
  userId: string
  email: string
  name: string
}

/**
 * Sets a session cookie with user information
 */
export async function createSession(userData: SessionData): Promise<void> {
  // In a real app, you would encrypt this data
  // For now, we'll just store it as a JSON string
  const sessionValue = JSON.stringify(userData)

  // Set the session cookie
  const cookieStore = await cookies()
  cookieStore.set({
    name: "session",
    value: sessionValue,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
  })
}

/**
 * Removes the session cookie to log the user out
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

/**
 * Gets the current session from the cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")

  if (!sessionCookie?.value) {
    return null
  }

  try {
    // In a real app, you would decrypt this data
    return JSON.parse(sessionCookie.value) as SessionData
  } catch {
    return null
  }
}
