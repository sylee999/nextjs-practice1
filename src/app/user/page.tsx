import { UserList } from "@/components/user/user-list"

async function getUsers() {
  try {
    const MOCKAPI_TOKEN = process.env.MOCKAPI_TOKEN

    if (!MOCKAPI_TOKEN) {
      throw new Error("MOCKAPI_TOKEN environment variable is not defined.")
    }

    const apiUrl = `https://${MOCKAPI_TOKEN}.mockapi.io/api/v1/users`

    const response = await fetch(apiUrl, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(
        `Failed to fetch users: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export default async function UserPage() {
  const users = await getUsers()

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
      </div>
      <UserList users={users} />
    </div>
  )
}
