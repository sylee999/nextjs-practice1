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
    // Optimistically update follow state
    setFollowStates((prev) => ({
      ...prev,
      [targetUserId]: !prev[targetUserId],
    }))

    // Reload followers data to reflect changes after a short delay
    setTimeout(() => {
      const loadUpdatedData = async () => {
        try {
          const allUsers = await getUsers()
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
          setFollowersData(followersMap)
        } catch (error) {
          console.error("Error updating followers data:", error)
        }
      }
      loadUpdatedData()
    }, 100)
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
          <li
            key={user.id}
            data-testid={`user-${user.id}`}
            className="rounded-lg border border-gray-200 bg-white"
          >
            {/* User Info Section */}
            <Link
              href={`/user/${user.id}`}
              className="block p-6 transition-transform hover:scale-[1.01]"
            >
              <UserDetail user={user} />
            </Link>

            {/* Follow Section */}
            <div className="flex items-center justify-between border-t border-gray-100 p-4 pt-0">
              {/* Followers List */}
              <FollowersAvatarList
                followers={followersData[user.id] || []}
                maxDisplay={3}
                size="sm"
              />

              {/* Follow Button */}
              <FollowButton
                currentUserId={currentUserId}
                targetUserId={user.id}
                isFollowing={followStates[user.id] || false}
                onToggle={() => handleFollowToggle(user.id)}
                size="sm"
                variant="outline"
              />
            </div>
          </li>
        ))}
      </ul>
    </ErrorBoundary>
  )
})

UserList.displayName = "UserList"
