import "@testing-library/jest-dom"

import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import LandingPage from "./page"

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

describe("Landing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("shows landing page for unauthenticated users", async () => {
    const { checkAuth } = await import("./auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(null)

    const component = await LandingPage()
    render(component)

    // Check hero section
    expect(screen.getByText("Welcome to Our Community")).toBeInTheDocument()
    expect(
      screen.getByText(
        "Connect with like-minded people, share your thoughts, and discover amazing content from our vibrant community."
      )
    ).toBeInTheDocument()

    // Check CTA buttons for unauthenticated users
    expect(screen.getByText("Explore Popular Posts")).toBeInTheDocument()
    expect(screen.getByText("Join the Community")).toBeInTheDocument()
    expect(screen.getByText("Sign Up Free")).toBeInTheDocument()
    expect(screen.getByText("Sign In")).toBeInTheDocument()

    // Check features section
    expect(screen.getByText("Why Join Our Platform?")).toBeInTheDocument()
    expect(screen.getByText("Connect with People")).toBeInTheDocument()
    expect(screen.getByText("Share Your Voice")).toBeInTheDocument()
    expect(screen.getByText("Bookmark Favorites")).toBeInTheDocument()

    // Check quick links
    expect(screen.getByText("Home Feed")).toBeInTheDocument()
    expect(screen.getByText("All Posts")).toBeInTheDocument()
    expect(screen.getByText("Discover People")).toBeInTheDocument()
  })

  test("shows landing page for authenticated users", async () => {
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

    const component = await LandingPage()
    render(component)

    // Check hero section
    expect(screen.getByText("Welcome to Our Community")).toBeInTheDocument()

    // Check CTA buttons for authenticated users
    const goToHomeButtons = screen.getAllByText("Go to Home Feed")
    expect(goToHomeButtons).toHaveLength(2) // One in hero, one in CTA section
    expect(screen.queryByText("Join the Community")).not.toBeInTheDocument()

    // Check CTA section for authenticated users
    expect(screen.getByText("Continue Exploring")).toBeInTheDocument()
    const createPostButtons = screen.getAllByText("Create a Post")
    expect(createPostButtons.length).toBeGreaterThan(0)

    // No signup/signin buttons for authenticated users
    expect(screen.queryByText("Sign Up Free")).not.toBeInTheDocument()
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument()

    // Check features section still shows
    expect(screen.getByText("Why Join Our Platform?")).toBeInTheDocument()

    // Check quick links include create post for authenticated users
    const createPostLinks = screen.getAllByText("Create Post")
    expect(createPostLinks.length).toBeGreaterThan(0)
  })

  test("has correct link destinations", async () => {
    const { checkAuth } = await import("./auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(null)

    const component = await LandingPage()
    const { container } = render(component)

    // Check home link
    const homeLink = container.querySelector('a[href="/home"]')
    expect(homeLink).toBeInTheDocument()

    // Check signup link
    const signupLink = container.querySelector('a[href="/signup"]')
    expect(signupLink).toBeInTheDocument()

    // Check login link
    const loginLink = container.querySelector('a[href="/login"]')
    expect(loginLink).toBeInTheDocument()

    // Check other navigation links
    const postLink = container.querySelector('a[href="/post"]')
    expect(postLink).toBeInTheDocument()

    const userLink = container.querySelector('a[href="/user"]')
    expect(userLink).toBeInTheDocument()
  })
})
