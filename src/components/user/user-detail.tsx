import { memo } from "react"

import { FollowButton } from "@/components/user/follow-button"
import { UserAvatar } from "@/components/user/user-avatar"
import type { UserComponentProps } from "@/types/components"

interface UserDetailProps extends UserComponentProps {
  bookmarkCount?: number
  currentUserId?: string | null | undefined
  isFollowing?: boolean
  onFollowToggle?: () => void
  showFollowButton?: boolean
}

/**
 * Formats a date string to a consistent format (YYYY-MM-DD)
 * This ensures server and client render the same output
 */
function formatDate(dateInput: string | Date): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * UserDetail component for displaying user information with follow functionality
 * Optimized with React.memo for performance
 *
 * @param user - User object to display
 * @param bookmarkCount - Number of bookmarked posts
 * @param currentUserId - ID of current authenticated user
 * @param isFollowing - Whether current user is following this user
 * @param onFollowToggle - Callback for follow toggle
 * @param showFollowButton - Whether to show the follow button
 */
export const UserDetail = memo(function UserDetail({
  user,
  bookmarkCount = 0,
  currentUserId,
  isFollowing = false,
  onFollowToggle,
  showFollowButton = false,
}: UserDetailProps): React.JSX.Element {
  if (!user) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center text-gray-500">User not found</div>
      </div>
    )
  }

  const followersCount = user.followers?.length || 0
  const followingCount = user.following?.length || 0

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Follow Button */}
        {showFollowButton && (
          <FollowButton
            currentUserId={currentUserId}
            targetUserId={user.id}
            isFollowing={isFollowing}
            onToggle={onFollowToggle}
            size="default"
            variant="outline"
          />
        )}
      </div>

      {/* User Stats */}
      <div className="mt-6 flex items-center gap-8 border-t border-gray-100 pt-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {bookmarkCount}
          </div>
          <div className="text-sm text-gray-600">
            {bookmarkCount === 1 ? "Bookmark" : "Bookmarks"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {followersCount}
          </div>
          <div className="text-sm text-gray-600">
            {followersCount === 1 ? "Follower" : "Followers"}
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {followingCount}
          </div>
          <div className="text-sm text-gray-600">Following</div>
        </div>
      </div>
    </div>
  )
})

UserDetail.displayName = "UserDetail"
