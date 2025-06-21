import "@testing-library/jest-dom"

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import Home from "./page"

// Mock the auth actions
vi.mock("./auth/actions", () => ({
  checkAuth: vi.fn(),
}))

// Mock the post actions
vi.mock("./post/actions", () => ({
  getPostsFromFollowedUsers: vi.fn(),
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
  usePathname: () => "/",
}))

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("shows welcome page for unauthenticated users", async () => {
    const { checkAuth } = await import("./auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(null)

    const component = await Home()
    render(component)

    // Check for welcome message
    expect(screen.getByText("Welcome to Our Community")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Connect with people, share your thoughts, and discover amazing content from the community."
      )
    ).toBeInTheDocument()

    // Check for call-to-action buttons
    expect(screen.getByText("Get Started")).toBeInTheDocument()
    expect(screen.getByText("Sign in")).toBeInTheDocument()

    // Check links
    const getStartedLink = screen.getByRole("link", { name: /get started/i })
    expect(getStartedLink).toHaveAttribute("href", "/signup")

    const signInLink = screen.getByRole("link", { name: /sign in/i })
    expect(signInLink).toHaveAttribute("href", "/login")
  })

  test("shows empty feed when user follows no one", async () => {
    const mockUser = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      avatar: "",
      createdAt: "2024-01-01T00:00:00Z",
      following: [],
    }

    const { checkAuth } = await import("./auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(mockUser)

    const { getPostsFromFollowedUsers } = await import("./post/actions")
    vi.mocked(getPostsFromFollowedUsers).mockResolvedValueOnce({
      posts: [],
      authors: [],
    })

    const component = await Home()
    render(component)

    // Check for home page title
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(
      screen.getByText("See the latest posts from people you follow")
    ).toBeInTheDocument()

    // Check for empty state
    expect(screen.getByText("Your feed is empty")).toBeInTheDocument()
    expect(
      screen.getByText("Start following people to see their posts here.")
    ).toBeInTheDocument()

    // Check for action buttons
    expect(screen.getByText("Discover People")).toBeInTheDocument()
    expect(screen.getByText("Browse All Posts")).toBeInTheDocument()
  })

  test("shows empty feed when followed users have no posts", async () => {
    const mockUser = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      avatar: "",
      createdAt: "2024-01-01T00:00:00Z",
      following: ["2", "3"],
    }

    const { checkAuth } = await import("./auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(mockUser)

    const { getPostsFromFollowedUsers } = await import("./post/actions")
    vi.mocked(getPostsFromFollowedUsers).mockResolvedValueOnce({
      posts: [],
      authors: [],
    })

    const component = await Home()
    render(component)

    // Check for empty state with different message
    expect(screen.getByText("Your feed is empty")).toBeInTheDocument()
    expect(
      screen.getByText("The people you follow haven't posted anything yet.")
    ).toBeInTheDocument()
  })

  test("shows posts from followed users", async () => {
    const mockUser = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      avatar: "",
      createdAt: "2024-01-01T00:00:00Z",
      following: ["2"],
    }

    const mockPosts = [
      {
        id: "p1",
        userId: "2",
        title: "Test Post",
        content: "Test content",
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T10:00:00Z",
        bookmarkedBy: [],
      },
    ]

    const mockAuthors = [
      {
        id: "2",
        name: "Author User",
        email: "author@example.com",
        avatar: "avatar.jpg",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]

    const { checkAuth } = await import("./auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(mockUser)

    const { getPostsFromFollowedUsers } = await import("./post/actions")
    vi.mocked(getPostsFromFollowedUsers).mockResolvedValueOnce({
      posts: mockPosts,
      authors: mockAuthors,
    })

    const component = await Home()
    render(component)

    // Check for home page title
    expect(screen.getByText("Home")).toBeInTheDocument()

    // Check that PostList is rendered with posts
    expect(screen.getByTestId("post-list")).toBeInTheDocument()
    expect(screen.getByTestId("post-p1")).toBeInTheDocument()
  })
})
