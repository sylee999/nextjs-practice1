import { cookies } from "next/headers"
import { beforeEach, describe, expect, test, vi } from "vitest"

import type { User } from "@/types/user"

import { checkAuth, loginAction, logout } from "./actions"

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

// Mock environment variables
vi.stubEnv("MOCKAPI_TOKEN", "mockedtoken")

describe("auth actions", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe("login", () => {
    test("should return error when email or password is missing", async () => {
      // Create form data without email
      const formData = new FormData()
      formData.append("password", "password123")

      const result = await loginAction(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "Email and password are required.",
        from: "/home",
      })
    })

    test("should return error when MOCKAPI_TOKEN is not defined", async () => {
      // Mock environment variable to be undefined
      const originalEnv = process.env.MOCKAPI_TOKEN
      vi.stubEnv("MOCKAPI_TOKEN", "")

      // Create form data with required fields
      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      const result = await loginAction(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message:
          "Configuration error: MOCKAPI_TOKEN environment variable is not defined is not properly configured",
        from: "/home",
      })

      // Restore the mock environment variable
      vi.stubEnv("MOCKAPI_TOKEN", originalEnv || "mockedtoken")
    })

    test("should return error when API request fails", async () => {
      // Set up environment first
      vi.stubEnv("MOCKAPI_TOKEN", "test-token")

      // Mock global fetch to simulate a failed API request
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
      )

      // Create form data with required fields
      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      const result = await loginAction(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "Login failed. Please try again.",
        from: "/home",
      })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/users?email=test%40example.com"
      )
    })

    test("should return error when user is not found", async () => {
      // Set up environment first
      vi.stubEnv("MOCKAPI_TOKEN", "test-token")

      // Mock global fetch to simulate an empty response (user not found)
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      )

      // Create form data with required fields
      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      const result = await loginAction(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "Invalid email or password.",
        from: "/home",
      })
    })

    test("should return error when password does not match", async () => {
      // Set up environment first
      vi.stubEnv("MOCKAPI_TOKEN", "test-token")

      // Mock global fetch to simulate a user with different password
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: "1",
                email: "test@example.com",
                password: "different_password",
              },
            ]),
        })
      )

      // Create form data with required fields
      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      const result = await loginAction(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "Invalid email or password.",
        from: "/home",
      })
    })

    test("should set session cookie and return success when credentials are valid", async () => {
      // Set up environment first
      vi.stubEnv("MOCKAPI_TOKEN", "test-token")

      // Mock user data
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        createdAt: new Date().toISOString(),
        avatar: "https://example.com/avatar.png",
        bookmarkedPosts: [],
      }

      // Mock global fetch to return a valid user
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockUser]),
        })
      )

      // Mock cookie store
      const mockSet = vi.fn()
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        set: mockSet,
      })

      // Create form data with required fields
      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")
      formData.append("from", "/dashboard")

      const result = await loginAction(
        { success: false, message: "" },
        formData
      )

      // Verify cookie was set with user data
      expect(mockSet).toHaveBeenCalledWith({
        name: "session",
        value: JSON.stringify(mockUser),
        httpOnly: true,
        path: "/",
        secure: false, // NODE_ENV is not 'production' in test
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      })

      // Verify success response
      expect(result).toEqual({
        success: true,
        message: "Login successful",
        id: "1",
        from: "/dashboard",
      })
    })
  })

  describe("logout", () => {
    test("should delete session cookie and return success", async () => {
      // Mock cookie store
      const mockDelete = vi.fn()
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: mockDelete,
      })

      const result = await logout()

      // Verify cookie was deleted
      expect(mockDelete).toHaveBeenCalledWith("session")

      // Verify success response
      expect(result).toEqual({
        success: true,
        message: "Logout successful",
      })
    })

    test("should return error when deleting cookie fails", async () => {
      // Mock cookie store to throw an error
      const mockDelete = vi.fn().mockImplementationOnce(() => {
        throw new Error("Failed to delete cookie")
      })
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        delete: mockDelete,
      })

      const result = await logout()

      // Verify error response
      expect(result).toEqual({
        success: false,
        message: "Failed to delete cookie",
      })
    })
  })

  describe("checkAuth", () => {
    test("should return null if there is no session cookie", async () => {
      // Mock cookie store to return undefined session
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      })

      const result = await checkAuth()

      expect(result).toBe(null)
    })

    test("should return user object if session cookie is valid", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date().toISOString(),
        avatar: "https://example.com/avatar.png",
        bookmarkedPosts: [],
      }

      // Mock cookie store to return valid session
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn().mockReturnValue({
          value: JSON.stringify(mockUser),
        }),
      })

      const result = await checkAuth()

      expect(result).toEqual(mockUser)
    })

    test("should return null and log error if session cookie is invalid JSON", async () => {
      // Mock console.error to capture error logs
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      // Mock cookie store to return invalid JSON
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn().mockReturnValue({
          value: "invalid-json",
        }),
      })

      const result = await checkAuth()

      expect(result).toBe(null)
      expect(consoleSpy).toHaveBeenCalledWith(
        "Check auth error:",
        expect.any(Error)
      )

      // Restore console.error
      consoleSpy.mockRestore()
    })
  })
})
