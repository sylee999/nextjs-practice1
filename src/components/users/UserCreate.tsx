'use client'
import React, { useState } from 'react'

const UserCreate = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      const response = await fetch(
        'https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email }),
        }
      )

      if (response.ok) {
        // Reset form
        setName('')
        setEmail('')
        alert('User created successfully!')
      } else {
        console.error('Failed to create user')
        alert('Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user')
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
