'use client'
import React, { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          'https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users'
        )
        const data: User[] = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserList
