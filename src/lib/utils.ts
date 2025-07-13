import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a consistent format (YYYY-MM-DD)
 * This ensures server and client render the same output
 */
export function formatDate(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats a time to a consistent format (HH:MM)
 * This ensures server and client render the same output
 */
export function formatTime(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Generates a summary from post content by truncating to a specified length
 * Ensures clean truncation without breaking words
 * @param content - The full post content
 * @param maxLength - Maximum length of the summary (default: 150)
 * @returns Truncated content with ellipsis if needed
 */
export function generatePostSummary(
  content: string,
  maxLength: number = 150
): string {
  if (!content) return ""

  // Remove extra whitespace and newlines
  const cleanContent = content.replace(/\s+/g, " ").trim()

  if (cleanContent.length <= maxLength) {
    return cleanContent
  }

  // Find the last complete word within the limit
  const truncated = cleanContent.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(" ")

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + "..."
  }

  return truncated + "..."
}
