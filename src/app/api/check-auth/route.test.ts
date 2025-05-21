import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "./route"

// Mock next/headers
let cookiesStore: Record<string, string> = {}
const cookies = {
  get: (key: string) =>
    cookiesStore[key] ? { value: cookiesStore[key] } : undefined,
  set: (key: string, value: string) => {
    cookiesStore[key] = value
  },
  clear: () => {
    cookiesStore = {}
  },
}
vi.mock("next/headers", () => ({ cookies: () => cookies }))

describe("GET /api/check-auth", () => {
  beforeEach(() => {
    cookies.clear()
  })

  it("returns 401 if no session cookie", async () => {
    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(401)
    expect(json).toEqual({ authenticated: false })
  })

  it("returns 401 if session cookie is invalid JSON", async () => {
    cookies.set("session", "not-json")
    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(401)
    expect(json).toEqual({ authenticated: false })
  })

  it("returns 200 and user if session cookie is valid", async () => {
    const user = { id: "1", name: "Test", email: "test@example.com" }
    cookies.set("session", JSON.stringify(user))
    const res = await GET()
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toEqual({ authenticated: true, user })
  })
})
