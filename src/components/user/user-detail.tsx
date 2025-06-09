import { memo } from "react"

import { UserAvatar } from "@/components/user/user-avatar"
import type { UserComponentProps } from "@/types/components"

/**
 * UserDetail component for displaying user information
 * Optimized with React.memo for performance
 *
 * @param user - User object to display
 */
export const UserDetail = memo(function UserDetail({
  user,
}: UserComponentProps): React.JSX.Element {
  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors">
      <UserAvatar user={user} size="md" />
      <div className="flex flex-col">
        <span className="font-medium">{user.name}</span>
        <span className="text-muted-foreground text-sm">{user.email}</span>
      </div>
    </div>
  )
})

UserDetail.displayName = "UserDetail"
