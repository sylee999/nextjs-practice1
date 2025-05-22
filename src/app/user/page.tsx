import { UserList } from "@/components/user/user-list"

import { getUsers } from "./actions"

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
