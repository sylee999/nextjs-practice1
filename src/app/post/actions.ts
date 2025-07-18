"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { checkAuth } from "@/app/auth/actions"
import { getUser } from "@/app/user/actions"
import { getPostApiUrl, getUserApiUrl } from "@/lib/api"
import {
  APIError,
  AuthenticationError,
  isAPIError,
  NotFoundError,
} from "@/types/errors"
import { CreatePostData, Post, UpdatePostData } from "@/types/post"
import { User } from "@/types/user"

type PostActionState = {
  message: string
  id?: string
  success: boolean
}

export async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch(getPostApiUrl(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to fetch posts: ${response.statusText}`,
        response.status,
        getPostApiUrl()
      )
    }

    const posts = await response.json()

    // Ensure bookmarkedBy is always an array
    return posts.map((post: Post) => ({
      ...post,
      bookmarkedBy: post.bookmarkedBy || [],
    }))
  } catch (error) {
    console.error("Error fetching posts:", error)
    throw error
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const response = await fetch(getPostApiUrl(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new APIError(
        `Failed to fetch post: ${response.statusText}`,
        response.status,
        getPostApiUrl(id)
      )
    }

    const post = await response.json()
    return {
      ...post,
      bookmarkedBy: post.bookmarkedBy || [],
    }
  } catch (error) {
    console.error("Error fetching post:", error)
    throw error
  }
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const response = await fetch(getPostApiUrl(undefined, userId), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      throw new APIError(
        `Failed to fetch user posts: ${response.statusText}`,
        response.status,
        getPostApiUrl(undefined, userId)
      )
    }

    const posts = await response.json()

    // Ensure bookmarkedBy is always an array
    return posts.map((post: Post) => ({
      ...post,
      bookmarkedBy: post.bookmarkedBy || [],
    }))
  } catch (error) {
    console.error("Error fetching user posts:", error)
    throw error
  }
}

export async function createPostAction(
  prevState: PostActionState | void,
  formData: FormData
): Promise<PostActionState | void> {
  let createdId: string | undefined
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to create a post")
    }

    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()

    if (!title || !content) {
      return {
        message: "Title and content are required",
        success: false,
      }
    }

    const createData: CreatePostData = {
      userId: authUser.id,
      title,
      content,
    }

    const response = await fetch(getPostApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createData),
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to create post: ${response.statusText}`,
        response.status,
        getPostApiUrl()
      )
    }

    const createdPost = await response.json()
    revalidatePath("/post")
    createdId = createdPost.id
  } catch (error: unknown) {
    console.error("Error creating post:", error)
    return {
      message:
        isAPIError(error) || error instanceof AuthenticationError
          ? error.message
          : "Failed to create post",
      success: false,
    }
  }
  if (createdId) {
    redirect(`/post/${createdId}`)
  }
  return { message: "", success: false }
}

export async function updatePostAction(
  prevState: PostActionState | void,
  formData: FormData
): Promise<PostActionState | void> {
  let updatedId: string | undefined
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to update a post")
    }

    const id = formData.get("id")?.toString()
    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()

    if (!id) {
      return { message: "Post ID is required", success: false }
    }

    // Check if post exists and user owns it
    const existingPost = await getPost(id)
    if (!existingPost) {
      throw new NotFoundError("Post", id)
    }

    if (existingPost.userId !== authUser.id) {
      throw new AuthenticationError("You can only update your own posts")
    }

    const updateData: UpdatePostData = {}
    if (title) updateData.title = title
    if (content) updateData.content = content

    if (Object.keys(updateData).length === 0) {
      return { message: "No changes provided", success: false }
    }

    const response = await fetch(getPostApiUrl(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to update post: ${response.statusText}`,
        response.status,
        getPostApiUrl(id)
      )
    }

    revalidatePath(`/post/${id}`)
    revalidatePath("/post")
    updatedId = id
  } catch (error) {
    console.error("Error updating post:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to update post",
      success: false,
    }
  }
  if (updatedId) {
    redirect(`/post/${updatedId}`)
  }
  return { message: "", success: false }
}

export async function deletePostAction(
  prevState: PostActionState | void,
  formData: FormData
): Promise<PostActionState | void> {
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to delete a post")
    }

    const id = formData.get("id")?.toString()
    if (!id) {
      return { message: "Post ID is required", success: false }
    }

    // Check if post exists and user owns it
    const existingPost = await getPost(id)
    if (!existingPost) {
      throw new NotFoundError("Post", id)
    }

    if (existingPost.userId !== authUser.id) {
      throw new AuthenticationError("You can only delete your own posts")
    }

    const response = await fetch(getPostApiUrl(id, authUser.id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Handle specific error cases
    if (response.status === 404) {
      throw new NotFoundError("Post", id)
    }

    if (!response.ok) {
      throw new APIError(
        `Failed to delete post: ${response.statusText}`,
        response.status,
        getPostApiUrl(id)
      )
    }

    revalidatePath("/post")
  } catch (error) {
    console.error("Error deleting post:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to delete post",
      success: false,
    }
  }

  // Redirect to post list page after successful deletion
  redirect("/post")
}

/**
 * Fetches posts from all users that the current user follows.
 * Used for the personalized home feed.
 * Returns posts sorted by creation date (newest first).
 */
export async function getPostsFromFollowedUsers(): Promise<{
  posts: Post[]
  authors: User[]
}> {
  try {
    // Step 1: Check authentication
    const authUser = await checkAuth()
    if (!authUser) {
      // Return empty posts for unauthenticated users
      return { posts: [], authors: [] }
    }

    // Step 2: Get current user's following list
    const currentUser = await getUser(authUser.id)
    if (!currentUser) {
      throw new APIError(
        "Failed to fetch current user data",
        404,
        getUserApiUrl(authUser.id)
      )
    }

    // Handle edge case: user follows no one
    const followingList = currentUser.following || []
    if (followingList.length === 0) {
      return { posts: [], authors: [] }
    }

    // Step 3: Fetch posts from all followed users in parallel
    const postPromises = followingList.map((userId) => getUserPosts(userId))
    const userPromises = followingList.map((userId) => getUser(userId))

    const [allPostsArrays, allUsers] = await Promise.all([
      Promise.allSettled(postPromises),
      Promise.allSettled(userPromises),
    ])

    // Step 4: Process results and handle partial failures
    const allPosts: Post[] = []
    const authors: User[] = []

    // Process posts
    allPostsArrays.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        allPosts.push(...result.value)
      } else {
        console.error(
          `Failed to fetch posts for user ${followingList[index]}:`,
          result.status === "rejected" ? result.reason : "Unknown error"
        )
      }
    })

    // Process authors
    allUsers.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        authors.push(result.value)
      } else {
        console.error(
          `Failed to fetch user data for ${followingList[index]}:`,
          result.status === "rejected" ? result.reason : "Unknown error"
        )
      }
    })

    // Step 5: Sort posts by creation date (newest first)
    const sortedPosts = allPosts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA // Newest first
    })

    return { posts: sortedPosts, authors }
  } catch (error) {
    console.error("Error fetching posts from followed users:", error)
    // Re-throw authentication errors
    if (error instanceof AuthenticationError) {
      throw error
    }
    // Return empty results for other errors to allow graceful degradation
    return { posts: [], authors: [] }
  }
}

/**
 * Fetches popular posts for the public home feed.
 * Used when users are not authenticated or as a fallback.
 * Returns posts sorted by popularity criteria (newest and most bookmarked).
 */
export async function getPopularPosts(limit = 20): Promise<{
  posts: Post[]
  authors: User[]
}> {
  try {
    // Step 1: Fetch all posts
    const allPosts = await getPosts()

    // Step 2: Sort posts by popularity criteria
    // Primary: Number of bookmarks (descending)
    // Secondary: Creation date (newest first)
    const sortedPosts = allPosts.sort((a, b) => {
      // First, compare by bookmark count
      const bookmarkDiff =
        (b.bookmarkedBy?.length || 0) - (a.bookmarkedBy?.length || 0)
      if (bookmarkDiff !== 0) {
        return bookmarkDiff
      }

      // If bookmark counts are equal, sort by creation date
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA // Newest first
    })

    // Step 3: Limit the number of posts
    const popularPosts = sortedPosts.slice(0, limit)

    // Step 4: Get unique author IDs
    const uniqueAuthorIds = [
      ...new Set(popularPosts.map((post) => post.userId)),
    ]

    // Step 5: Fetch author information in parallel
    const authorPromises = uniqueAuthorIds.map((userId) => getUser(userId))
    const authorResults = await Promise.allSettled(authorPromises)

    // Step 6: Process author results
    const authors: User[] = []
    authorResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        authors.push(result.value)
      } else {
        console.error(
          `Failed to fetch author data for user ${uniqueAuthorIds[index]}:`,
          result.status === "rejected" ? result.reason : "Unknown error"
        )
      }
    })

    return { posts: popularPosts, authors }
  } catch (error) {
    console.error("Error fetching popular posts:", error)
    // Return empty results for errors to allow graceful degradation
    return { posts: [], authors: [] }
  }
}
