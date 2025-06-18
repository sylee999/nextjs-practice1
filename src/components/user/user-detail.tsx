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
 * UserDetail component for displaying user information with follow functionality
 * Enhanced with larger avatar display, bio section, and improved visual hierarchy
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
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center text-gray-500">User not found</div>
      </div>
    )
  }

  const followersCount = user.followers?.length || 0
  const followingCount = user.following?.length || 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header Section - Avatar and Basic Info */}
      <div className="relative p-8 pb-6">
        {/* Follow Button - Positioned absolutely in top right */}
        {showFollowButton && (
          <div className="absolute top-6 right-6">
            <FollowButton
              currentUserId={currentUserId}
              targetUserId={user.id}
              isFollowing={isFollowing}
              onToggle={onFollowToggle}
              size="default"
              variant="outline"
            />
          </div>
        )}

        {/* Main Profile Content */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          {/* Large Avatar */}
          <div className="mb-6 sm:mr-8 sm:mb-0">
            <UserAvatar
              user={user}
              size="2xl"
              className="ring-4 ring-gray-50"
            />
          </div>

          {/* User Information */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {user.name}
              </h1>
              <p className="mt-1 text-lg text-gray-600">{user.email}</p>
            </div>

            {/* Bio Section */}
            {user.bio && (
              <div className="pt-2">
                <p className="max-w-2xl leading-relaxed text-gray-700">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Member Since */}
            <div className="pt-1">
              <p className="text-sm text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t border-gray-100 px-8 py-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {bookmarkCount}
            </div>
            <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
              {bookmarkCount === 1 ? "Bookmark" : "Bookmarks"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {followersCount}
            </div>
            <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
              {followersCount === 1 ? "Follower" : "Followers"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {followingCount}
            </div>
            <div className="text-sm font-medium tracking-wide text-gray-600 uppercase">
              Following
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

UserDetail.displayName = "UserDetail"
