import { describe, expect, test } from "vitest"

import { generatePostSummary } from "./utils"

describe("generatePostSummary", () => {
  test("returns empty string for empty content", () => {
    expect(generatePostSummary("")).toBe("")
    expect(generatePostSummary("   ")).toBe("")
  })

  test("returns full content when shorter than max length", () => {
    const shortContent = "This is a short post"
    expect(generatePostSummary(shortContent)).toBe(shortContent)
  })

  test("truncates long content at word boundary", () => {
    const longContent =
      "This is a very long post content that needs to be truncated. It contains multiple sentences and should be cut at a word boundary, not in the middle of a word. The truncation should happen cleanly."
    const summary = generatePostSummary(longContent, 50)

    expect(summary).toBe("This is a very long post content that needs to be...")
    expect(summary.length).toBeLessThanOrEqual(53) // 50 + "..."
  })

  test("handles content with multiple spaces and newlines", () => {
    const messyContent =
      "This   is   a   post\n\nwith   multiple\n\nspaces   and   newlines"
    const summary = generatePostSummary(messyContent, 30)

    expect(summary).toBe("This is a post with multiple...")
  })

  test("handles content that ends exactly at max length", () => {
    const content = "This is exactly fifty characters long when typed"
    const summary = generatePostSummary(content, 48)

    expect(summary).toBe(content)
  })

  test("handles content with no spaces", () => {
    const noSpaces = "Thisisaverylongstringwithoutanyspacesthatshouldbecutoff"
    const summary = generatePostSummary(noSpaces, 20)

    // When there are no spaces, it truncates at the exact character limit
    expect(summary).toBe("Thisisaverylongstrin...")
  })

  test("respects custom max length", () => {
    const content =
      "This is a test post with some content that will be truncated at different lengths"

    expect(generatePostSummary(content, 10)).toBe("This is a...")
    expect(generatePostSummary(content, 25)).toBe("This is a test post with...")
    expect(generatePostSummary(content, 100)).toBe(content)
  })

  test("handles unicode characters correctly", () => {
    const unicodeContent =
      "This is a post with emojis 😀 and special characters é à ñ that should be handled properly"
    const summary = generatePostSummary(unicodeContent, 40)

    expect(summary).toBe("This is a post with emojis 😀 and...")
  })
})
