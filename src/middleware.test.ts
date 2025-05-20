import { middleware } from "./middleware"
import { NextRequest, NextResponse } from "next/server"
import { describe, expect, it, vi, beforeEach, Mock } from "vitest"

// Mock Next.js response methods
vi.mock("next/server", async () => {
  const actual =
    await vi.importActual<typeof import("next/server")>("next/server")
  return {
    ...actual,
    NextResponse: {
      redirect: vi
        .fn()
        .mockImplementation((url) => ({ redirected: true, url })),
      next: vi.fn().mockReturnValue({ next: true }),
    },
  }
})

describe("Middleware", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to create mock requests
  function createMockRequest(
    path: string,
    isAuthenticated: boolean = false
  ): NextRequest {
    const url = `https://example.com${path}`
    const request = {
      nextUrl: new URL(url),
      url,
      cookies: {
        get: vi.fn((name: string) => {
          if (name === "session" && isAuthenticated) {
            return { value: "session-token" }
          }
          return undefined
        }),
      },
    } as unknown as NextRequest
    return request
  }

  // Test cases
  it("should allow access to non-protected routes for non-authenticated users", () => {
    const req = createMockRequest("/about")
    middleware(req)
    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it("should allow access to non-protected routes for authenticated users", () => {
    const req = createMockRequest("/about", true)
    middleware(req)
    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it("should allow access to login page for non-authenticated users", () => {
    const req = createMockRequest("/login")
    middleware(req)
    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it("should redirect authenticated users from login page to from page where they were", () => {
    const req = createMockRequest("/login?from=/about", true)
    middleware(req)
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.any(URL))
    expect(NextResponse.next).not.toHaveBeenCalled()
    const redirectUrl = (NextResponse.redirect as Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe("/about")
  })

  it("should redirect authenticated users from signup page to from page where they were", () => {
    const req = createMockRequest("/signup", true)
    middleware(req)
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.any(URL))
    expect(NextResponse.next).not.toHaveBeenCalled()
    const redirectUrl = (NextResponse.redirect as Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe("/")
  })

  it("should redirect non-authenticated users from protected routes to login page", () => {
    const req = createMockRequest("/post/create")
    middleware(req)
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.any(URL))
    expect(NextResponse.next).not.toHaveBeenCalled()
    const redirectUrl = (NextResponse.redirect as Mock).mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe("/login")
    expect(redirectUrl.searchParams.get("from")).toBe("/post/create")
  })

  it("should allow access to protected routes for authenticated users", () => {
    const req = createMockRequest("/post/create", true)
    middleware(req)
    expect(NextResponse.next).toHaveBeenCalled()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })
})
