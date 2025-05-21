import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@/types/user"

export function UserDetail({ user }: { user: User }) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar className="size-14">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-lg font-bold">{user.name}</p>
        <p className="text-md text-gray-800">{user.email}</p>
        <p className="pt-1 text-sm text-gray-500">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
