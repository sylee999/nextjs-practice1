import { AvatarFallback } from "@radix-ui/react-avatar"
import { Avatar, AvatarImage } from "../ui/avatar"
import { User } from "@/types/user"

const notLoggedUser = {
  id: "",
  name: "Not logged in",
  avatar: "/default-avatar.png",
  email: "",
  createdAt: "",
}

export function UserAvatar({ user }: { user: User | null }) {
  const loggedUser = user || notLoggedUser
  return (
    <Avatar>
      <AvatarImage src={loggedUser.avatar} alt={loggedUser.name} />
      <AvatarFallback>{loggedUser.name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}
