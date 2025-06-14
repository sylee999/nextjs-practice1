import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"

import { checkAuth } from "@/app/auth/actions"
import { getUserBookmarks } from "@/app/post/bookmark-actions"
import { getUsers, isFollowing } from "@/app/user/actions"
import { Button } from "@/components/ui/button"
import { BookmarkedPosts } from "@/components/user/bookmarked-posts"
import { FollowingList } from "@/components/user/following-list"
import UserDeleteDialog from "@/components/user/user-delete-dialog"
import { UserProfileWithFollow } from "@/components/user/user-profile-with-follow"

import { getUser } from "../actions"

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, authUser, users] = await Promise.all([
    getUser(id),
    checkAuth(),
    getUsers(),
  ])

  // Get user's bookmarked posts if user exists
  const bookmarkedPosts = user ? await getUserBookmarks(user.id) : []
  const isOwnProfile = authUser?.id === user?.id

  // Get follow status and following users data
  let userIsFollowing = false
  let followingUsers: typeof users = []

  if (user && authUser && !isOwnProfile) {
    userIsFollowing = await isFollowing(authUser.id, user.id)
  }

  if (user && user.following && user.following.length > 0) {
    followingUsers = users.filter((u) => user.following!.includes(u.id))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* User Profile with Follow Functionality */}
      <UserProfileWithFollow
        user={user}
        bookmarkCount={bookmarkedPosts.length}
        currentUserId={authUser?.id}
        initialIsFollowing={userIsFollowing}
        showFollowButton={!!authUser && !isOwnProfile}
      />

      {user ? (
        <>
          {/* Profile Actions */}
          {authUser?.id === user.id && (
            <div className="mt-6 flex space-x-2">
              <Button variant="outline" className="flex items-center" asChild>
                <Link href={`/user/${user.id}/edit`}>
                  <Pencil className="mr-2 size-4" />
                  Update
                </Link>
              </Button>
              <UserDeleteDialog user={user} />
            </div>
          )}

          {/* Following Section */}
          {followingUsers.length > 0 && (
            <div className="mt-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isOwnProfile
                    ? "You're Following"
                    : `${user.name} is Following`}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {followingUsers.length} user
                  {followingUsers.length !== 1 ? "s" : ""}
                </p>
              </div>
              <FollowingList followingUsers={followingUsers} />
            </div>
          )}

          {/* Bookmarked Posts Section */}
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isOwnProfile ? "Your Bookmarks" : `${user.name}'s Bookmarks`}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isOwnProfile
                  ? "Posts you've saved for later reading"
                  : `Posts bookmarked by ${user.name}`}
              </p>
            </div>
            <BookmarkedPosts
              posts={bookmarkedPosts}
              authors={users}
              currentUserId={authUser?.id}
              isOwnProfile={isOwnProfile}
            />
          </div>

          {/* Empty State for No Following */}
          {followingUsers.length === 0 && isOwnProfile && (
            <div className="mt-8">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Start Following Users
                </h3>
                <p className="mb-4 text-gray-600">
                  Discover and follow other users to see their activity and
                  build connections.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/user">Browse Users</Link>
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 flex space-x-2">
          <Button variant="outline" className="flex items-center" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          {!authUser && (
            <>
              <Button variant="outline" className="flex items-center" asChild>
                <Link href={`/login`}>Login</Link>
              </Button>
              <Button variant="outline" className="flex items-center" asChild>
                <Link href={`/signup`}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
