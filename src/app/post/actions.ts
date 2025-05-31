"use server"

import { revalidatePath } from "next/cache"

import { checkAuth } from "@/app/auth/actions"
import { getPostApiUrl } from "@/lib/api"
import {
  APIError,
  AuthenticationError,
  isAPIError,
  NotFoundError,
} from "@/types/errors"
import { CreatePostData, Post, UpdatePostData } from "@/types/post"

type PostActionState = {
  message: string
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

    // Ensure likeUsers is always an array
    return posts.map((post: Post) => ({
      ...post,
      likeUsers: post.likeUsers || [],
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
      likeUsers: post.likeUsers || [],
    }
  } catch (error) {
    console.error("Error fetching post:", error)
    throw error
  }
}

export async function createPostAction(
  prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
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

    revalidatePath("/post")
    return { message: "Post created successfully" }
  } catch (error: unknown) {
    console.error("Error creating post:", error)
    return {
      message:
        isAPIError(error) || error instanceof AuthenticationError
          ? error.message
          : "Failed to create post",
    }
  }
}

export async function updatePostAction(
  prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to update a post")
    }

    const id = formData.get("id")?.toString()
    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()

    if (!id) {
      return { message: "Post ID is required" }
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
      return { message: "No changes provided" }
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
    return { message: "Post updated successfully" }
  } catch (error) {
    console.error("Error updating post:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to update post",
    }
  }
}

export async function deletePostAction(
  prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to delete a post")
    }

    const id = formData.get("id")?.toString()
    if (!id) {
      return { message: "Post ID is required" }
    }

    // Check if post exists and user owns it
    const existingPost = await getPost(id)
    if (!existingPost) {
      throw new NotFoundError("Post", id)
    }

    if (existingPost.userId !== authUser.id) {
      throw new AuthenticationError("You can only delete your own posts")
    }

    const response = await fetch(getPostApiUrl(id), {
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
    return { message: "Post deleted successfully" }
  } catch (error) {
    console.error("Error deleting post:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to delete post",
    }
  }
}
