"use server"

import { cookies } from "next/headers"

type LoginState = {
  success: boolean
  message: string
  from?: string
}

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
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
    const MOCKAPI_TOKEN = process.env.MOCKAPI_TOKEN

    if (!MOCKAPI_TOKEN) {
      throw new Error("MOCKAPI_TOKEN environment variable is not defined.")
    }

    const apiUrl = `https://${MOCKAPI_TOKEN}.mockapi.io/api/v1/users`

    // Fetch users and check credentials
    const response = await fetch(`${apiUrl}?email=${encodeURIComponent(email)}`)
    if (!response.ok) {
      throw new Error("Login failed. Please try again.")
    }

    const users = await response.json()
    const user = users[0]

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return {
        success: false,
        message: "Invalid email or password.",
        from,
      }
    }

    // Create a session
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

    // If successful, send a success response that will trigger a redirect
    return {
      success: true,
      message: "Login successful",
      from,
    }
  } catch (error: unknown) {
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
