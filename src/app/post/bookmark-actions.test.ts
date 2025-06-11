import { beforeEach, describe, expect, test, vi, type Mock } from "vitest"

import {
  getPostBookmarkCount,
  getUserBookmarks,
  isPostBookmarked,
  toggleBookmarkAction,
} from "./bookmark-actions"

// Mock the dependencies
vi.mock("../auth/actions", () => ({
  checkAuth: vi.fn(),
}))

vi.mock("../user/actions", () => ({
  getUser: vi.fn(),
}))

vi.mock("./actions", () => ({
  getPost: vi.fn(),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

// Mock environment
vi.stubEnv("MOCKAPI_TOKEN", "test-token")

describe("Bookmark Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe("toggleBookmarkAction", () => {
    const mockUser = {
      id: "user1",
      name: "Test User",
      email: "test@example.com",
      bookmarkedPosts: [],
    }
    const mockPost = {
      id: "post1",
      title: "Test Post",
      content: "Test content",
      userId: "user2",
      bookmarkedBy: [],
    }

    test("bookmarks a post successfully", async () => {
      const { checkAuth } = await import("../auth/actions")
      const { getUser } = await import("../user/actions")
      const { getPost } = await import("./actions")

      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)
      ;(getPost as Mock).mockResolvedValueOnce(mockPost)
      ;(getUser as Mock).mockResolvedValueOnce(mockUser)

      // Mock successful API calls
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true }) // Post update
        .mockResolvedValueOnce({ ok: true }) // User update

      const result = await toggleBookmarkAction("post1")

      expect(result).toEqual({
        message: "Post bookmarked successfully",
        success: true,
        isBookmarked: true,
      })

      // Verify API calls
      expect(fetch).toHaveBeenCalledTimes(2)

      // Check post update call
      const postCall = (fetch as Mock).mock.calls[0]
      expect(postCall[0]).toBe(
        "https://test-token.mockapi.io/api/v1/posts/post1"
      )
      expect(postCall[1].method).toBe("PUT")

      const postBody = JSON.parse(postCall[1].body)
      expect(postBody.bookmarkedBy).toEqual(["user1"])

      // Check user update call
      const userCall = (fetch as Mock).mock.calls[1]
      expect(userCall[0]).toBe(
        "https://test-token.mockapi.io/api/v1/users/user1"
      )
      expect(userCall[1].method).toBe("PUT")

      const userBody = JSON.parse(userCall[1].body)
      expect(userBody.bookmarkedPosts).toEqual(["post1"])
    })

    test("unbookmarks a post successfully", async () => {
      const { checkAuth } = await import("../auth/actions")
      const { getUser } = await import("../user/actions")
      const { getPost } = await import("./actions")

      const bookmarkedPost = { ...mockPost, bookmarkedBy: ["user1"] }
      const userWithBookmarks = { ...mockUser, bookmarkedPosts: ["post1"] }

      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)
      ;(getPost as Mock).mockResolvedValueOnce(bookmarkedPost)
      ;(getUser as Mock).mockResolvedValueOnce(userWithBookmarks)

      // Mock successful API calls
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true }) // Post update
        .mockResolvedValueOnce({ ok: true }) // User update

      const result = await toggleBookmarkAction("post1")

      expect(result).toEqual({
        message: "Bookmark removed successfully",
        success: true,
        isBookmarked: false,
      })

      // Verify bookmark removal
      const postCall = (fetch as Mock).mock.calls[0]
      const postBody = JSON.parse(postCall[1].body)
      expect(postBody.bookmarkedBy).toEqual([])

      const userCall = (fetch as Mock).mock.calls[1]
      const userBody = JSON.parse(userCall[1].body)
      expect(userBody.bookmarkedPosts).toEqual([])
    })

    test("handles unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      ;(checkAuth as Mock).mockResolvedValueOnce(null)

      const result = await toggleBookmarkAction("post1")

      expect(result).toEqual({
        message: "You must be logged in to bookmark posts",
        success: false,
      })
      expect(fetch).not.toHaveBeenCalled()
    })

    test("handles non-existent post", async () => {
      const { checkAuth } = await import("../auth/actions")
      const { getPost } = await import("./actions")

      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)
      ;(getPost as Mock).mockResolvedValueOnce(null)

      const result = await toggleBookmarkAction("nonexistent")

      expect(result).toEqual({
        message: "Post with id 'nonexistent' not found",
        success: false,
      })
      expect(fetch).not.toHaveBeenCalled()
    })

    test("handles post update failure", async () => {
      const { checkAuth } = await import("../auth/actions")
      const { getUser } = await import("../user/actions")
      const { getPost } = await import("./actions")

      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)
      ;(getPost as Mock).mockResolvedValueOnce(mockPost)
      ;(getUser as Mock).mockResolvedValueOnce(mockUser)

      // Mock failed post update
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })

      const result = await toggleBookmarkAction("post1")

      expect(result).toEqual({
        message: "Failed to update post bookmark: Internal Server Error",
        success: false,
      })
    })

    test("handles user update failure with rollback", async () => {
      const { checkAuth } = await import("../auth/actions")
      const { getUser } = await import("../user/actions")
      const { getPost } = await import("./actions")

      ;(checkAuth as Mock).mockResolvedValueOnce(mockUser)
      ;(getPost as Mock).mockResolvedValueOnce(mockPost)
      ;(getUser as Mock).mockResolvedValueOnce(mockUser)

      // Mock successful post update, failed user update
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true }) // Post update succeeds
        .mockResolvedValueOnce({
          // User update fails
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
        .mockResolvedValueOnce({ ok: true }) // Rollback post update

      const result = await toggleBookmarkAction("post1")

      expect(result).toEqual({
        message: "Failed to update user bookmarks: Internal Server Error",
        success: false,
      })

      // Verify rollback attempt
      expect(fetch).toHaveBeenCalledTimes(3)
    })
  })

  describe("getUserBookmarks", () => {
    test("returns user's bookmarked posts", async () => {
      const { getUser } = await import("../user/actions")
      const { getPost } = await import("./actions")

      const mockUser = { id: "user1", bookmarkedPosts: ["post1", "post2"] }
      const mockPost1 = { id: "post1", title: "Post 1", bookmarkedBy: [] }
      const mockPost2 = { id: "post2", title: "Post 2", bookmarkedBy: [] }

      ;(getUser as Mock).mockResolvedValueOnce(mockUser)
      ;(getPost as Mock)
        .mockResolvedValueOnce(mockPost1)
        .mockResolvedValueOnce(mockPost2)

      const result = await getUserBookmarks("user1")

      expect(result).toEqual([mockPost1, mockPost2])
      expect(getPost).toHaveBeenCalledWith("post1")
      expect(getPost).toHaveBeenCalledWith("post2")
    })

    test("returns empty array when user has no bookmarks", async () => {
      const { getUser } = await import("../user/actions")

      const mockUser = { id: "user1", bookmarkedPosts: [] }
      ;(getUser as Mock).mockResolvedValueOnce(mockUser)

      const result = await getUserBookmarks("user1")

      expect(result).toEqual([])
    })

    test("filters out deleted posts", async () => {
      const { getUser } = await import("../user/actions")
      const { getPost } = await import("./actions")

      const mockUser = {
        id: "user1",
        bookmarkedPosts: ["post1", "post2", "post3"],
      }
      const mockPost1 = { id: "post1", title: "Post 1", bookmarkedBy: [] }

      ;(getUser as Mock).mockResolvedValueOnce(mockUser)
      ;(getPost as Mock)
        .mockResolvedValueOnce(mockPost1)
        .mockResolvedValueOnce(null) // Deleted post
        .mockResolvedValueOnce(null) // Another deleted post

      const result = await getUserBookmarks("user1")

      expect(result).toEqual([mockPost1])
    })

    test("handles user not found", async () => {
      const { getUser } = await import("../user/actions")
      ;(getUser as Mock).mockResolvedValueOnce(null)

      const result = await getUserBookmarks("nonexistent")

      expect(result).toEqual([])
    })
  })

  describe("isPostBookmarked", () => {
    test("returns true when user bookmarked the post", async () => {
      const { getPost } = await import("./actions")

      const mockPost = { id: "post1", bookmarkedBy: ["user1", "user2"] }
      ;(getPost as Mock).mockResolvedValueOnce(mockPost)

      const result = await isPostBookmarked("post1", "user1")

      expect(result).toBe(true)
    })

    test("returns false when user has not bookmarked the post", async () => {
      const { getPost } = await import("./actions")

      const mockPost = { id: "post1", bookmarkedBy: ["user2"] }
      ;(getPost as Mock).mockResolvedValueOnce(mockPost)

      const result = await isPostBookmarked("post1", "user1")

      expect(result).toBe(false)
    })

    test("returns false when post not found", async () => {
      const { getPost } = await import("./actions")
      ;(getPost as Mock).mockResolvedValueOnce(null)

      const result = await isPostBookmarked("nonexistent", "user1")

      expect(result).toBe(false)
    })
  })

  describe("getPostBookmarkCount", () => {
    test("returns correct bookmark count", async () => {
      const { getPost } = await import("./actions")

      const mockPost = {
        id: "post1",
        bookmarkedBy: ["user1", "user2", "user3"],
      }
      ;(getPost as Mock).mockResolvedValueOnce(mockPost)

      const result = await getPostBookmarkCount("post1")

      expect(result).toBe(3)
    })

    test("returns 0 when post has no bookmarks", async () => {
      const { getPost } = await import("./actions")

      const mockPost = { id: "post1", bookmarkedBy: [] }
      ;(getPost as Mock).mockResolvedValueOnce(mockPost)

      const result = await getPostBookmarkCount("post1")

      expect(result).toBe(0)
    })

    test("returns 0 when post not found", async () => {
      const { getPost } = await import("./actions")
      ;(getPost as Mock).mockResolvedValueOnce(null)

      const result = await getPostBookmarkCount("nonexistent")

      expect(result).toBe(0)
    })
  })
})
