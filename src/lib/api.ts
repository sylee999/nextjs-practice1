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

// Add more functions for other entities as needed, e.g., getPostApiUrl
