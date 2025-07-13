import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { User } from "@/types/user"

interface UserListItemProps {
  user: User
}

export function UserListItem({ user }: UserListItemProps) {
  return (
    <Link href={`/user/${user.id}`}>
      <Card className="hover:bg-accent cursor-pointer p-4 transition-colors">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-semibold">{user.name}</h4>
            {user.bio && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {user.bio}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-xs">{user.email}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
