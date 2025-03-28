import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  createdAt: string // Assuming ISO string format
  name: string
  avatar: string // URL
}

interface UserListProps {
  users: User[]
}

export function UserList({ users }: UserListProps) {
  if (!users || users.length === 0) {
    return <p>No users found.</p>
  }

  return (
    <ul className="space-y-4" data-testid="user-list">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex items-center justify-between rounded-md border p-4"
          data-testid={`user-${user.id}`}
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {/* Placeholder for action buttons (Edit/Delete) */}
          <div></div>
        </li>
      ))}
    </ul>
  )
}
