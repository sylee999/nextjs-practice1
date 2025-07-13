import { beforeEach, describe, expect, it, vi } from "vitest"

import { searchPosts, searchUsers } from "./api"

// Mock environment variable
vi.stubEnv("MOCKAPI_TOKEN", "test-token")

// Mock fetch with proper typing
const mockFetch = vi.fn()
global.fetch = mockFetch as typeof fetch

describe("Search API Methods", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("searchPosts", () => {
    it("should return empty array for empty query", async () => {
      const result = await searchPosts("")
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it("should search posts by title and content", async () => {
      const mockPosts = [
        {
          id: "1",
          userId: "user1",
          title: "Hello World",
          content: "Test content",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          userId: "user2",
          title: "Test",
          content: "Hello in content",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockPosts[0]],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockPosts[1]],
        } as Response)

      const result = await searchPosts("Hello")

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/posts?title=Hello&page=1&limit=10"
      )
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/posts?content=Hello&page=1&limit=10"
      )
      expect(result).toHaveLength(2)
    })

    it("should deduplicate results when post appears in both title and content search", async () => {
      const duplicatePost = {
        id: "1",
        userId: "user1",
        title: "Hello World",
        content: "Hello content",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [duplicatePost],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [duplicatePost],
        } as Response)

      const result = await searchPosts("Hello")

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(duplicatePost)
    })

    it("should handle fetch errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(searchPosts("test")).rejects.toThrow(
        "Failed to search posts"
      )
    })
  })

  describe("searchUsers", () => {
    it("should return empty array for empty query", async () => {
      const result = await searchUsers("")
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it("should search users by name", async () => {
      const mockUsers = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          avatar: "avatar1.jpg",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "John Smith",
          email: "smith@example.com",
          avatar: "avatar2.jpg",
          createdAt: new Date().toISOString(),
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      } as Response)

      const result = await searchUsers("John")

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/users?name=John&page=1&limit=10"
      )
      expect(result).toEqual(mockUsers)
    })

    it("should handle pagination parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)

      await searchUsers("test", 2, 20)

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-token.mockapi.io/api/v1/users?name=test&page=2&limit=20"
      )
    })

    it("should handle fetch errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(searchUsers("test")).rejects.toThrow(
        "Failed to search users"
      )
    })
  })
})
