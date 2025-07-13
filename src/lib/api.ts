import { ConfigurationError } from "@/types/errors"
import { Post } from "@/types/post"
import { User } from "@/types/user"

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

// Search functions
export async function searchPosts(
  query: string,
  page = 1,
  limit = 10
): Promise<Post[]> {
  if (!query || query.trim() === "") {
    return []
  }

  const baseUrl = getApiBaseUrl()

  try {
    // MockAPI limitation: Can't do OR queries, so we need to make parallel requests
    // Search in title and content fields separately
    const [titleResults, contentResults] = await Promise.all([
      fetch(
        `${baseUrl}/posts?title=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      ),
      fetch(
        `${baseUrl}/posts?content=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      ),
    ])

    if (!titleResults.ok || !contentResults.ok) {
      throw new Error("Failed to search posts")
    }

    const titlePosts: Post[] = await titleResults.json()
    const contentPosts: Post[] = await contentResults.json()

    // Merge results and remove duplicates
    const postMap = new Map<string, Post>()

    // Add title matches first (higher priority)
    titlePosts.forEach((post) => postMap.set(post.id, post))

    // Add content matches (won't override title matches)
    contentPosts.forEach((post) => {
      if (!postMap.has(post.id)) {
        postMap.set(post.id, post)
      }
    })

    // Return deduplicated results
    return Array.from(postMap.values())
  } catch (error) {
    console.error("Error searching posts:", error)
    throw error
  }
}

export async function searchUsers(
  query: string,
  page = 1,
  limit = 10
): Promise<User[]> {
  if (!query || query.trim() === "") {
    return []
  }

  const baseUrl = getApiBaseUrl()

  try {
    // MockAPI limitation: Can't do OR queries, so we need to make parallel requests
    // Search in name and bio fields separately
    const [nameResults, bioResults] = await Promise.all([
      fetch(
        `${baseUrl}/users?name=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      ),
      fetch(
        `${baseUrl}/users?bio=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      ),
    ])

    if (!nameResults.ok || !bioResults.ok) {
      throw new Error("Failed to search users")
    }

    const nameUsers: User[] = await nameResults.json()
    const bioUsers: User[] = await bioResults.json()

    // Merge results and remove duplicates
    const userMap = new Map<string, User>()

    // Add name matches first (higher priority)
    nameUsers.forEach((user) => userMap.set(user.id, user))

    // Add bio matches (won't override name matches)
    bioUsers.forEach((user) => {
      if (!userMap.has(user.id)) {
        userMap.set(user.id, user)
      }
    })

    // Return deduplicated results
    return Array.from(userMap.values())
  } catch (error) {
    console.error("Error searching users:", error)
    throw error
  }
}
