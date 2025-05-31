import { checkAuth } from "@/app/auth/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutLabel } from "@/components/user/logout-label"
import { UserAvatar } from "@/components/user/user-avatar"

export async function UserDropdown(): Promise<React.JSX.Element> {
  const authUser = await checkAuth()

  if (!authUser) {
    return <div></div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-accent flex items-center gap-2 rounded-lg p-2">
          <UserAvatar user={authUser} />
          <span className="text-sm font-medium">{authUser.name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <a href={`/user/${authUser.id}`} className="flex items-center gap-3">
            <span>Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`/user/${authUser.id}/edit`}
            className="flex items-center gap-3"
          >
            <span>Edit Profile</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutLabel />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
