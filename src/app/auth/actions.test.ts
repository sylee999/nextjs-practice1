import type { User } from "@/types/user"
import { cookies } from "next/headers"
import { beforeEach, describe, expect, test, vi } from "vitest"
import { getLoginUser, logout } from "./actions"

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
      // Test with missing email
      const formDataNoEmail = new FormData()
      formDataNoEmail.append("password", "password123")
      formDataNoEmail.append("from", "/dashboard")

      const resultNoEmail = await getLoginUser(
        { success: false, message: "" },
        formDataNoEmail
      )

      expect(resultNoEmail).toEqual({
        success: false,
        message: "Email and password are required.",
        from: "/dashboard",
      })

      // Test with missing password
      const formDataNoPassword = new FormData()
      formDataNoPassword.append("email", "test@example.com")
      formDataNoPassword.append("from", "/dashboard")

      const resultNoPassword = await getLoginUser(
        { success: false, message: "" },
        formDataNoPassword
      )

      expect(resultNoPassword).toEqual({
        success: false,
        message: "Email and password are required.",
        from: "/dashboard",
      })
    })

    test("should return error when MOCKAPI_TOKEN is not defined", async () => {
      // Temporarily remove the mock environment variable
      const originalEnv = process.env.MOCKAPI_TOKEN
      vi.stubEnv("MOCKAPI_TOKEN", "")

      // Create form data with required fields
      const formData = new FormData()
      formData.append("email", "test@example.com")
      formData.append("password", "password123")

      const result = await getLoginUser(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "MOCKAPI_TOKEN environment variable is not defined.",
        from: "/user",
      })

      // Restore the mock environment variable
      vi.stubEnv("MOCKAPI_TOKEN", originalEnv || "mockedtoken")
    })

    test("should return error when API request fails", async () => {
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

      const result = await getLoginUser(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "Login failed. Please try again.",
        from: "/user",
      })

      expect(global.fetch).toHaveBeenCalledWith(
        "https://mockedtoken.mockapi.io/api/v1/users?email=test%40example.com"
      )
    })

    test("should return error when user is not found", async () => {
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

      const result = await getLoginUser(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "Invalid email or password.",
        from: "/user",
      })
    })

    test("should return error when password does not match", async () => {
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

      const result = await getLoginUser(
        { success: false, message: "" },
        formData
      )

      expect(result).toEqual({
        success: false,
        message: "Invalid email or password.",
        from: "/user",
      })
    })

    test("should set session cookie and return success when credentials are valid", async () => {
      // Mock user data
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        createdAt: new Date().toISOString(),
        avatar: "https://example.com/avatar.png",
        likeUsers: [],
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

      const result = await getLoginUser(
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
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn().mockReturnValue(undefined),
      })
      const { checkAuth } = await import("./actions")
      const result = await checkAuth()
      expect(result).toBeNull()
    })

    test("should return user object if session cookie is valid", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        createdAt: new Date().toISOString(),
        avatar: "https://example.com/avatar.png",
        likeUsers: [],
      }
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: JSON.stringify(mockUser) }),
      })
      const { checkAuth } = await import("./actions")
      const result = await checkAuth()
      expect(result).toEqual(mockUser)
    })

    test("should return null and log error if session cookie is invalid JSON", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      ;(cookies as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn().mockReturnValue({ value: "not-json" }),
      })
      const { checkAuth } = await import("./actions")
      const result = await checkAuth()
      expect(result).toBeNull()
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })
  })
})
