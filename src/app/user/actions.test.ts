import { beforeEach, describe, expect, test, vi, type Mock } from "vitest"

import { createUserAction, deleteUserAction, updateUserAction } from "./actions"

// Mock the auth actions
vi.mock("../auth/actions", () => ({
  checkAuth: vi.fn(),
}))

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// Mock environment
vi.stubEnv("MOCKAPI_TOKEN", "test-token")

// Mock Next.js headers (cookies)
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: vi.fn(),
      delete: vi.fn(),
    })
  ),
}))

describe("createUser", () => {
  const mockState = { message: "", success: false }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  test("creates user successfully", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "1" }),
    })

    const mockFormData = new FormData()
    mockFormData.append("name", "Test User")
    mockFormData.append("email", "test@example.com")
    mockFormData.append("password", "password")
    mockFormData.append("avatar", "https://example.com/avatar.jpg")

    // Should throw NEXT_REDIRECT error
    await expect(createUserAction(mockState, mockFormData)).rejects.toThrow(
      "NEXT_REDIRECT"
    )

    const fetchCall = (fetch as Mock).mock.calls[0]
    const [url, options] = fetchCall

    expect(url).toBe("https://test-token.mockapi.io/api/v1/users")
    expect(options.method).toBe("POST")
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
    })

    // Parse the body and check its contents
    const body = JSON.parse(options.body)
    expect(body).toEqual({
      avatar: "https://example.com/avatar.jpg",
      email: "test@example.com",
      name: "Test User",
      password: "password",
    })
  })

  test("handles API error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    })

    const mockFormData = new FormData()
    mockFormData.append("name", "Test User")
    mockFormData.append("email", "test@example.com")
    mockFormData.append("password", "password")

    const result = await createUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to create user: Bad Request",
      success: false,
    })
  })

  test("handles missing API token", async () => {
    vi.stubEnv("MOCKAPI_TOKEN", "")

    const mockFormData = new FormData()
    mockFormData.append("name", "Test User")
    mockFormData.append("email", "test@example.com")
    mockFormData.append("password", "password")

    const result = await createUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to create user",
      success: false,
    })

    // Restore environment
    vi.stubEnv("MOCKAPI_TOKEN", "test-token")
  })
})

describe("updateUserAction", () => {
  const mockState = { message: "", success: false }
  const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
  const mockExistingUser = {
    id: "1",
    name: "Original Name",
    email: "test@example.com",
    likeUsers: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  test("updates user successfully with password", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock getUser and then updateUser
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "1" }),
      })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")
    mockFormData.append("email", "updated@example.com")
    mockFormData.append("password", "newpassword")
    mockFormData.append("avatar", "https://example.com/new-avatar.jpg")

    // Should throw NEXT_REDIRECT error
    await expect(updateUserAction(mockState, mockFormData)).rejects.toThrow(
      "NEXT_REDIRECT"
    )

    // Check the second fetch call (the PUT request)
    const putCall = (fetch as Mock).mock.calls[1]
    const [url, options] = putCall

    expect(url).toBe("https://test-token.mockapi.io/api/v1/users/1")
    expect(options.method).toBe("PUT")
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
    })
  })

  test("updates user successfully without password", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock getUser and then updateUser
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "1" }),
      })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")
    mockFormData.append("email", "updated@example.com")
    mockFormData.append("avatar", "https://example.com/new-avatar.jpg")

    // Should throw NEXT_REDIRECT error
    await expect(updateUserAction(mockState, mockFormData)).rejects.toThrow(
      "NEXT_REDIRECT"
    )

    // Check the second fetch call (the PUT request)
    const putCall = (fetch as Mock).mock.calls[1]
    const [url, options] = putCall

    expect(url).toBe("https://test-token.mockapi.io/api/v1/users/1")
    expect(options.method).toBe("PUT")
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
    })
  })

  test("handles unauthorized user", async () => {
    const otherUser = {
      id: "2",
      name: "Other User",
      email: "other@example.com",
    }

    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(otherUser)

    // Mock getUser
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExistingUser),
    })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")

    const result = await updateUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "You can only update your own profile",
      success: false,
    })
  })

  test("handles unauthenticated user", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(null)

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")

    const result = await updateUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "You must be logged in to update a user",
      success: false,
    })
  })

  test("handles missing required fields", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    const incompleteFormData = new FormData()
    // Missing ID
    incompleteFormData.append("name", "Updated Name")

    const result = await updateUserAction(mockState, incompleteFormData)

    expect(result).toEqual({
      message: "User ID is required",
      success: false,
    })
  })

  test("handles API error", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock getUser to fail
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")

    const result = await updateUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to fetch user: Bad Request",
      success: false,
    })
  })

  test("handles missing API token", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    vi.stubEnv("MOCKAPI_TOKEN", "")

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")

    const result = await updateUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to update user",
      success: false,
    })

    // Restore environment
    vi.stubEnv("MOCKAPI_TOKEN", "test-token")
  })

  test("handles network error", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock fetch to throw a network error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"))

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")

    const result = await updateUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to update user",
      success: false,
    })
  })

  test("handles generic error", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock fetch to throw a generic error
    global.fetch = vi.fn().mockRejectedValueOnce("Unknown error")

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "Updated Name")

    const result = await updateUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to update user",
      success: false,
    })
  })
})

describe("deleteUserAction", () => {
  const mockState = { message: "", success: false }
  const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
  const mockExistingUser = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    likeUsers: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  test("deletes user successfully and redirects", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock getUser and then deleteUser
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: true,
      })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    // Should throw NEXT_REDIRECT error (redirect to /user)
    await expect(deleteUserAction(mockState, mockFormData)).rejects.toThrow(
      "NEXT_REDIRECT"
    )

    // Check the second fetch call (the DELETE request)
    const deleteCall = (fetch as Mock).mock.calls[1]
    const [url, options] = deleteCall

    expect(url).toBe("https://test-token.mockapi.io/api/v1/users/1")
    expect(options.method).toBe("DELETE")
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
    })

    // Cookie logout is handled automatically in the action
  })

  test("handles unauthorized user", async () => {
    const otherUser = {
      id: "2",
      name: "Other User",
      email: "other@example.com",
    }

    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(otherUser)

    // Mock getUser
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExistingUser),
    })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const result = await deleteUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "You can only delete your own account",
      success: false,
    })
  })

  test("handles unauthenticated user", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(null)

    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const result = await deleteUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "You must be logged in to delete a user",
      success: false,
    })
  })

  test("handles missing user ID", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    const mockFormData = new FormData()
    // Missing ID

    const result = await deleteUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "User ID is required",
      success: false,
    })
  })

  test("handles user not found", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock getUser to return 404 (user not found)
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const result = await deleteUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "User with id '1' not found",
      success: false,
    })
  })

  test("handles API error on delete", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock getUser and then deleteUser with error
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const result = await deleteUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to delete user: Internal Server Error",
      success: false,
    })
  })

  test("handles API 404 error on delete", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock getUser and then deleteUser with 404
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const result = await deleteUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "User with id '1' not found",
      success: false,
    })
  })

  test("handles network error", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock fetch to throw a network error
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"))

    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const result = await deleteUserAction(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to delete user",
      success: false,
    })
  })
})
