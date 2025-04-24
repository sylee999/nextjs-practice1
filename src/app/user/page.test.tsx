import { render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"
import UserPage from "./page"

vi.mock("@/components/user/user-list", () => ({
  UserList: vi.fn(({ users }) => (
    <div>Mocked User List: {users.length} users</div>
  )),
}))

vi.mock("@/components/ui/sheet", () => ({
  Sheet: vi.fn(({ children }) => <div data-testid="sheet">{children}</div>),
  SheetTrigger: vi.fn(({ children }) => (
    <div data-testid="sheet-trigger">{children}</div>
  )),
  SheetContent: vi.fn(({ children }) => (
    <div data-testid="sheet-content">{children}</div>
  )),
  SheetHeader: vi.fn(({ children }) => (
    <div data-testid="sheet-header">{children}</div>
  )),
  SheetTitle: vi.fn(({ children }) => (
    <div data-testid="sheet-title">{children}</div>
  )),
  SheetDescription: vi.fn(({ children }) => (
    <div data-testid="sheet-description">{children}</div>
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
    expect(screen.getByTestId("sheet-trigger")).toHaveTextContent("Create User")
    expect(screen.getByTestId("sheet-title")).toHaveTextContent(
      "Create New User"
    )
    expect(screen.getByTestId("sheet-description")).toHaveTextContent(
      "Fill in the details to create a new user."
    )
    expect(screen.getByText("Mocked Create Form")).toBeInTheDocument()
    expect(screen.getByText("Mocked User List: 0 users")).toBeInTheDocument()
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
