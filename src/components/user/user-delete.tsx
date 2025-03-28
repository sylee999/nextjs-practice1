"use client"

interface APIError {
  message: string
}

const UserDelete = ({ userId }: { userId: string }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `https://6601b60f6a8b6a4a6ea395a5.mockapi.io/api/v1/users/${userId}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        alert("User deleted successfully!")
      } else {
        try {
          const errorData = (await response.json()) as APIError
          console.error("Failed to delete user:", errorData)
          alert(
            `Failed to delete user: ${errorData.message || "Unknown error"}`
          )
        } catch {
          console.error("Failed to delete user:", response.statusText)
          alert(`Failed to delete user: ${response.statusText}`)
        }
      }
    } catch {
      console.error("Error deleting user")
      alert("Error deleting user")
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
