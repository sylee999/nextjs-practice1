import { memo } from "react"

import { UserAvatar } from "@/components/user/user-avatar"
import type { UserComponentProps } from "@/types/components"

interface UserDetailProps extends UserComponentProps {
  bookmarkCount?: number
}

/**
 * UserDetail component for displaying user information
 * Optimized with React.memo for performance
 *
 * @param user - User object to display
 * @param bookmarkCount - Number of bookmarked posts
 */
export const UserDetail = memo(function UserDetail({
  user,
  bookmarkCount = 0,
}: UserDetailProps): React.JSX.Element {
  if (!user) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center text-gray-500">User not found</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* User Stats */}
      <div className="mt-6 flex items-center gap-6 border-t border-gray-100 pt-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {bookmarkCount}
          </div>
          <div className="text-sm text-gray-600">
            {bookmarkCount === 1 ? "Bookmark" : "Bookmarks"}
          </div>
        </div>
        {/* Future stats can be added here (followers, following, etc.) */}
      </div>
    </div>
  )
})

UserDetail.displayName = "UserDetail"
