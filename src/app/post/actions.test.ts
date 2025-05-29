import { beforeEach, describe, expect, Mock, test, vi } from "vitest"

import {
  createPostAction,
  deletePostAction,
  getPost,
  getPosts,
  updatePostAction,
} from "./actions"

// Mock Next.js server functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// Mock the auth actions
vi.mock("../auth/actions", () => ({
  checkAuth: vi.fn(),
}))

describe("Post Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.MOCKAPI_TOKEN = "test-token"
  })

  describe("getPosts", () => {
    test("fetches posts successfully", async () => {
      const mockPosts = [
        { id: "1", title: "Test Post", content: "Test content", userId: "1" },
        {
          id: "2",
          title: "Another Post",
          content: "More content",
          userId: "2",
        },
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      })

      const result = await getPosts()

      expect(fetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/posts",
        { cache: "no-store" }
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
      const result = await getPosts()

      expect(result).toEqual([])
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
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      })

      const result = await getPost("1")

      expect(fetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/posts/1",
        { cache: "no-store" }
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

    const mockState = { message: "" }

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

      const result = await createPostAction(mockState, mockFormData)

      const fetchCall = (fetch as Mock).mock.calls[0]
      const [url, options] = fetchCall

      expect(url).toBe("https://test-token.mockapi.io/api/v1/posts")
      expect(options.method).toBe("POST")
      expect(options.headers).toEqual({
        "Content-Type": "application/json",
      })

      const body = JSON.parse(options.body)
      expect(body).toEqual(
        expect.objectContaining({
          userId: "1",
          title: "Test Post",
          content: "Test content",
          likeUsers: [],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      )

      expect(result).toEqual({
        message: "success",
        id: "1",
      })
    })

    test("handles missing title and content", async () => {
      const incompleteFormData = new FormData()
      incompleteFormData.append("title", "")
      incompleteFormData.append("content", "")

      const result = await createPostAction(mockState, incompleteFormData)

      expect(result).toEqual({
        message: "Title and content are required.",
        id: "",
      })
      expect(fetch).not.toHaveBeenCalled()
    })

    test("handles unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await createPostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You must be logged in to create a post.",
        id: "",
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
        message: "Failed to create post: 400 Bad Request",
        id: "",
      })
    })
  })

  describe("updatePostAction", () => {
    const mockFormData = new FormData()
    mockFormData.append("id", "1")
    mockFormData.append("title", "Updated Post")
    mockFormData.append("content", "Updated content")

    const mockState = { message: "" }
    const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
    const mockPost = {
      id: "1",
      title: "Original Post",
      content: "Original content",
      userId: "1",
    }

    test("updates post successfully", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      // Mock getPost
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

      const result = await updatePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "success",
      })
    })

    test("handles unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await updatePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You must be logged in to update a post.",
      })
    })

    test("handles unauthorized user (not post owner)", async () => {
      const unauthorizedUser = {
        id: "2",
        name: "Other User",
        email: "other@example.com",
      }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(unauthorizedUser)

      // Mock getPost
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      })

      const result = await updatePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You are not authorized to update this post.",
      })
    })
  })

  describe("deletePostAction", () => {
    const mockFormData = new FormData()
    mockFormData.append("id", "1")

    const mockState = { message: "" }
    const mockUser = { id: "1", name: "Test User", email: "test@example.com" }
    const mockPost = {
      id: "1",
      title: "Test Post",
      content: "Test content",
      userId: "1",
    }

    test("deletes post successfully", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)

      // Mock getPost and delete
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
        message: "success",
      })
    })

    test("handles unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await deletePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You must be logged in to delete a post.",
      })
    })

    test("handles unauthorized user (not post owner)", async () => {
      const unauthorizedUser = {
        id: "2",
        name: "Other User",
        email: "other@example.com",
      }

      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(unauthorizedUser)

      // Mock getPost
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPost),
      })

      const result = await deletePostAction(mockState, mockFormData)

      expect(result).toEqual({
        message: "You are not authorized to delete this post.",
      })
    })
  })
})
