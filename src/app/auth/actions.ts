"use server"

import { cookies } from "next/headers"

import { getUserApiUrl } from "@/lib/api"
import { User } from "@/types/user"

// Types should be moved to /types if reused elsewhere
export type LoginState = {
  success: boolean
  message: string
  id?: string
}

export type LogoutState = {
  success: boolean
  message: string
}

/**
 * Handles user login: validates credentials, sets session cookie.
 */
export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState & { from: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const from = (formData.get("from") as string) || "/user"

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required.",
      from,
    }
  }

  try {
    const user = await fetchLoginUser(email, password)

    // Set session cookie (Server Action)
    const cookieStore = await cookies()
    cookieStore.set({
      name: "session",
      value: JSON.stringify(user),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    return {
      success: true,
      message: "Login successful",
      from,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred during login.",
      from,
    }
  }
}

/**
 * Fetches user by email and validates password.
 * Throws error if invalid.
 */
export async function fetchLoginUser(
  email: string,
  password: string
): Promise<User> {
  const apiUrl = getUserApiUrl()
  const response = await fetch(`${apiUrl}?email=${encodeURIComponent(email)}`)

  if (!response.ok) {
    throw new Error("Login failed. Please try again.")
  }

  const users: User[] = await response.json()
  const user = users[0]

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.")
  }

  return user
}

/**
 * Logs out the user by deleting the session cookie.
 */
export async function logout(): Promise<LogoutState> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")
    return {
      success: true,
      message: "Logout successful",
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred during logout.",
    }
  }
}

/**
 * Checks authentication by reading the session cookie.
 */
export async function checkAuth(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")
    if (!sessionCookie?.value) return null
    // In a real app, verify session token and fetch user from DB
    return JSON.parse(sessionCookie.value)
  } catch (error) {
    console.error("Check auth error:", error)
    return null
  }
}
