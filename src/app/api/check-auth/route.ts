import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // In a real app, you would verify the session token
    // and fetch the user data from your database
    try {
      const user = JSON.parse(sessionCookie.value)
      return NextResponse.json({
        authenticated: true,
        user,
      })
    } catch {
      // Invalid session format
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
  } catch (error) {
    console.error("Check auth error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
