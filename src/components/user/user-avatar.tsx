import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@/types/user"

const notLoggedUser = {
  id: "",
  name: "Guest",
  avatar: "",
  email: "",
  createdAt: new Date(),
}

interface UserAvatarProps {
  user: User | null
}

export function UserAvatar({ user }: UserAvatarProps): React.JSX.Element {
  const displayUser = user || notLoggedUser

  return (
    <Avatar className="size-8">
      <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
        {displayUser.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
