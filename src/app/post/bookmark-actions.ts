"use server"

import { revalidatePath } from "next/cache"

import { checkAuth } from "@/app/auth/actions"
import { getUser } from "@/app/user/actions"
import { getPostApiUrl, getUserApiUrl } from "@/lib/api"
import { BookmarkState } from "@/types/bookmark"
import {
  APIError,
  AuthenticationError,
  isAPIError,
  NotFoundError,
} from "@/types/errors"
import { Post } from "@/types/post"

import { getPost } from "./actions"

/**
 * Toggle bookmark status for a post
 * Handles dual-entity updates (Post and User) without transactions
 */
export async function toggleBookmarkAction(
  postId: string
): Promise<BookmarkState> {
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to bookmark posts")
    }

    // 1. Get current post data
    const post = await getPost(postId)
    if (!post) {
      throw new NotFoundError("Post", postId)
    }

    // 2. Get current user data
    const user = await getUser(authUser.id)
    if (!user) {
      throw new NotFoundError("User", authUser.id)
    }

    // 3. Determine current bookmark status
    const isCurrentlyBookmarked = (post.bookmarkedBy || []).includes(
      authUser.id
    )
    const newBookmarkStatus = !isCurrentlyBookmarked

    // 4. Update Post entity (add/remove user from bookmarkedBy array)
    const updatedBookmarkedBy = newBookmarkStatus
      ? [...(post.bookmarkedBy || []), authUser.id]
      : (post.bookmarkedBy || []).filter((id) => id !== authUser.id)

    const postResponse = await fetch(getPostApiUrl(postId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...post,
        bookmarkedBy: updatedBookmarkedBy,
      }),
    })

    if (!postResponse.ok) {
      throw new APIError(
        `Failed to update post bookmark: ${postResponse.statusText}`,
        postResponse.status,
        getPostApiUrl(postId)
      )
    }

    // 5. Update User entity (add/remove post from bookmarkedPosts array)
    const updatedBookmarkedPosts = newBookmarkStatus
      ? [...(user.bookmarkedPosts || []), postId]
      : (user.bookmarkedPosts || []).filter((id) => id !== postId)

    const userResponse = await fetch(getUserApiUrl(authUser.id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...user,
        bookmarkedPosts: updatedBookmarkedPosts,
      }),
    })

    if (!userResponse.ok) {
      // Log error but don't fail completely - post was already updated
      console.error(
        `Failed to update user bookmarks: ${userResponse.statusText}`
      )

      // Attempt to revert post update
      try {
        await fetch(getPostApiUrl(postId), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...post,
            bookmarkedBy: post.bookmarkedBy || [],
          }),
        })
      } catch (revertError) {
        console.error("Failed to revert post bookmark update:", revertError)
      }

      throw new APIError(
        `Failed to update user bookmarks: ${userResponse.statusText}`,
        userResponse.status,
        getUserApiUrl(authUser.id)
      )
    }

    // 6. Revalidate relevant paths
    revalidatePath(`/post/${postId}`)
    revalidatePath(`/user/${authUser.id}`)
    revalidatePath("/post")

    return {
      message: newBookmarkStatus
        ? "Post bookmarked successfully"
        : "Bookmark removed successfully",
      success: true,
      isBookmarked: newBookmarkStatus,
    }
  } catch (error) {
    console.error("Bookmark toggle error:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to update bookmark",
      success: false,
    }
  }
}

/**
 * Get user's bookmarked posts
 */
export async function getUserBookmarks(userId: string): Promise<Post[]> {
  try {
    const user = await getUser(userId)
    if (!user?.bookmarkedPosts?.length) {
      return []
    }

    // Fetch all bookmarked posts
    const bookmarkPromises = user.bookmarkedPosts.map((postId) =>
      getPost(postId)
    )
    const bookmarkedPosts = await Promise.all(bookmarkPromises)

    // Filter out any null results (deleted posts)
    return bookmarkedPosts.filter((post) => post !== null) as Post[]
  } catch (error) {
    console.error("Error fetching user bookmarks:", error)
    return []
  }
}

/**
 * Check if user bookmarked a specific post
 */
export async function isPostBookmarked(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    const post = await getPost(postId)
    return (post?.bookmarkedBy || []).includes(userId)
  } catch (error) {
    console.error("Error checking bookmark status:", error)
    return false
  }
}

/**
 * Get bookmark count for a post
 */
export async function getPostBookmarkCount(postId: string): Promise<number> {
  try {
    const post = await getPost(postId)
    return (post?.bookmarkedBy || []).length
  } catch (error) {
    console.error("Error getting bookmark count:", error)
    return 0
  }
}
