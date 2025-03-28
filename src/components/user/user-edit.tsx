"use client"

import * as React from "react"
import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface APIError {
  message: string
}

const UserEdit = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users/${userId}`
        )
        if (response.ok) {
          const data: User = await response.json()
          setUser(data)
          setName(data.name)
          setEmail(data.email)
        } else {
          try {
            const errorData = (await response.json()) as APIError
            console.error("Failed to fetch user:", errorData)
            alert(
              `Failed to fetch user: ${errorData.message || "Unknown error"}`
            )
          } catch {
            // Catch block for inner try
            console.error("Failed to fetch user:", response.statusText)
            alert(`Failed to fetch user: ${response.statusText}`)
          }
        }
      } catch {
        // Catch block for outer try
        console.error("Error fetching user")
        alert("Error fetching user")
      }
    }

    fetchUser()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
        }
      )

      if (response.ok) {
        alert("User updated successfully!")
      } else {
        try {
          const errorData = (await response.json()) as APIError
          console.error("Failed to update user:", errorData)
          alert(
            `Failed to update user: ${errorData.message || "Unknown error"}`
          )
        } catch {
          // Catch block for inner try
          console.error("Failed to update user:", response.statusText)
          alert(`Failed to update user: ${response.statusText}`)
        }
      }
    } catch {
      // Catch block for outer try
      console.error("Error updating user")
      alert("Error updating user")
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Edit User</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Update</button>
      </form>
    </div>
  )
}

export default UserEdit
