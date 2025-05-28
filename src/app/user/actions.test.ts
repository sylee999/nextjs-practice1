import { beforeEach, describe, expect, Mock, test, vi } from "vitest"

import { createUserAction } from "./actions"

// Mock Next.js server functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
  })),
}))

// Mock the auth actions
vi.mock("../auth/actions", () => ({
  fetchLoginUser: vi.fn(),
  checkAuth: vi.fn(),
  logout: vi.fn(),
}))

describe("createUser", () => {
  const mockFormData = new FormData()
  mockFormData.append("avatar", "https://example.com/avatar.jpg")
  mockFormData.append("name", "Test User")
  mockFormData.append("email", "test@example.com")
  mockFormData.append("password", "password")

  const mockState = {
    message: "",
  }

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.MOCKAPI_TOKEN = "test-token"
  })

  test("creates user successfully", async () => {
    // Mock the fetch call
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ id: "1", ...Object.fromEntries(mockFormData) }),
    })

    // Mock fetchLoginUser
    const { fetchLoginUser } = await import("../auth/actions")
    ;(fetchLoginUser as Mock).mockResolvedValueOnce({
      id: "1",
      email: "test@example.com",
      password: "password",
      name: "Test User",
      avatar: "https://example.com/avatar.jpg",
      createdAt: new Date().toISOString(),
    })

    const result = await createUserAction(mockState, mockFormData)

    // Get the actual call arguments
    const fetchCall = (fetch as Mock).mock.calls[0]
    const [url, options] = fetchCall

    expect(url).toBe("https://test-token.mockapi.io/api/v1/users")
    expect(options.method).toBe("POST")
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
    })

    // Parse the body and check its contents
    const body = JSON.parse(options.body)
    expect(body).toEqual(
      expect.objectContaining({
        avatar: "https://example.com/avatar.jpg",
        name: "Test User",
        email: "test@example.com",
        password: "password",
        createdAt: expect.any(String),
      })
    )

    // Verify the result
    expect(result).toEqual({
      message: "success",
      id: "1",
    })

    // Verify that fetchLoginUser was called with correct parameters
    expect(fetchLoginUser).toHaveBeenCalledWith("test@example.com", "password")
  })

  test("handles API error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    })

    const result = await createUserAction(mockState, mockFormData)

    expect(result).toEqual({
      id: "",
      message: "Failed to create user: 400 Bad Request",
    })
  })

  test("handles missing API token", async () => {
    delete process.env.MOCKAPI_TOKEN

    const result = await createUserAction(mockState, mockFormData)

    expect(result).toEqual({
      id: "",
      message: "MOCKAPI_TOKEN environment variable is not defined.",
    })
  })
})
