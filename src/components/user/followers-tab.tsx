import Link from "next/link"

import { getUsersByFollower } from "@/app/user/actions"
import { FollowersList } from "@/components/user/followers-full-list"
import { User } from "@/types/user"

interface FollowersTabProps {
  user: User
  isOwnProfile?: boolean
}

export async function FollowersTab({
  user,
  isOwnProfile = false,
}: FollowersTabProps): Promise<React.JSX.Element> {
  let followers: User[] = []

  if (user.followers && user.followers.length > 0) {
    try {
      followers = await getUsersByFollower(user.id)
    } catch (error) {
      console.error("Error fetching followers:", error)
      followers = []
    }
  }

  // Handle empty state with different messaging
  if (followers.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {isOwnProfile
              ? "No followers yet"
              : `${user.name} has no followers yet`}
          </h3>
          <p className="text-gray-600">
            {isOwnProfile
              ? "Share interesting content and engage with others to gain followers."
              : "Be the first to follow them!"}
          </p>
          {isOwnProfile && (
            <div className="mt-4">
              <Link
                href="/post/create"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Create a post
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
          {followers.length} {followers.length === 1 ? "follower" : "followers"}
        </p>
      </div>
      <FollowersList followers={followers} />
    </div>
  )
}
