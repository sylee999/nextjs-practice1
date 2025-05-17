"use server"

import { revalidatePath } from "next/cache"

type State = {
  message: string
}

export async function createUser(prevState: State, formData: FormData) {
  const avatar = formData.get("avatar") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  if (!email || !password) {
    return { message: "Email and password are required." }
  }

  const MOCKAPI_TOKEN = process.env.MOCKAPI_TOKEN

  if (!MOCKAPI_TOKEN) {
    throw new Error("MOCKAPI_TOKEN environment variable is not defined.")
  }

  const apiUrl = `https://${MOCKAPI_TOKEN}.mockapi.io/api/v1/users`

  try {
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
    revalidatePath("/user")
    const result = await response.json()
    console.log(result)
    return { message: "success", id: result.id }
  } catch (error: unknown) {
    console.error("Error creating user:", error)
    return {
      message:
        error instanceof Error
          ? error.message
          : "Failed to create user. Please try again.",
    }
  }
}
