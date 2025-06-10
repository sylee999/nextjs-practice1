import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { BookmarkedPosts } from "./bookmarked-posts"

// Mock the PostList component
vi.mock("@/components/post/post-list", () => ({
  PostList: vi.fn(({ posts, authors, currentUserId }) => (
    <div data-testid="post-list">
      <div>Posts: {posts.length}</div>
      <div>Authors: {authors?.length || 0}</div>
      <div>Current User: {currentUserId || "none"}</div>
    </div>
  )),
}))

describe("BookmarkedPosts", () => {
  const mockPosts = [
    {
      id: "post1",
      title: "Test Post 1",
      content: "Content 1",
      userId: "user1",
      bookmarkedBy: ["user2"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "post2",
      title: "Test Post 2",
      content: "Content 2",
      userId: "user2",
      bookmarkedBy: ["user2"],
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
  ]

  const mockAuthors = [
    {
      id: "user1",
      name: "User One",
      email: "user1@example.com",
      avatar: "https://example.com/avatar1.jpg",
      bookmarkedPosts: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "user2",
      name: "User Two",
      email: "user2@example.com",
      avatar: "https://example.com/avatar2.jpg",
      bookmarkedPosts: [],
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ]

  test("renders bookmarked posts with count", () => {
    render(
      <BookmarkedPosts
        posts={mockPosts}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={false}
      />
    )

    expect(screen.getByText("2 bookmarked posts")).toBeInTheDocument()
    expect(screen.getByTestId("post-list")).toBeInTheDocument()
    expect(screen.getByText("Posts: 2")).toBeInTheDocument()
    expect(screen.getByText("Authors: 2")).toBeInTheDocument()
    expect(screen.getByText("Current User: user1")).toBeInTheDocument()
  })

  test("renders singular bookmark count", () => {
    render(
      <BookmarkedPosts
        posts={[mockPosts[0]]}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={false}
      />
    )

    expect(screen.getByText("1 bookmarked post")).toBeInTheDocument()
  })

  test("renders empty state for own profile", () => {
    render(
      <BookmarkedPosts
        posts={[]}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={true}
      />
    )

    expect(screen.getByText("No bookmarked posts")).toBeInTheDocument()
    expect(
      screen.getByText(
        "You haven't bookmarked any posts yet. Start exploring and bookmark posts you find interesting!"
      )
    ).toBeInTheDocument()
    expect(screen.queryByTestId("post-list")).not.toBeInTheDocument()
  })

  test("renders empty state for other user's profile", () => {
    render(
      <BookmarkedPosts
        posts={[]}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={false}
      />
    )

    expect(screen.getByText("No bookmarked posts")).toBeInTheDocument()
    expect(
      screen.getByText("This user hasn't bookmarked any posts yet.")
    ).toBeInTheDocument()
    expect(screen.queryByTestId("post-list")).not.toBeInTheDocument()
  })

  test("renders empty state when posts is null", () => {
    render(
      <BookmarkedPosts
        posts={null as unknown as []}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={true}
      />
    )

    expect(screen.getByText("No bookmarked posts")).toBeInTheDocument()
  })

  test("renders with default props", () => {
    render(<BookmarkedPosts posts={mockPosts} />)

    expect(screen.getByText("2 bookmarked posts")).toBeInTheDocument()
    expect(screen.getByText("Authors: 0")).toBeInTheDocument()
    expect(screen.getByText("Current User: none")).toBeInTheDocument()
  })

  test("renders bookmark icon in count display", () => {
    render(
      <BookmarkedPosts
        posts={mockPosts}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={false}
      />
    )

    // Check for bookmark icon in the count section
    const countSection = screen.getByText("2 bookmarked posts").closest("div")
    expect(countSection).toBeInTheDocument()

    // The icon should be present as an SVG element
    const icon = countSection?.querySelector("svg")
    expect(icon).toBeInTheDocument()
  })

  test("renders bookmark icon in empty state", () => {
    render(
      <BookmarkedPosts
        posts={[]}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={true}
      />
    )

    // Check for bookmark icon in empty state
    const emptyState = screen.getByText("No bookmarked posts").closest("div")
    expect(emptyState).toBeInTheDocument()

    // The icon should be present in the empty state
    const iconContainer = emptyState?.querySelector(".bg-gray-100")
    expect(iconContainer).toBeInTheDocument()

    const icon = iconContainer?.querySelector("svg")
    expect(icon).toBeInTheDocument()
  })

  test("passes correct props to PostList", () => {
    render(
      <BookmarkedPosts
        posts={mockPosts}
        authors={mockAuthors}
        currentUserId="user1"
        isOwnProfile={false}
      />
    )

    // Verify PostList receives correct props
    expect(screen.getByText("Posts: 2")).toBeInTheDocument()
    expect(screen.getByText("Authors: 2")).toBeInTheDocument()
    expect(screen.getByText("Current User: user1")).toBeInTheDocument()
  })
})
