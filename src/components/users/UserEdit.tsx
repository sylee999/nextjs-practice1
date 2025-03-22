'use client'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
}

const UserEdit = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

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
            const errorData = await response.json()
            console.error('Failed to fetch user:', errorData)
            alert(
              `Failed to fetch user: ${errorData.message || 'Unknown error'}`
            )
          } catch (parseError) {
            console.error('Failed to fetch user:', response.statusText)
            alert(`Failed to fetch user: ${response.statusText}`)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        alert('Error fetching user')
      }
    }

    fetchUser()
  }, [userId])

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email }),
        }
      )

      if (response.ok) {
        alert('User updated successfully!')
      } else {
        try {
          const errorData = await response.json()
          console.error('Failed to update user:', errorData)
          alert(
            `Failed to update user: ${errorData.message || 'Unknown error'}`
          )
        } catch (parseError) {
          console.error('Failed to update user:', response.statusText)
          alert(`Failed to update user: ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
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
