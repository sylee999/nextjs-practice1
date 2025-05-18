import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import UserPage from "./page"

vi.mock("@/components/user/user-list", () => ({
  UserList: vi.fn(({ users }) => (
    <div>Mocked User List: {users.length} users</div>
  )),
}))

vi.mock("@/components/user/user-create-form", () => ({
  default: vi.fn(() => <div>Mocked Create Form</div>),
}))

describe("UserPage", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.MOCKAPI_TOKEN = "test-token"
  })

  test("renders page with correct components", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    const page = await UserPage()
    render(page)

    expect(screen.getByText("Users")).toBeInTheDocument()
  })

  test("handles API error gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("API Error"))

    const page = await UserPage()
    render(page)

    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(screen.getByText("Mocked User List: 0 users")).toBeInTheDocument()
  })

  test("handles missing API token", async () => {
    delete process.env.MOCKAPI_TOKEN
    global.fetch = vi.fn()

    const page = await UserPage()
    render(page)

    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(screen.getByText("Mocked User List: 0 users")).toBeInTheDocument()
  })
})
