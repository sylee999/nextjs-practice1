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
  variant?: "default" | "compact"
}

/**
 * UserDetail component for displaying user information with follow functionality
 * Enhanced with larger avatar display, bio section, and modern visual design
 * Features sophisticated shadows, typography hierarchy, and responsive design
 * Optimized with React.memo for performance
 *
 * @param user - User object to display
 * @param bookmarkCount - Number of bookmarked posts
 * @param currentUserId - ID of current authenticated user
 * @param isFollowing - Whether current user is following this user
 * @param onFollowToggle - Callback for follow toggle
 * @param showFollowButton - Whether to show the follow button
 * @param variant - Display variant: "default" for full profile, "compact" for list view
 */
export const UserDetail = memo(function UserDetail({
  user,
  bookmarkCount = 0,
  currentUserId,
  isFollowing = false,
  onFollowToggle,
  showFollowButton = false,
  variant = "default",
}: UserDetailProps): React.JSX.Element {
  if (!user) {
    return (
      <div
        className={`rounded-2xl border border-gray-200/80 bg-white/95 shadow-lg backdrop-blur-sm ${variant === "compact" ? "p-4" : "p-8"}`}
      >
        <div className="text-center text-gray-500">User not found</div>
      </div>
    )
  }

  const followersCount = user.followers?.length || 0
  const followingCount = user.following?.length || 0

  // Compact variant for user list
  if (variant === "compact") {
    return (
      <div className="group rounded-lg border border-gray-200/80 bg-white/95 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            {/* Compact Avatar */}
            <div className="flex-shrink-0">
              <UserAvatar
                user={user}
                size="lg"
                className="shadow-md ring-2 ring-white/70 transition-all duration-300 group-hover:shadow-lg"
              />
            </div>

            {/* User Information */}
            <div className="min-w-0 flex-1">
              <div className="space-y-1">
                <h3 className="truncate text-lg font-bold tracking-tight text-gray-900">
                  {user.name}
                </h3>
                <p className="truncate text-sm font-medium text-gray-600">
                  {user.email}
                </p>
              </div>

              {/* Compact Stats */}
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                <span className="font-medium">
                  {followersCount}{" "}
                  {followersCount === 1 ? "follower" : "followers"}
                </span>
                <span className="font-medium">{followingCount} following</span>
                <span className="font-medium">
                  {bookmarkCount}{" "}
                  {bookmarkCount === 1 ? "bookmark" : "bookmarks"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant for full profile display
  return (
    <div className="group rounded-2xl border border-gray-200/80 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50">
      {/* Header Section - Avatar and Basic Info */}
      <div className="relative rounded-t-2xl bg-gradient-to-br from-gray-50/80 to-white/95 p-8 pb-6">
        {/* Follow Button - Positioned absolutely in top right */}
        {showFollowButton && (
          <div className="absolute top-6 right-6 z-10">
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
          <div className="mb-8 sm:mr-10 sm:mb-0">
            <UserAvatar
              user={user}
              size="2xl"
              className="shadow-xl ring-4 ring-white/70 transition-all duration-300 group-hover:shadow-2xl group-hover:ring-gray-100/80"
            />
          </div>

          {/* User Information */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                {user.name}
              </h1>
              <p className="text-lg font-medium text-gray-600 sm:text-xl">
                {user.email}
              </p>
            </div>

            {/* Bio Section */}
            {user.bio && (
              <div className="pt-2">
                <div className="rounded-lg border border-gray-100/80 bg-white/60 p-4">
                  <p className="max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
                    {user.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="pt-2">
              <div className="inline-flex items-center rounded-full bg-gray-100/80 px-3 py-1.5">
                <svg
                  className="mr-2 h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative rounded-b-2xl bg-gradient-to-br from-white/95 to-gray-50/80 px-8 py-8">
        {/* Subtle divider */}
        <div className="absolute top-0 right-8 left-8 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent"></div>

        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="group/stat space-y-2 rounded-xl p-4 transition-all duration-300 hover:bg-white/80 hover:shadow-md">
            <div className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover/stat:text-blue-600">
              {bookmarkCount}
            </div>
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase transition-colors duration-300 group-hover/stat:text-gray-700">
              {bookmarkCount === 1 ? "Bookmark" : "Bookmarks"}
            </div>
          </div>

          <div className="group/stat space-y-2 rounded-xl p-4 transition-all duration-300 hover:bg-white/80 hover:shadow-md">
            <div className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover/stat:text-green-600">
              {followersCount}
            </div>
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase transition-colors duration-300 group-hover/stat:text-gray-700">
              {followersCount === 1 ? "Follower" : "Followers"}
            </div>
          </div>

          <div className="group/stat space-y-2 rounded-xl p-4 transition-all duration-300 hover:bg-white/80 hover:shadow-md">
            <div className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover/stat:text-purple-600">
              {followingCount}
            </div>
            <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase transition-colors duration-300 group-hover/stat:text-gray-700">
              Following
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

UserDetail.displayName = "UserDetail"
