import { beforeEach, describe, expect, test, vi, type Mock } from "vitest"

import {
  createUserAction,
  deleteUserAction,
  followUser,
  getFollowersCount,
  getFollowingCount,
  isFollowing,
  unfollowUser,
  updateUserAction,
} from "./actions"

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
      followers: [],
      following: [],
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
    bookmarkedPosts: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  test("updates user successfully with password", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock updated user data that will be returned from API
    const mockUpdatedUser = {
      id: "1",
      name: "Updated Name",
      email: "updated@example.com",
      avatar: "https://example.com/new-avatar.jpg",
      password: "newpassword",
      bookmarkedPosts: [],
    }

    // Mock getUser and then updateUser
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedUser),
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

    // Mock updated user data that will be returned from API (without password)
    const mockUpdatedUserNoPassword = {
      id: "1",
      name: "Updated Name",
      email: "updated@example.com",
      avatar: "https://example.com/new-avatar.jpg",
      bookmarkedPosts: [],
    }

    // Mock getUser and then updateUser
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedUserNoPassword),
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

  test("updates session cookie with new user data", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

    // Mock cookies
    const mockCookieStore = {
      set: vi.fn(),
    }
    const { cookies } = await import("next/headers")
    ;(cookies as Mock).mockResolvedValueOnce(mockCookieStore)

    // Mock updated user data
    const mockUpdatedUser = {
      id: "1",
      name: "New Name",
      email: "newemail@example.com",
      avatar: "https://example.com/new.jpg",
      password: "newpass123",
      bookmarkedPosts: [],
    }

    // Mock getUser and then updateUser
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExistingUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedUser),
      })

    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("name", "New Name")
    mockFormData.append("email", "newemail@example.com")
    mockFormData.append("password", "newpass123")
    mockFormData.append("avatar", "https://example.com/new.jpg")

    // Should throw NEXT_REDIRECT error
    await expect(updateUserAction(mockState, mockFormData)).rejects.toThrow(
      "NEXT_REDIRECT"
    )

    // Verify session cookie was updated with new user data
    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: "session",
      value: JSON.stringify({
        ...mockUser,
        name: "New Name",
        email: "newemail@example.com",
        avatar: "https://example.com/new.jpg",
        password: "newpass123",
      }),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
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
    bookmarkedPosts: [],
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

// ==================================================
// FOLLOW FUNCTIONALITY TESTS - Phase 2
// ==================================================

describe("Follow Helper Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe("isFollowing", () => {
    test("returns true when user is following target", async () => {
      const mockUser = {
        id: "1",
        name: "Current User",
        following: ["2", "3"],
        followers: [],
        bookmarkedPosts: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })

      const result = await isFollowing("1", "2")
      expect(result).toBe(true)
    })

    test("returns false when user is not following target", async () => {
      const mockUser = {
        id: "1",
        name: "Current User",
        following: ["3"],
        followers: [],
        bookmarkedPosts: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })

      const result = await isFollowing("1", "2")
      expect(result).toBe(false)
    })

    test("returns false when user not found", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await isFollowing("1", "2")
      expect(result).toBe(false)
    })

    test("returns false on error", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("API Error"))

      const result = await isFollowing("1", "2")
      expect(result).toBe(false)
    })
  })

  describe("getFollowersCount", () => {
    test("returns correct followers count", async () => {
      const mockUser = {
        id: "1",
        name: "User",
        following: [],
        followers: ["2", "3", "4"],
        bookmarkedPosts: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })

      const result = await getFollowersCount("1")
      expect(result).toBe(3)
    })

    test("returns 0 when user not found", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await getFollowersCount("1")
      expect(result).toBe(0)
    })

    test("returns 0 on error", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("API Error"))

      const result = await getFollowersCount("1")
      expect(result).toBe(0)
    })
  })

  describe("getFollowingCount", () => {
    test("returns correct following count", async () => {
      const mockUser = {
        id: "1",
        name: "User",
        following: ["2", "3"],
        followers: [],
        bookmarkedPosts: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })

      const result = await getFollowingCount("1")
      expect(result).toBe(2)
    })

    test("returns 0 when user not found", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await getFollowingCount("1")
      expect(result).toBe(0)
    })

    test("returns 0 on error", async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("API Error"))

      const result = await getFollowingCount("1")
      expect(result).toBe(0)
    })
  })
})

describe("followUser", () => {
  const mockCurrentUser = {
    id: "1",
    name: "Current User",
    email: "current@example.com",
    following: [],
    followers: [],
    bookmarkedPosts: [],
  }

  const mockTargetUser = {
    id: "2",
    name: "Target User",
    email: "target@example.com",
    following: [],
    followers: [],
    bookmarkedPosts: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  test("follows user successfully", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    // Mock getting both users, then updating both
    global.fetch = vi
      .fn()
      // Get current user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      // Get target user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTargetUser),
      })
      // Update current user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockCurrentUser, following: ["2"] }),
      })
      // Update target user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockTargetUser, followers: ["1"] }),
      })

    const result = await followUser("1", "2")

    expect(result).toEqual({
      message: "Successfully followed user",
      success: true,
    })

    // Verify API calls
    expect(fetch).toHaveBeenCalledTimes(4)

    // Check update calls
    const currentUserUpdateCall = (fetch as Mock).mock.calls[2]
    const targetUserUpdateCall = (fetch as Mock).mock.calls[3]

    expect(currentUserUpdateCall[0]).toBe(
      "https://test-token.mockapi.io/api/v1/users/1"
    )
    expect(currentUserUpdateCall[1].method).toBe("PUT")

    expect(targetUserUpdateCall[0]).toBe(
      "https://test-token.mockapi.io/api/v1/users/2"
    )
    expect(targetUserUpdateCall[1].method).toBe("PUT")
  })

  test("handles already following user", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    const currentUserAlreadyFollowing = {
      ...mockCurrentUser,
      following: ["2"],
    }

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(currentUserAlreadyFollowing),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTargetUser),
      })

    const result = await followUser("1", "2")

    expect(result).toEqual({
      message: "You are already following this user",
      success: false,
    })

    // Should only call get functions, not update
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  test("handles trying to follow self", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    const result = await followUser("1", "1")

    expect(result).toEqual({
      message: "You cannot follow yourself",
      success: false,
    })

    // Should not make any API calls
    expect(fetch).not.toHaveBeenCalled()
  })

  test("handles unauthenticated user", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(null)

    const result = await followUser("1", "2")

    expect(result).toEqual({
      message: "You must be logged in to follow users",
      success: false,
    })
  })

  test("handles unauthorized user", async () => {
    const { checkAuth } = await import("../auth/actions")
    const otherUser = {
      id: "3",
      name: "Other User",
      email: "other@example.com",
    }
    ;(checkAuth as Mock).mockResolvedValueOnce(otherUser)

    const result = await followUser("1", "2")

    expect(result).toEqual({
      message: "You can only perform follow actions for your own account",
      success: false,
    })
  })

  test("handles target user not found", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

    const result = await followUser("1", "2")

    expect(result).toEqual({
      message: "Target user with id '2' not found",
      success: false,
    })
  })

  test("handles rollback when target user update fails", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    global.fetch = vi
      .fn()
      // Get current user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      // Get target user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTargetUser),
      })
      // Update current user (success)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockCurrentUser, following: ["2"] }),
      })
      // Update target user (failure)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
      // Rollback current user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })

    const result = await followUser("1", "2")

    expect(result).toEqual({
      message: "Failed to update target user followers: Internal Server Error",
      success: false,
    })

    // Verify rollback was attempted
    expect(fetch).toHaveBeenCalledTimes(5)
  })
})

describe("unfollowUser", () => {
  const mockCurrentUser = {
    id: "1",
    name: "Current User",
    email: "current@example.com",
    following: ["2"],
    followers: [],
    bookmarkedPosts: [],
  }

  const mockTargetUser = {
    id: "2",
    name: "Target User",
    email: "target@example.com",
    following: [],
    followers: ["1"],
    bookmarkedPosts: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  test("unfollows user successfully", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    global.fetch = vi
      .fn()
      // Get current user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCurrentUser),
      })
      // Get target user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTargetUser),
      })
      // Update current user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockCurrentUser, following: [] }),
      })
      // Update target user
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockTargetUser, followers: [] }),
      })

    const result = await unfollowUser("1", "2")

    expect(result).toEqual({
      message: "Successfully unfollowed user",
      success: true,
    })

    expect(fetch).toHaveBeenCalledTimes(4)
  })

  test("handles not following user", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    const currentUserNotFollowing = {
      ...mockCurrentUser,
      following: [],
    }

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(currentUserNotFollowing),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTargetUser),
      })

    const result = await unfollowUser("1", "2")

    expect(result).toEqual({
      message: "You are not following this user",
      success: false,
    })

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  test("handles trying to unfollow self", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(mockCurrentUser)

    const result = await unfollowUser("1", "1")

    expect(result).toEqual({
      message: "You cannot unfollow yourself",
      success: false,
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  test("handles unauthenticated user", async () => {
    const { checkAuth } = await import("../auth/actions")
    ;(checkAuth as Mock).mockResolvedValueOnce(null)

    const result = await unfollowUser("1", "2")

    expect(result).toEqual({
      message: "You must be logged in to unfollow users",
      success: false,
    })
  })

  test("handles unauthorized user", async () => {
    const { checkAuth } = await import("../auth/actions")
    const otherUser = {
      id: "3",
      name: "Other User",
      email: "other@example.com",
    }
    ;(checkAuth as Mock).mockResolvedValueOnce(otherUser)

    const result = await unfollowUser("1", "2")

    expect(result).toEqual({
      message: "You can only perform unfollow actions for your own account",
      success: false,
    })
  })
})
