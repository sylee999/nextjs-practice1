import { UserList } from "@/components/user/user-list"

import { getUsers } from "./actions"

export default async function UserPage() {
  const users = await getUsers()

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <UserList users={users} />
    </div>
  )
}
