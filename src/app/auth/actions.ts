"use server"

import { getUserApiUrl } from "@/lib/api"
import { User } from "@/types/user"
import { cookies } from "next/headers"

type LoginState = {
  success: boolean
  message: string
  id?: string
}

export async function loginAction(
  // prevState: LoginState,
  formData: FormData
): Promise<LoginState | never> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required.",
    }
  }

  try {
    // Authenticate user
    const user = await login(email, password)

    // Set session cookie here (inside Server Action)
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
      id: user?.id,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred during login.",
    }
  }
}

export async function login(email: string, password: string) {
  const apiUrl = getUserApiUrl()

  // Fetch users and check credentials
  const response = await fetch(`${apiUrl}?email=${encodeURIComponent(email)}`)
  if (!response.ok) {
    throw new Error("Login failed. Please try again.")
  }

  const users = await response.json()
  const user = users[0]

  // Check if user exists and password matches
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.")
  }

  // Return user to be used in Server Action
  return user
}

type LogoutState = {
  success: boolean
  message: string
}

export async function logout(): Promise<LogoutState> {
  try {
    // Delete the session cookie
    const cookieStore = await cookies()
    cookieStore.delete("session")

    return {
      success: true,
      message: "Logout successful",
    }
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred during logout.",
    }
  }
}

export async function checkAuth(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return null
    }

    // In a real app, you would verify the session token
    // and fetch the user data from your database
    const user = JSON.parse(sessionCookie.value)
    return user
  } catch (error) {
    console.error("Check auth error:", error)
    return null
  }
}
