import { revalidatePath } from "next/cache"
import { describe, expect, test, vi } from "vitest"
import { createUser } from "./actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("createUser", () => {
  const mockFormData = new FormData()
  mockFormData.append("name", "Test User")
  mockFormData.append("email", "test@example.com")
  mockFormData.append("avatar", "https://example.com/avatar.jpg")

  const mockState = {
    message: "",
  }

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.MOCKAPI_TOKEN = "test-token"
  })

  test("creates user successfully", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ id: 1, ...Object.fromEntries(mockFormData) }),
    })

    const result = await createUser(mockState, mockFormData)

    expect(fetch).toHaveBeenCalledWith(
      "https://test-token.mockapi.io/api/v1/users",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          avatar: "https://example.com/avatar.jpg",
        }),
      })
    )

    expect(revalidatePath).toHaveBeenCalledWith("/user")
    expect(result).toEqual({
      message: "User created successfully!",
    })
  })

  test("handles API error", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    })

    const result = await createUser(mockState, mockFormData)

    expect(result).toEqual({
      message: "Failed to create user. Please try again.",
    })
  })

  test("handles missing API token", async () => {
    delete process.env.MOCKAPI_TOKEN

    await expect(createUser(mockState, mockFormData)).rejects.toThrow(
      "MOCKAPI_TOKEN environment variable is not defined."
    )
  })
})
