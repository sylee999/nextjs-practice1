'use client'
import { useEffect, useState } from 'react'

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
          'https://67dc2dda1fd9e43fe4778cd6.mockapi.io/api/v1/users'
        )
        if (response.ok) {
          const data: User[] = await response.json()
          setUsers(data)
        } else {
          try {
            const errorData = await response.json()
            console.error('Failed to fetch users:', errorData)
          } catch (parseError) {
            console.error('Failed to fetch users:', response.statusText)
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <h1 className="text-2xl font-bold">Team Members</h1>
      <p className="text-gray-400">Create your new team member.</p>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="flex items-center py-2">
            {/* Placeholder for avatar */}
            <div className="mr-2 h-8 w-8 rounded-full bg-gray-600"></div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserList
