import Link from "next/link"

import { getUsersByIds } from "@/app/user/actions"
import { FollowingList } from "@/components/user/following-list"
import { User } from "@/types/user"

interface FollowingTabProps {
  user: User
  isOwnProfile?: boolean
}

export async function FollowingTab({
  user,
  isOwnProfile = false,
}: FollowingTabProps): Promise<React.JSX.Element> {
  let followingUsers: User[] = []

  if (user.following && user.following.length > 0) {
    try {
      followingUsers = await getUsersByIds(user.following)
    } catch (error) {
      console.error("Error fetching following users:", error)
      followingUsers = []
    }
  }

  // Handle empty state with different messaging
  if (followingUsers.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {isOwnProfile
              ? "You're not following anyone yet"
              : `${user.name} isn't following anyone yet`}
          </h3>
          <p className="text-gray-600">
            {isOwnProfile
              ? "Discover and follow other users to see their activity and build connections."
              : "Check back later to see who they're following."}
          </p>
          {isOwnProfile && (
            <div className="mt-4">
              <Link
                href="/user"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Browse Users
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {isOwnProfile ? "You're following" : `${user.name} is following`}{" "}
          {followingUsers.length}{" "}
          {followingUsers.length === 1 ? "user" : "users"}
        </p>
      </div>
      <FollowingList followingUsers={followingUsers} />
    </div>
  )
}
