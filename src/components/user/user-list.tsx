"use client"
import { UserDetail } from "@/components/user/user-detail"

import { User } from "@/types/user"
import { useRouter } from "next/navigation"

export function UserList({ users }: { users: User[] }) {
  const router = useRouter()
  if (!users || users.length === 0) {
    return <p>No users found.</p>
  }

  return (
    <ul className="space-y-4" data-testid="user-list">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex cursor-pointer items-center justify-between rounded-md border p-4 hover:bg-gray-50"
          data-testid={`user-${user.id}`}
          onClick={() => router.push(`/user/${user.id}`)}
        >
          <UserDetail user={user} />
        </li>
      ))}
    </ul>
  )
}
