import { beforeEach, describe, expect, test, vi, type Mock } from "vitest"

import {
  createPostAction,
  deletePostAction,
  getPost,
  getPosts,
  updatePostAction,
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
          likeUsers: [],
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
        likeUsers: [],
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
      likeUsers: [],
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
      likeUsers: [],
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

      const result = await deletePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "Post deleted successfully",
        success: true,
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
})
