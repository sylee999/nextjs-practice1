export function getApiBaseUrl(): string {
  const MOCKAPI_TOKEN = process.env.MOCKAPI_TOKEN

  if (!MOCKAPI_TOKEN) {
    throw new Error("MOCKAPI_TOKEN environment variable is not defined.")
  }

  return `https://${MOCKAPI_TOKEN}.mockapi.io/api/v1`
}

export function getUserApiUrl(id?: string): string {
  const baseUrl = getApiBaseUrl()
  return id ? `${baseUrl}/users/${id}` : `${baseUrl}/users`
}

export function getPostApiUrl(id?: string): string {
  const baseUrl = getApiBaseUrl()
  return id ? `${baseUrl}/posts/${id}` : `${baseUrl}/posts`
}

// mockapi only supports DELETE post method for users/{id}/posts/{postId}
export function getDeletePostApiUrl(userId: string, postId: string): string {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}/users/${userId}/posts/${postId}`
}
// Add more functions for other entities as needed
