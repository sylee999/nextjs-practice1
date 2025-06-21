import { beforeEach, describe, expect, test, vi, type Mock } from "vitest"

import {
  createPostAction,
  deletePostAction,
  getPost,
  getPosts,
  getPostsFromFollowedUsers,
  updatePostAction,
} from "./actions"

// Mock the auth actions
vi.mock("../auth/actions", () => ({
  checkAuth: vi.fn(),
}))

// Mock the user actions
vi.mock("../user/actions", () => ({
  getUser: vi.fn(),
}))

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// Mock environment
vi.stubEnv("MOCKAPI_TOKEN", "test-token")

describe("Post Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe("getPosts", () => {
    test("fetches posts successfully", async () => {
      const mockPosts = [
        {
          id: "1",
          title: "Test Post",
          content: "Test content",
          userId: "1",
          bookmarkedBy: [],
        },
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })

      const result = await getPosts()

      expect(fetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/posts",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      expect(result).toEqual(mockPosts)
    })

    test("handles API error gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      await expect(getPosts()).rejects.toThrow(
        "Failed to fetch posts: Internal Server Error"
      )

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe("getPost", () => {
    test("fetches single post successfully", async () => {
      const mockPost = {
        id: "1",
        title: "Test Post",
        content: "Test content",
        userId: "1",
        bookmarkedBy: [],
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      })

      const result = await getPost("1")

      expect(fetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/posts/1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      expect(result).toEqual(mockPost)
    })

    test("returns null for non-existent post", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await getPost("999")
      expect(result).toBeNull()
    })
  })

  describe("createPostAction", () => {
    const mockFormData = new FormData()
    mockFormData.append("title", "Test Post")
    mockFormData.append("content", "Test content")

    const mockState = { message: "", success: false }

    test("creates post successfully", async () => {
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }

      // Mock checkAuth
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      // Mock the fetch call
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "1" }),
      })

      // Should throw NEXT_REDIRECT error
      await expect(createPostAction(mockState, mockFormData)).rejects.toThrow(
        "NEXT_REDIRECT"
      )

      const fetchCall = (fetch as Mock).mock.calls[0]
      const [url, options] = fetchCall

      expect(url).toBe("https://test-token.mockapi.io/api/v1/posts")
      expect(options.method).toBe("POST")
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
      })

      const body = JSON.parse(options.body)
      expect(body).toEqual({
        userId: "1",
        title: "Test Post",
        content: "Test content",
      })
    })

    test("handles missing title and content", async () => {
      // Mock authentication first
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      const incompleteFormData = new FormData()
      incompleteFormData.append("title", "")
      incompleteFormData.append("content", "")

      const result = await createPostAction(mockState, incompleteFormData)

      expect(result).toEqual({
        message: "Title and content are required",
        success: false,
      })
      expect(fetch).not.toHaveBeenCalled()
    })

    test("handles unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await createPostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You must be logged in to create a post",
        success: false,
      })
      expect(fetch).not.toHaveBeenCalled()
    })

    test("handles API error", async () => {
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      })

      const result = await createPostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "Failed to create post: Bad Request",
        success: false,
      })
    })

    test("handles NEXT_REDIRECT error", async () => {
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "1" }),
      })

      // Should throw NEXT_REDIRECT error
      await expect(createPostAction(mockState, mockFormData)).rejects.toThrow(
        "NEXT_REDIRECT"
      )
    })
  })

  describe("updatePostAction", () => {
    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("title", "Updated Post")
    mockFormData.append("content", "Updated content")

    const mockState = { message: "", success: false }
    const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
    const mockPost = {
      id: "1",
      title: "Original Post",
      content: "Original content",
      userId: "1",
      bookmarkedBy: [],
    }

    test("updates post successfully", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      // Mock getPost and then updatePost
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPost),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: "1" }),
        })

      // Should throw NEXT_REDIRECT error
      await expect(updatePostAction(mockState, mockFormData)).rejects.toThrow(
        "NEXT_REDIRECT"
      )
    })

    test("handles unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await updatePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You must be logged in to update a post",
        success: false,
      })
    })

    test("handles unauthorized user (not post owner)", async () => {
      const otherUser = {
        id: "2",
        name: "Other User",
        email: "other@example.com",
      }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(otherUser)

      // Mock getPost
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      })

      const result = await updatePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You can only update your own posts",
        success: false,
      })
    })
  })

  describe("deletePostAction", () => {
    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const mockState = { message: "", success: false }
    const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
    const mockPost = {
      id: "1",
      title: "Test Post",
      content: "Test content",
      userId: "1",
      bookmarkedBy: [],
    }

    test("deletes post successfully", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      // Mock getPost and then deletePost
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPost),
        })
        .mockResolvedValueOnce({
          ok: true,
        })

      // Should throw NEXT_REDIRECT error (redirect to /post)
      await expect(deletePostAction(mockState, mockFormData)).rejects.toThrow(
        "NEXT_REDIRECT"
      )

      // Check the second fetch call (the DELETE request)
      const deleteCall = (fetch as Mock).mock.calls[1]
      const [url, options] = deleteCall

      expect(url).toBe("https://test-token.mockapi.io/api/v1/users/1/posts/1")
      expect(options.method).toBe("DELETE")
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
      })
    })

    test("handles unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await deletePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You must be logged in to delete a post",
        success: false,
      })
    })

    test("handles unauthorized user (not post owner)", async () => {
      const otherUser = {
        id: "2",
        name: "Other User",
        email: "other@example.com",
      }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(otherUser)

      // Mock getPost
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      })

      const result = await deletePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You can only delete your own posts",
        success: false,
      })
    })
  })

  describe("getPostsFromFollowedUsers", () => {
    test("returns empty posts for unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await getPostsFromFollowedUsers()

      expect(result).toEqual({ posts: [], authors: [] })
      expect(fetch).not.toHaveBeenCalled()
    })

    test("returns empty posts when user follows no one", async () => {
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
      const mockCurrentUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        following: [],
      }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      // Mock user API call
      const { getUser } = await import("../user/actions")
      ;(getUser as Mock).mockResolvedValueOnce(mockCurrentUser)

      const result = await getPostsFromFollowedUsers()

      expect(result).toEqual({ posts: [], authors: [] })
    })

    test("fetches and sorts posts from followed users", async () => {
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
      const mockCurrentUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        following: ["2", "3"],
      }

      const mockUser2 = {
        id: "2",
        name: "User 2",
        email: "user2@example.com",
        avatar: "avatar2.jpg",
        createdAt: "2024-01-01T00:00:00Z",
      }

      const mockUser3 = {
        id: "3",
        name: "User 3",
        email: "user3@example.com",
        avatar: "avatar3.jpg",
        createdAt: "2024-01-01T00:00:00Z",
      }

      const mockPostsUser2 = [
        {
          id: "p1",
          userId: "2",
          title: "Post 1",
          content: "Content 1",
          createdAt: "2024-01-01T10:00:00Z",
          updatedAt: "2024-01-01T10:00:00Z",
          bookmarkedBy: [],
        },
      ]

      const mockPostsUser3 = [
        {
          id: "p2",
          userId: "3",
          title: "Post 2",
          content: "Content 2",
          createdAt: "2024-01-02T10:00:00Z", // Newer post
          updatedAt: "2024-01-02T10:00:00Z",
          bookmarkedBy: [],
        },
      ]

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      const { getUser } = await import("../user/actions")
      ;(getUser as Mock)
        .mockResolvedValueOnce(mockCurrentUser) // Get current user
        .mockResolvedValueOnce(mockUser2) // Get user 2
        .mockResolvedValueOnce(mockUser3) // Get user 3

      // Mock fetch calls in order
      global.fetch = vi
        .fn()
        // Get posts for user 2
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPostsUser2),
        })
        // Get posts for user 3
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPostsUser3),
        })

      const result = await getPostsFromFollowedUsers()

      // Check posts are sorted by date (newest first)
      expect(result.posts).toHaveLength(2)
      expect(result.posts[0].id).toBe("p2") // Newer post
      expect(result.posts[1].id).toBe("p1") // Older post

      // Check authors array
      expect(result.authors).toHaveLength(2)
      expect(result.authors).toContainEqual(mockUser2)
      expect(result.authors).toContainEqual(mockUser3)
    })

    test("handles partial API failures gracefully", async () => {
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
      const mockCurrentUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        following: ["2", "3"],
      }

      const mockUser2 = {
        id: "2",
        name: "User 2",
        email: "user2@example.com",
        avatar: "avatar2.jpg",
        createdAt: "2024-01-01T00:00:00Z",
      }

      const mockPostsUser2 = [
        {
          id: "p1",
          userId: "2",
          title: "Post 1",
          content: "Content 1",
          createdAt: "2024-01-01T10:00:00Z",
          updatedAt: "2024-01-01T10:00:00Z",
          bookmarkedBy: [],
        },
      ]

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      const { getUser } = await import("../user/actions")
      ;(getUser as Mock)
        .mockResolvedValueOnce(mockCurrentUser) // Get current user
        .mockResolvedValueOnce(mockUser2) // Get user 2
        .mockRejectedValueOnce(new Error("User not found")) // Get user 3 fails

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      // Mock fetch calls with one failure
      global.fetch = vi
        .fn()
        // Get posts for user 2 - success
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPostsUser2),
        })
        // Get posts for user 3 - failure
        .mockRejectedValueOnce(new Error("Failed to fetch posts"))

      const result = await getPostsFromFollowedUsers()

      // Should still return successful results
      expect(result.posts).toHaveLength(1)
      expect(result.posts[0].id).toBe("p1")
      expect(result.authors).toHaveLength(1)
      expect(result.authors[0]).toEqual(mockUser2)

      // Check error logging
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    test("handles current user not found error", async () => {
      const mockUser = { id: "1", name: "Test User", email: "test@example.com" }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      const { getUser } = await import("../user/actions")
      ;(getUser as Mock).mockResolvedValueOnce(null)

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const result = await getPostsFromFollowedUsers()

      // Should return empty results on error
      expect(result).toEqual({ posts: [], authors: [] })
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
