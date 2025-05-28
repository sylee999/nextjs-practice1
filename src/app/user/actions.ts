"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getUserApiUrl } from "@/lib/api"
import { User } from "@/types/user"

import { checkAuth, fetchLoginUser, logout } from "../auth/actions"

type State = {
  message: string
}

export async function getUsers(): Promise<User[]> {
  try {
    const apiUrl = getUserApiUrl()

    const response = await fetch(apiUrl, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch users: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function getUser(id: string): Promise<User | null> {
  try {
    const apiUrl = getUserApiUrl(id)
    const response = await fetch(apiUrl, { cache: "no-store" })
    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function createUserAction(prevState: State, formData: FormData) {
  const avatar = formData.get("avatar") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  if (!email || !password) {
    return { message: "Email and password are required.", id: "" }
  }

  try {
    const apiUrl = getUserApiUrl()
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar,
        name,
        email,
        password, // In a real app, this should be hashed before sending
        createdAt: new Date().toISOString(),
      }),
    })
    if (!response.ok) {
      throw new Error(
        `Failed to create user: ${response.status} ${response.statusText}`
      )
    }
    const result = await response.json()
    const user = await fetchLoginUser(email, password)
    const cookieStore = await cookies()
    cookieStore.set({
      name: "session",
      value: JSON.stringify(user),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })
    revalidatePath("/user")
    return { message: "success", id: String(result.id) }
  } catch (error: unknown) {
    console.error("Error creating user:", error)
    return {
      message:
        error instanceof Error
          ? error.message
          : "Failed to create user. Please try again.",
      id: "",
    }
  }
}

export async function deleteUserAction(prevState: State, formData: FormData) {
  const id = formData.get("id") as string
  const authUser = await checkAuth()
  if (!authUser || authUser.id !== id) {
    return { message: "You are not authorized to delete this user." }
  }
  await logout()

  try {
    const apiUrl = getUserApiUrl(id)
    const response = await fetch(apiUrl, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(
        `Failed to delete user: ${response.status} ${response.statusText}`
      )
    }
    revalidatePath("/user")
    return { message: "success" }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete user. Please try again.",
    }
  }
}
