"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getUserApiUrl } from "@/lib/api"
import {
  APIError,
  AuthenticationError,
  isAPIError,
  NotFoundError,
} from "@/types/errors"
import { CreateUserData, UpdateUserData, User } from "@/types/user"

import { checkAuth } from "../auth/actions"

type UserActionState = {
  message: string
  id?: string
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(getUserApiUrl(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to fetch users: ${response.statusText}`,
        response.status,
        getUserApiUrl()
      )
    }

    const users = await response.json()

    // Ensure likeUsers is always an array
    return users.map((user: User) => ({
      ...user,
      likeUsers: user.likeUsers || [],
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function getUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(getUserApiUrl(id), {
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
        `Failed to fetch user: ${response.statusText}`,
        response.status,
        getUserApiUrl(id)
      )
    }

    const user = await response.json()
    return {
      ...user,
      likeUsers: user.likeUsers || [],
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function createUserAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState | void> {
  let createdId: string | undefined
  try {
    const name = formData.get("name")?.toString()
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()
    const avatar = formData.get("avatar")?.toString()

    if (!name || !email || !password) {
      return {
        message: "Name, email, and password are required",
      }
    }

    const createData: CreateUserData = {
      name,
      email,
      password,
      avatar: avatar || "",
    }

    const response = await fetch(getUserApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createData),
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to create user: ${response.statusText}`,
        response.status,
        getUserApiUrl()
      )
    }

    const createdUser = await response.json()
    revalidatePath("/user")
    createdId = createdUser.id

    // Set session cookie so user is logged in after signup
    const cookieStore = await cookies()
    cookieStore.set({
      name: "session",
      value: JSON.stringify(createdUser),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })
  } catch (error: unknown) {
    console.error("Error creating user:", error)
    return {
      message: isAPIError(error) ? error.message : "Failed to create user",
    }
  }
  if (createdId) {
    redirect(`/user/${createdId}`)
  }
}

export async function updateUserAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState | void> {
  let updatedId: string | undefined
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to update a user")
    }

    const id = formData.get("id")?.toString()
    const name = formData.get("name")?.toString()
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()
    const avatar = formData.get("avatar")?.toString()

    if (!id) {
      return { message: "User ID is required" }
    }

    // Check if user exists and user owns it
    const existingUser = await getUser(id)
    if (!existingUser) {
      throw new NotFoundError("User", id)
    }

    if (existingUser.id !== authUser.id) {
      throw new AuthenticationError("You can only update your own profile")
    }

    const updateData: UpdateUserData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = password
    if (avatar !== undefined) updateData.avatar = avatar

    if (Object.keys(updateData).length === 0) {
      return { message: "No changes provided" }
    }

    const response = await fetch(getUserApiUrl(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to update user: ${response.statusText}`,
        response.status,
        getUserApiUrl(id)
      )
    }

    revalidatePath(`/user/${id}`)
    revalidatePath("/user")
    updatedId = id
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to update user",
    }
  }
  if (updatedId) {
    redirect(`/user/${updatedId}`)
  }
}

export async function deleteUserAction(
  prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to delete a user")
    }

    const id = formData.get("id")?.toString()
    if (!id) {
      return { message: "User ID is required" }
    }

    // Check if user exists and user owns it
    const existingUser = await getUser(id)
    if (!existingUser) {
      throw new NotFoundError("User", id)
    }

    if (existingUser.id !== authUser.id) {
      throw new AuthenticationError("You can only delete your own account")
    }

    const response = await fetch(getUserApiUrl(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      throw new NotFoundError("User", id)
    }

    if (!response.ok) {
      throw new APIError(
        `Failed to delete user: ${response.statusText}`,
        response.status,
        getUserApiUrl(id)
      )
    }

    revalidatePath("/user")
    return { message: "User deleted successfully" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to delete user",
    }
  }
}
