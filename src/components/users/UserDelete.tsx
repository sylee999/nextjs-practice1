'use client'
import React from 'react'

interface User {
  id: string
}

const UserDelete = ({ userId }: { userId: string }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users/${userId}`
      )

      if (response.ok) {
        alert('User deleted successfully!')
      } else {
        console.error('Failed to delete user')
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  return (
    <div>
      <h2>Delete User</h2>
      <button onClick={handleDelete}>Delete</button>
    </div>
  )
}

export default UserDelete
