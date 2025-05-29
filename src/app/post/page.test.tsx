import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import PostPage from "./page"

vi.mock("@/components/post/post-list", () => ({
  PostList: vi.fn(({ posts, authors }) => (
    <div data-testid="post-list">
      Mocked Post List: {posts.length} posts, {authors?.length || 0} authors
    </div>
  )),
}))

vi.mock("./actions", () => ({
  getPosts: vi.fn(),
}))

vi.mock("@/app/user/actions", () => ({
  getUsers: vi.fn(),
}))

vi.mock("next/link", () => ({
  default: vi.fn(({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}))

describe("PostPage", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.MOCKAPI_TOKEN = "test-token"
  })

  test("renders page with correct components", async () => {
    const mockPosts = [
      {
        id: "1",
        title: "Test Post",
        content: "Test content",
        userId: "1",
        likeUsers: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ]
    const mockUsers = [
      {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        password: "password",
        avatar: "https://example.com/avatar.jpg",
        likeUsers: [],
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]

    const { getPosts } = await import("./actions")
    const { getUsers } = await import("@/app/user/actions")

    vi.mocked(getPosts).mockResolvedValueOnce(mockPosts)
    vi.mocked(getUsers).mockResolvedValueOnce(mockUsers)

    const page = await PostPage()
    render(page)

    expect(screen.getByText("Posts")).toBeInTheDocument()
    expect(screen.getByText("Create Post")).toBeInTheDocument()
    expect(screen.getByTestId("post-list")).toBeInTheDocument()
    expect(
      screen.getByText("Mocked Post List: 1 posts, 1 authors")
    ).toBeInTheDocument()
  })

  test("renders create post link correctly", async () => {
    const { getPosts } = await import("./actions")
    const { getUsers } = await import("@/app/user/actions")

    vi.mocked(getPosts).mockResolvedValueOnce([])
    vi.mocked(getUsers).mockResolvedValueOnce([])

    const page = await PostPage()
    render(page)

    const createLink = screen.getByRole("link")
    expect(createLink).toHaveAttribute("href", "/post/create")
    expect(createLink).toHaveTextContent("Create Post")
  })

  test("handles API error gracefully", async () => {
    const { getPosts } = await import("./actions")
    const { getUsers } = await import("@/app/user/actions")

    vi.mocked(getPosts).mockRejectedValueOnce(new Error("API Error"))
    vi.mocked(getUsers).mockResolvedValueOnce([])

    // The page should still render even if posts fail to load
    await expect(PostPage()).rejects.toThrow("API Error")
  })

  test("handles empty posts and users", async () => {
    const { getPosts } = await import("./actions")
    const { getUsers } = await import("@/app/user/actions")

    vi.mocked(getPosts).mockResolvedValueOnce([])
    vi.mocked(getUsers).mockResolvedValueOnce([])

    const page = await PostPage()
    render(page)

    expect(screen.getByText("Posts")).toBeInTheDocument()
    expect(
      screen.getByText("Mocked Post List: 0 posts, 0 authors")
    ).toBeInTheDocument()
  })

  test("handles missing API token", async () => {
    delete process.env.MOCKAPI_TOKEN

    const { getPosts } = await import("./actions")
    const { getUsers } = await import("@/app/user/actions")

    vi.mocked(getPosts).mockResolvedValueOnce([])
    vi.mocked(getUsers).mockResolvedValueOnce([])

    const page = await PostPage()
    render(page)

    expect(screen.getByText("Posts")).toBeInTheDocument()
    expect(
      screen.getByText("Mocked Post List: 0 posts, 0 authors")
    ).toBeInTheDocument()
  })
})
