import { memo } from "react"
import Link from "next/link"

import { UserAvatar } from "@/components/user/user-avatar"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

interface FollowingListProps {
  followingUsers: User[]
  className?: string
}

/**
 * FollowingList component for displaying a list of users that someone is following
 * Shows as a grid of user cards with avatars and names
 *
 * @param followingUsers - Array of user objects that the user is following
 * @param className - Additional CSS classes
 */
export const FollowingList = memo(function FollowingList({
  followingUsers,
  className,
}: FollowingListProps): React.JSX.Element {
  if (!followingUsers || followingUsers.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <p className="text-muted-foreground">Not following anyone yet.</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {followingUsers.map((user) => (
          <Link
            key={user.id}
            href={`/user/${user.id}`}
            className="group block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                user={user}
                size="md"
                className="transition-transform group-hover:scale-105"
              />
              <div className="min-w-0 flex-1">
                <p className="group-hover:text-primary truncate font-medium text-gray-900 transition-colors">
                  {user.name}
                </p>
                <p className="truncate text-sm text-gray-500">{user.email}</p>
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
                  <span>{user.followers?.length || 0} followers</span>
                  <span>{user.following?.length || 0} following</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
})

FollowingList.displayName = "FollowingList"
