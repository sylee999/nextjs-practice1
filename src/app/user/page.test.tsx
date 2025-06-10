import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, test, vi, type Mock } from "vitest"

import UserPage from "./page"

// Mock the user actions
vi.mock("./actions", () => ({
  getUsers: vi.fn(),
}))

// Mock the UserList component
vi.mock("@/components/user/user-list", () => ({
  UserList: vi.fn(({ users }) => (
    <div data-testid="user-list">User List with {users.length} users</div>
  )),
}))

// Mock environment
vi.stubEnv("MOCKAPI_TOKEN", "test-token")

describe("UserPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("renders page with correct components", async () => {
    const mockUsers = [
      {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        avatar: "https://example.com/avatar.jpg",
        createdAt: "2023-01-01T00:00:00.000Z",
        bookmarkedPosts: [],
      },
    ]

    const { getUsers } = await import("./actions")
    ;(getUsers as Mock).mockResolvedValueOnce(mockUsers)

    const page = await UserPage()
    render(page)

    // Check if the page structure is rendered
    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(screen.getByTestId("user-list")).toBeInTheDocument()
  })

  test("handles API error gracefully", async () => {
    const { getUsers } = await import("./actions")
    ;(getUsers as Mock).mockRejectedValueOnce(new Error("API Error"))

    await expect(UserPage()).rejects.toThrow("API Error")
  })

  test("handles missing API token", async () => {
    vi.stubEnv("MOCKAPI_TOKEN", "")

    const { getUsers } = await import("./actions")
    ;(getUsers as Mock).mockRejectedValueOnce(
      new Error(
        "Configuration error: MOCKAPI_TOKEN environment variable is not defined is not properly configured"
      )
    )

    await expect(UserPage()).rejects.toThrow(
      "Configuration error: MOCKAPI_TOKEN environment variable is not defined is not properly configured"
    )

    // Restore environment
    vi.stubEnv("MOCKAPI_TOKEN", "test-token")
  })
})
