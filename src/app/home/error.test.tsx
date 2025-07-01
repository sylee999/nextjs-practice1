import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

import HomeError from "./error"

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

describe("Home Error Boundary", () => {
  const mockReset = vi.fn()

  test("displays error message and recovery options", () => {
    const error = new Error("Failed to fetch posts")
    render(<HomeError error={error} reset={mockReset} />)

    // Check error UI elements
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument()
    expect(
      screen.getByText(
        "We encountered an error while loading your home feed. This might be a temporary issue."
      )
    ).toBeInTheDocument()

    // Check error details
    expect(screen.getByText(/Failed to fetch posts/)).toBeInTheDocument()

    // Check recovery options
    expect(screen.getByText("Try Again")).toBeInTheDocument()
    expect(screen.getByText("Browse All Posts")).toBeInTheDocument()
    expect(screen.getByText("Go to Landing Page")).toBeInTheDocument()

    // Check helpful tips
    expect(
      screen.getByText("Here are some things you can try:")
    ).toBeInTheDocument()
    expect(screen.getByText(/Refresh the page/)).toBeInTheDocument()
  })

  test("displays error ID when available", () => {
    const error = new Error("API Error") as Error & { digest?: string }
    error.digest = "ERROR-123-ABC"

    render(<HomeError error={error} reset={mockReset} />)

    expect(screen.getByText("Error ID: ERROR-123-ABC")).toBeInTheDocument()
  })

  test("handles missing error message", () => {
    const error = new Error() // Empty error
    render(<HomeError error={error} reset={mockReset} />)

    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
  })

  test("calls reset function when Try Again is clicked", async () => {
    const user = userEvent.setup()
    const error = new Error("Test error")

    render(<HomeError error={error} reset={mockReset} />)

    const tryAgainButton = screen.getByText("Try Again")
    await user.click(tryAgainButton)

    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  test("has correct navigation links", () => {
    const error = new Error("Test error")
    const { container } = render(<HomeError error={error} reset={mockReset} />)

    // Check Browse All Posts link
    const postsLink = container.querySelector('a[href="/post"]')
    expect(postsLink).toBeInTheDocument()
    expect(postsLink).toHaveTextContent("Browse All Posts")

    // Check Landing Page link
    const landingLink = container.querySelector('a[href="/"]')
    expect(landingLink).toBeInTheDocument()
    expect(landingLink).toHaveTextContent("Go to Landing Page")
  })
})
