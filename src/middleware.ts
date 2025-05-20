import { NextResponse, type NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes: string[] = ["/post/create"]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Get the user session from cookies
  const session = request.cookies.get("session")?.value
  const isAuthenticated = !!session

  // Check if current path is in protected routes (or is a sub-path)
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )

  // Check if user is trying to access login/signup while already authenticated
  const isAuthRoute = path === "/login" || path === "/signup"

  // Redirect to login if trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to from page if accessing login/signup while authenticated
  if (isAuthRoute && isAuthenticated) {
    const from = request.nextUrl.searchParams.get("from")
    return NextResponse.redirect(new URL(from || "/", request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes middleware should run on
// Exclude static files and API routes for better performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images files (png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)",
  ],
}
