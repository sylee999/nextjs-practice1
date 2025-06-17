import { ConfigurationError } from "@/types/errors"

export function getApiBaseUrl(): string {
  const MOCKAPI_TOKEN = process.env.MOCKAPI_TOKEN

  if (!MOCKAPI_TOKEN) {
    throw new ConfigurationError(
      "MOCKAPI_TOKEN environment variable is not defined"
    )
  }

  return `https://${MOCKAPI_TOKEN}.mockapi.io/api/v1`
}

export function getUserApiUrl(id?: string): string {
  const baseUrl = getApiBaseUrl()
  return id ? `${baseUrl}/users/${id}` : `${baseUrl}/users`
}

export function getPostApiUrl(postId?: string, userId?: string): string {
  const baseUrl = getApiBaseUrl()
  return userId
    ? postId
      ? `${baseUrl}/users/${userId}/posts/${postId}`
      : `${baseUrl}/users/${userId}/posts`
    : postId
      ? `${baseUrl}/posts/${postId}`
      : `${baseUrl}/posts`
}

// Add more functions for other entities as needed
