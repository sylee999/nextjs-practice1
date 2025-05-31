import Link from "next/link"

import { UserDetail } from "@/components/user/user-detail"
import { User } from "@/types/user"

interface UserListProps {
  users: User[]
}

export function UserList({ users }: UserListProps): React.JSX.Element {
  if (!users || users.length === 0) {
    return <p>No users found.</p>
  }

  return (
    <ul className="space-y-4" data-testid="user-list">
      {users.map((user) => (
        <li key={user.id} data-testid={`user-${user.id}`}>
          <Link href={`/user/${user.id}`}>
            <UserDetail user={user} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
