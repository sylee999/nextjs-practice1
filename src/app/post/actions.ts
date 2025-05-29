"use server"

import { revalidatePath } from "next/cache"

import { checkAuth } from "@/app/auth/actions"
import { getPostApiUrl } from "@/lib/api"
import { CreatePostData, Post, UpdatePostData } from "@/types/post"

type State = {
  message: string
}

export async function getPosts(): Promise<Post[]> {
  try {
    const apiUrl = getPostApiUrl()

    const response = await fetch(apiUrl, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch posts: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const apiUrl = getPostApiUrl(id)
    const response = await fetch(apiUrl, { cache: "no-store" })
    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching post:", error)
    throw error
  }
}

export async function createPostAction(prevState: State, formData: FormData) {
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { message: "Title and content are required.", id: "" }
  }

  // Check authentication
  const authUser = await checkAuth()
  if (!authUser) {
    return { message: "You must be logged in to create a post.", id: "" }
  }

  try {
    const apiUrl = getPostApiUrl()
    const postData: CreatePostData = {
      userId: authUser.id,
      title,
      content,
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...postData,
        likeUsers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to create post: ${response.status} ${response.statusText}`
      )
    }

    const result = await response.json()
    revalidatePath("/post")
    return { message: "success", id: String(result.id) }
  } catch (error: unknown) {
    console.error("Error creating post:", error)
    return {
      message:
        error instanceof Error
          ? error.message
          : "Failed to create post. Please try again.",
      id: "",
    }
  }
}

export async function updatePostAction(prevState: State, formData: FormData) {
  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!id || !title || !content) {
    return { message: "ID, title, and content are required." }
  }

  // Check authentication
  const authUser = await checkAuth()
  if (!authUser) {
    return { message: "You must be logged in to update a post." }
  }

  // Check if user owns the post
  const existingPost = await getPost(id)
  if (!existingPost) {
    return { message: "Post not found." }
  }

  if (existingPost.userId !== authUser.id) {
    return { message: "You are not authorized to update this post." }
  }

  try {
    const apiUrl = getPostApiUrl(id)
    const updateData: UpdatePostData = {
      title,
      content,
    }

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updateData,
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to update post: ${response.status} ${response.statusText}`
      )
    }

    revalidatePath("/post")
    revalidatePath(`/post/${id}`)
    return { message: "success" }
  } catch (error) {
    console.error("Error updating post:", error)
    return {
      message:
        error instanceof Error
          ? error.message
          : "Failed to update post. Please try again.",
    }
  }
}

export async function deletePostAction(prevState: State, formData: FormData) {
  const id = formData.get("id") as string

  if (!id) {
    return { message: "Post ID is required." }
  }

  // Check authentication
  const authUser = await checkAuth()
  if (!authUser) {
    return { message: "You must be logged in to delete a post." }
  }

  // Check if user owns the post
  const existingPost = await getPost(id)
  if (!existingPost) {
    return { message: "Post not found." }
  }

  if (existingPost.userId !== authUser.id) {
    return { message: "You are not authorized to delete this post." }
  }

  try {
    const apiUrl = getPostApiUrl(id)
    const response = await fetch(apiUrl, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(
        `Failed to delete post: ${response.status} ${response.statusText}`
      )
    }

    revalidatePath("/post")
    return { message: "success" }
  } catch (error) {
    console.error("Error deleting post:", error)
    return {
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete post. Please try again.",
    }
  }
}
