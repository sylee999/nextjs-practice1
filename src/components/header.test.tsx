import { render } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { Header } from "./header"

// Mock the auth actions
vi.mock("@/app/auth/actions", () => ({
  checkAuth: vi.fn(),
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

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}))

describe("Header", () => {
  test("logo links to /home", async () => {
    const { checkAuth } = await import("@/app/auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(null)

    const component = await Header()
    const { container } = render(component)

    // Find the logo link
    const logoLink = container.querySelector('a[href="/"]')
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveTextContent("My Social Media")
  })

  test("renders header with search form", async () => {
    const { checkAuth } = await import("@/app/auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(null)

    const component = await Header()
    const { container } = render(component)

    // Check for search input
    const searchInput = container.querySelector(
      'input[placeholder="Search posts and users..."]'
    )
    expect(searchInput).toBeInTheDocument()
  })

  test("renders header with user avatar area", async () => {
    const mockUser = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      avatar: "",
      createdAt: "2024-01-01T00:00:00Z",
    }

    const { checkAuth } = await import("@/app/auth/actions")
    vi.mocked(checkAuth).mockResolvedValueOnce(mockUser)

    const component = await Header()
    const { container } = render(component)

    // Check for avatar/user area
    const avatar = container.querySelector('[data-slot="avatar"]')
    expect(avatar).toBeInTheDocument()
  })
})
