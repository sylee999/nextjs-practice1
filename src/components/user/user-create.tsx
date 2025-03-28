"use client"

import { useState } from "react"

interface APIError {
  message: string
}

const UserCreate = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const response = await fetch(
        "https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
        }
      )

      if (response.ok) {
        // Reset form
        setName("")
        setEmail("")
        alert("User created successfully!")
      } else {
        try {
          const errorData = (await response.json()) as APIError
          console.error("Failed to create user:", errorData)
          alert(
            `Failed to create user: ${errorData.message || "Unknown error"}`
          )
        } catch {
          console.error("Error creating user")
          alert("Error creating user")
        }
      }
    } catch {
      console.error("Error creating user")
      alert("Error creating user")
    }
  }

  return (
    <div>
      <h2>Create User</h2>
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
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

export default UserCreate
