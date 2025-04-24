"use server"

import { revalidatePath } from "next/cache"

type State = {
  message: string
}

export async function createUser(prevState: State, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const avatar = formData.get("avatar") as string

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
        name,
        email,
        avatar,
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to create user: ${response.status} ${response.statusText}`
      )
    }

    revalidatePath("/user")
    return { message: "User created successfully!" }
  } catch (error: unknown) {
    console.error("Error creating user:", error)
    return {
      message: "Failed to create user. Please try again.",
    }
  }
}
