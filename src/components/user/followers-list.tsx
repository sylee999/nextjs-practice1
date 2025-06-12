import { memo } from "react"
import Link from "next/link"

import { UserAvatar } from "@/components/user/user-avatar"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

interface FollowersListProps {
  followers: User[]
  maxDisplay?: number
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

/**
 * FollowersAvatarList component for displaying a horizontal list of follower avatars
 * Clickable avatars that navigate to user profiles
 *
 * @param followers - Array of follower user objects
 * @param maxDisplay - Maximum number of avatars to display (default: 5)
 * @param size - Avatar size variant
 * @param className - Additional CSS classes
 */
export const FollowersAvatarList = memo(function FollowersAvatarList({
  followers,
  maxDisplay = 5,
  size = "sm",
  className,
}: FollowersListProps): React.JSX.Element | null {
  if (!followers || followers.length === 0) {
    return null
  }

  const displayedFollowers = followers.slice(0, maxDisplay)
  const remainingCount = followers.length - maxDisplay

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Follower Avatars */}
      <div className="flex -space-x-1">
        {displayedFollowers.map((follower) => (
          <Link
            key={follower.id}
            href={`/user/${follower.id}`}
            className="group relative transition-transform hover:z-10 hover:scale-110"
            title={follower.name}
          >
            <UserAvatar
              user={follower}
              size={size}
              className="border-2 border-white shadow-sm transition-shadow group-hover:shadow-md"
            />
          </Link>
        ))}
      </div>

      {/* Remaining Count */}
      {remainingCount > 0 && (
        <div className="text-muted-foreground ml-2 text-xs">
          +{remainingCount} more
        </div>
      )}

      {/* Total Count */}
      {followers.length > 0 && (
        <div className="text-muted-foreground ml-2 text-xs">
          {followers.length} follower{followers.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
})

FollowersAvatarList.displayName = "FollowersAvatarList"
