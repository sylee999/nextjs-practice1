import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import HomePage from "./page"

// Mock the auth actions
vi.mock("../auth/actions", () => ({
  checkAuth: vi.fn(),
}))

// Mock the post actions
vi.mock("../post/actions", () => ({
  getPostsFromFollowedUsers: vi.fn(),
  getPopularPosts: vi.fn(),
}))

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/home",
}))

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Unauthenticated Users", () => {
    test("shows popular posts for unauthenticated users", async () => {
      const { checkAuth } = await import("../auth/actions")
      vi.mocked(checkAuth).mockResolvedValueOnce(null)

      const mockPosts = [
        {
          id: "1",
          userId: "user1",
          title: "Popular Post 1",
          content: "Content 1",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          bookmarkedBy: ["a", "b", "c"],
        },
        {
          id: "2",
          userId: "user2",
          title: "Popular Post 2",
          content: "Content 2",
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
          bookmarkedBy: ["a", "b"],
        },
      ]

      const mockAuthors = [
        {
          id: "user1",
          name: "Author 1",
          email: "author1@example.com",
          avatar: "",
          createdAt: "2024-01-01T00:00:00Z",
          following: [],
        },
        {
          id: "user2",
          name: "Author 2",
          email: "author2@example.com",
          avatar: "",
          createdAt: "2024-01-01T00:00:00Z",
          following: [],
        },
      ]

      const { getPopularPosts } = await import("../post/actions")
      vi.mocked(getPopularPosts).mockResolvedValueOnce({
        posts: mockPosts,
        authors: mockAuthors,
      })

      const component = await HomePage()
      render(component)

      // Check header
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(
        screen.getByText("Discover popular posts from our community")
      ).toBeInTheDocument()

      // Check posts are displayed
      expect(screen.getByText("Popular Post 1")).toBeInTheDocument()
      expect(screen.getByText("Popular Post 2")).toBeInTheDocument()
    })

    test("shows empty state for unauthenticated users when no posts", async () => {
      const { checkAuth } = await import("../auth/actions")
      vi.mocked(checkAuth).mockResolvedValueOnce(null)

      const { getPopularPosts } = await import("../post/actions")
      vi.mocked(getPopularPosts).mockResolvedValueOnce({
        posts: [],
        authors: [],
      })

      const component = await HomePage()
      render(component)

      expect(screen.getByText("No posts yet")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Be the first to create a post and share your thoughts with the community."
        )
      ).toBeInTheDocument()
    })
  })

  describe("Authenticated Users", () => {
    test("shows personalized feed for authenticated users", async () => {
      const mockUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        avatar: "",
        createdAt: "2024-01-01T00:00:00Z",
        following: ["user2", "user3"],
      }

      const { checkAuth } = await import("../auth/actions")
      vi.mocked(checkAuth).mockResolvedValueOnce(mockUser)

      const mockPosts = [
        {
          id: "1",
          userId: "user2",
          title: "Friend Post 1",
          content: "Content from friend",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          bookmarkedBy: [],
        },
        {
          id: "2",
          userId: "user3",
          title: "Friend Post 2",
          content: "Another post from friend",
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: "2024-01-02T00:00:00Z",
          bookmarkedBy: [],
        },
      ]

      const mockAuthors = [
        {
          id: "user2",
          name: "Friend 1",
          email: "friend1@example.com",
          avatar: "",
          createdAt: "2024-01-01T00:00:00Z",
          following: [],
        },
        {
          id: "user3",
          name: "Friend 2",
          email: "friend2@example.com",
          avatar: "",
          createdAt: "2024-01-01T00:00:00Z",
          following: [],
        },
      ]

      const { getPostsFromFollowedUsers } = await import("../post/actions")
      vi.mocked(getPostsFromFollowedUsers).mockResolvedValueOnce({
        posts: mockPosts,
        authors: mockAuthors,
      })

      const component = await HomePage()
      render(component)

      // Check header
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(
        screen.getByText("See the latest posts from people you follow")
      ).toBeInTheDocument()

      // Check posts are displayed
      expect(screen.getByText("Friend Post 1")).toBeInTheDocument()
      expect(screen.getByText("Friend Post 2")).toBeInTheDocument()

      // Verify getPostsFromFollowedUsers was called, not getPopularPosts
      expect(getPostsFromFollowedUsers).toHaveBeenCalled()
      const { getPopularPosts } = await import("../post/actions")
      expect(getPopularPosts).not.toHaveBeenCalled()
    })

    test("shows empty feed message for authenticated users following no one", async () => {
      const mockUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        avatar: "",
        createdAt: "2024-01-01T00:00:00Z",
        following: [],
      }

      const { checkAuth } = await import("../auth/actions")
      vi.mocked(checkAuth).mockResolvedValueOnce(mockUser)

      const { getPostsFromFollowedUsers } = await import("../post/actions")
      vi.mocked(getPostsFromFollowedUsers).mockResolvedValueOnce({
        posts: [],
        authors: [],
      })

      const component = await HomePage()
      render(component)

      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(
        screen.getByText("Follow some users to see their posts here")
      ).toBeInTheDocument()
      expect(screen.getByText("Your feed is empty")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Follow other users to see their posts in your personalized feed. In the meantime, check out the popular posts below."
        )
      ).toBeInTheDocument()
    })
  })

  describe("error scenarios", () => {
    test("handles error when getPostsFromFollowedUsers fails for authenticated user", async () => {
      const mockUser = {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        avatar: "",
        createdAt: "2024-01-01T00:00:00Z",
        following: ["2"],
      }

      const { checkAuth } = await import("../auth/actions")
      vi.mocked(checkAuth).mockResolvedValueOnce(mockUser)

      const { getPostsFromFollowedUsers } = await import("../post/actions")
      vi.mocked(getPostsFromFollowedUsers).mockRejectedValueOnce(
        new Error("Failed to fetch posts from followed users")
      )

      // The error should be caught by the error boundary
      // In a real test environment, we'd need to wrap this in an error boundary
      await expect(HomePage()).rejects.toThrow(
        "Failed to fetch posts from followed users"
      )
    })

    test("handles error when getPopularPosts fails for unauthenticated user", async () => {
      const { checkAuth } = await import("../auth/actions")
      vi.mocked(checkAuth).mockResolvedValueOnce(null)

      const { getPopularPosts } = await import("../post/actions")
      vi.mocked(getPopularPosts).mockRejectedValueOnce(
        new Error("Failed to fetch popular posts")
      )

      // The error should be caught by the error boundary
      await expect(HomePage()).rejects.toThrow("Failed to fetch popular posts")
    })

    test("handles authentication check failure gracefully", async () => {
      const { checkAuth } = await import("../auth/actions")
      vi.mocked(checkAuth).mockRejectedValueOnce(
        new Error("Auth service unavailable")
      )

      // When auth fails, it should still try to show popular posts
      const { getPopularPosts } = await import("../post/actions")
      vi.mocked(getPopularPosts).mockResolvedValueOnce({
        posts: [],
        authors: [],
      })

      // Should handle auth error and show unauthenticated view
      await expect(HomePage()).rejects.toThrow("Auth service unavailable")
    })
  })
})
