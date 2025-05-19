import { revalidatePath } from "next/cache"
import { describe, expect, Mock, test, vi } from "vitest"
import { createUser } from "./actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("createUser", () => {
  const mockFormData = new FormData()
  mockFormData.append("avatar", "https://example.com/avatar.jpg")
  mockFormData.append("name", "Test User")
  mockFormData.append("email", "test@example.com")
  mockFormData.append("password", "password")

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

    // Get the actual call arguments
    const fetchCall = (fetch as Mock).mock.calls[0]
    const [url, options] = fetchCall

    expect(url).toBe("https://test-token.mockapi.io/api/v1/users")
    expect(options.method).toBe("POST")
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
    })

    // Parse the body and check its contents
    const body = JSON.parse(options.body)
    expect(body).toEqual(
      expect.objectContaining({
        avatar: "https://example.com/avatar.jpg",
        name: "Test User",
        email: "test@example.com",
        password: "password",
        createdAt: expect.any(String),
      })
    )

    expect(revalidatePath).toHaveBeenCalledWith("/user")
    expect(result).toEqual({
      id: 1,
      message: "success",
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
      message: "Failed to create user: 400 Bad Request",
    })
  })

  test("handles missing API token", async () => {
    delete process.env.MOCKAPI_TOKEN

    await expect(createUser(mockState, mockFormData)).rejects.toThrow(
      "MOCKAPI_TOKEN environment variable is not defined."
    )
  })
})
