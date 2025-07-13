"use client"

import { memo, useEffect, useState } from "react"
import Link from "next/link"

import { getUser, getUsers } from "@/app/user/actions"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ListSkeleton } from "@/components/ui/loading"
import { FollowButton } from "@/components/user/follow-button"
import { FollowersAvatarList } from "@/components/user/followers-list"
import { UserDetail } from "@/components/user/user-detail"
import type { UserListProps } from "@/types/components"
import type { User } from "@/types/user"

/**
 * UserList component for displaying a list of users with follow functionality
 * Renders user details with navigation links, follow buttons, and followers avatars
 * Optimized with React.memo for performance and efficient API calls
 *
 * @param users - Array of user objects to display
 * @param currentUserId - ID of current authenticated user
 */
export const UserList = memo(function UserList({
  users,
  currentUserId,
}: UserListProps): React.JSX.Element {
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})
  const [followersData, setFollowersData] = useState<Record<string, User[]>>({})
  const [loading, setLoading] = useState(true)

  // Load follow states and followers data on mount with optimized API calls
  useEffect(() => {
    const loadFollowData = async () => {
      if (!currentUserId || !users.length) {
        setLoading(false)
        return
      }

      try {
        // Get all users data and current user data in parallel
        const [allUsers, currentUser] = await Promise.all([
          getUsers(),
          getUser(currentUserId),
        ])

        if (!currentUser) {
          setLoading(false)
          return
        }

        // Compute follow states from current user's following list (no additional API calls)
        const followStatesMap = users.reduce(
          (acc, user) => {
            if (user.id === currentUserId) {
              acc[user.id] = false // Can't follow yourself
            } else {
              acc[user.id] = currentUser.following?.includes(user.id) ?? false
            }
            return acc
          },
          {} as Record<string, boolean>
        )

        // Create followers data map from all users data
        const followersMap = users.reduce(
          (acc, user) => {
            if (user.followers && user.followers.length > 0) {
              const userFollowers = allUsers.filter((u) =>
                user.followers!.includes(u.id)
              )
              acc[user.id] = userFollowers
            } else {
              acc[user.id] = []
            }
            return acc
          },
          {} as Record<string, User[]>
        )

        setFollowStates(followStatesMap)
        setFollowersData(followersMap)
      } catch (error) {
        console.error("Error loading follow data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFollowData()
  }, [users, currentUserId])

  const handleFollowToggle = (targetUserId: string) => {
    if (!currentUserId) return

    const isCurrentlyFollowing = followStates[targetUserId] || false

    // Optimistically update follow state
    setFollowStates((prev) => ({
      ...prev,
      [targetUserId]: !prev[targetUserId],
    }))

    // Optimistically update followers data
    setFollowersData((prev) => {
      const updatedData = { ...prev }

      // Update the target user's followers list
      if (updatedData[targetUserId]) {
        if (isCurrentlyFollowing) {
          // Remove current user from target user's followers
          updatedData[targetUserId] = updatedData[targetUserId].filter(
            (user) => user.id !== currentUserId
          )
        } else {
          // Add current user to target user's followers
          // Find current user data from the users prop
          const currentUser = users.find((u) => u.id === currentUserId)
          if (
            currentUser &&
            !updatedData[targetUserId].some((u) => u.id === currentUserId)
          ) {
            updatedData[targetUserId] = [
              ...updatedData[targetUserId],
              currentUser,
            ]
          }
        }
      } else if (!isCurrentlyFollowing) {
        // If no followers data exists, create it with current user
        const currentUser = users.find((u) => u.id === currentUserId)
        if (currentUser) {
          updatedData[targetUserId] = [currentUser]
        }
      }

      return updatedData
    })

    // No need to reload data - the server actions handle data persistence
    // and we're handling UI updates optimistically above
  }

  if (!users || users.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    )
  }

  if (loading) {
    return <ListSkeleton count={users.length} />
  }

  return (
    <ErrorBoundary fallback={<ListSkeleton count={3} />}>
      <ul className="space-y-4" data-testid="user-list">
        {users.map((user) => (
          <li key={user.id} data-testid={`user-${user.id}`}>
            {/* User Info Section */}
            <Link
              href={`/user/${user.id}`}
              className="block transition-transform hover:scale-[1.01]"
            >
              <UserDetail user={user} variant="compact" />
            </Link>

            {/* Follow Section */}
            <div className="relative rounded-b-lg border border-t-0 border-gray-200/80 bg-gray-50/50 p-6">
              {/* Left side content */}
              <div className="flex items-center">
                {followersData[user.id] && followersData[user.id].length > 0 ? (
                  <FollowersAvatarList
                    followers={followersData[user.id]}
                    maxDisplay={3}
                    size="sm"
                  />
                ) : (
                  <div className="text-xs font-medium text-gray-500">
                    No followers yet
                  </div>
                )}
              </div>

              {/* Follow Button - Always positioned bottom right */}
              <div className="absolute right-4 bottom-4">
                <FollowButton
                  currentUserId={currentUserId}
                  targetUserId={user.id}
                  isFollowing={followStates[user.id] || false}
                  onToggle={() => handleFollowToggle(user.id)}
                  size="sm"
                  variant="outline"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ErrorBoundary>
  )
})

UserList.displayName = "UserList"
