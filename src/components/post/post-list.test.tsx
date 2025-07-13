import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { Post } from "@/types/post"

import { PostList } from "./post-list"

// Mock the PostCard component
vi.mock("@/components/post/post-card", () => ({
  PostCard: vi.fn(({ post, author }) => (
    <div data-testid={`post-card-${post.id}`}>
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      {author ? <span>by {author.name}</span> : <span>Unknown Author</span>}
    </div>
  )),
}))

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: vi.fn(({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}))

describe("PostList", () => {
  const mockPosts = [
    {
      id: "1",
      title: "First Post",
      content: "This is the first post content",
      userId: "user1",
      bookmarkedBy: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Second Post",
      content: "This is the second post content",
      userId: "user2",
      bookmarkedBy: [],
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
  ]

  const mockAuthors = [
    {
      id: "user1",
      name: "John Doe",
      email: "john@example.com",
      password: "password",
      avatar: "https://example.com/avatar1.jpg",
      bookmarkedPosts: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password",
      avatar: "https://example.com/avatar2.jpg",
      bookmarkedPosts: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ]

  test("renders posts correctly", () => {
    render(<PostList posts={mockPosts} authors={mockAuthors} />)

    expect(screen.getByTestId("post-list")).toBeInTheDocument()
    expect(screen.getByTestId("post-1")).toBeInTheDocument()
    expect(screen.getByTestId("post-2")).toBeInTheDocument()

    // Check that post titles are displayed
    expect(screen.getByText("First Post")).toBeInTheDocument()
    expect(screen.getByText("Second Post")).toBeInTheDocument()

    // Check that post content summaries are displayed
    expect(
      screen.getByText(/This is the first post content/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/This is the second post content/)
    ).toBeInTheDocument()

    // Check that author names are displayed
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
  })

  test("renders posts without authors", () => {
    render(<PostList posts={mockPosts} />)

    expect(screen.getByTestId("post-list")).toBeInTheDocument()
    expect(screen.getByTestId("post-1")).toBeInTheDocument()
    expect(screen.getByTestId("post-2")).toBeInTheDocument()

    // When no authors provided, should show "Unknown Author"
    expect(screen.getAllByText("Unknown Author")).toHaveLength(2)
  })

  test("displays empty state when no posts", () => {
    render(<PostList posts={[]} />)

    expect(screen.getByText("No posts found.")).toBeInTheDocument()
    expect(screen.queryByTestId("post-list")).not.toBeInTheDocument()
  })

  test("displays empty state when posts is null", () => {
    render(<PostList posts={null as unknown as Post[]} />)

    expect(screen.getByText("No posts found.")).toBeInTheDocument()
    expect(screen.queryByTestId("post-list")).not.toBeInTheDocument()
  })

  test("creates correct links for each post", () => {
    render(<PostList posts={mockPosts} authors={mockAuthors} />)

    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute("href", "/post/1")
    expect(links[1]).toHaveAttribute("href", "/post/2")
  })

  test("handles posts with no matching authors", () => {
    const postsWithUnknownAuthors = [
      {
        ...mockPosts[0],
        userId: "unknown-user",
      },
    ]

    render(<PostList posts={postsWithUnknownAuthors} authors={mockAuthors} />)

    expect(screen.getByTestId("post-list")).toBeInTheDocument()
    expect(screen.getByTestId("post-1")).toBeInTheDocument()
  })
})
