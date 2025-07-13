import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { PostCard } from "./post-card"

describe("PostCard", () => {
  const mockPost = {
    id: "1",
    title: "Test Post Title",
    content:
      "This is a test post content that is long enough to be truncated. It contains multiple sentences to test the summary generation. The content should be truncated at a word boundary and show an ellipsis at the end.",
    userId: "user1",
    bookmarkedBy: ["user2", "user3"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  }

  const mockAuthor = {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    password: "password",
    avatar: "https://example.com/avatar.jpg",
    bookmarkedPosts: [],
    followers: [],
    following: [],
    createdAt: "2024-01-01T00:00:00.000Z",
  }

  test("renders post card with title and summary", () => {
    render(<PostCard post={mockPost} author={mockAuthor} />)

    // Check title is displayed
    expect(screen.getByText("Test Post Title")).toBeInTheDocument()

    // Check summary is displayed and truncated
    const summary = screen.getByText(/This is a test post content/)
    expect(summary).toBeInTheDocument()
    expect(summary.textContent).toContain("...")
    expect(summary.textContent!.length).toBeLessThan(mockPost.content.length)
  })

  test("renders author information", () => {
    render(<PostCard post={mockPost} author={mockAuthor} />)

    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("2024-01-01")).toBeInTheDocument()
  })

  test("displays bookmark count", () => {
    render(<PostCard post={mockPost} author={mockAuthor} />)

    expect(screen.getByText("2")).toBeInTheDocument()
  })

  test("shows bookmark as filled when user has bookmarked", () => {
    render(
      <PostCard post={mockPost} author={mockAuthor} currentUserId="user2" />
    )

    const bookmarkIcon = screen.getByTestId("bookmark-icon")
    expect(bookmarkIcon).toHaveClass("fill-current", "text-blue-600")
  })

  test("shows edited indicator when post is updated", () => {
    const updatedPost = {
      ...mockPost,
      updatedAt: "2024-01-02T00:00:00.000Z",
    }

    render(<PostCard post={updatedPost} author={mockAuthor} />)

    expect(screen.getByText("Edited")).toBeInTheDocument()
  })

  test("renders without author", () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText("Unknown Author")).toBeInTheDocument()
    expect(screen.getByText("U")).toBeInTheDocument() // Avatar fallback
  })

  test("handles short content without truncation", () => {
    const shortPost = {
      ...mockPost,
      content: "Short content",
    }

    render(<PostCard post={shortPost} author={mockAuthor} />)

    const summary = screen.getByText("Short content")
    expect(summary).toBeInTheDocument()
    expect(summary.textContent).not.toContain("...")
  })

  test("displays read more indicator", () => {
    render(<PostCard post={mockPost} author={mockAuthor} />)

    // Desktop indicator
    expect(screen.getByText("Read more")).toBeInTheDocument()
  })

  test("handles empty content", () => {
    const emptyPost = {
      ...mockPost,
      content: "",
    }

    render(<PostCard post={emptyPost} author={mockAuthor} />)

    // Should render without crashing
    expect(screen.getByText("Test Post Title")).toBeInTheDocument()
  })
})
