import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"

import { checkAuth } from "@/app/auth/actions"
import { isFollowing } from "@/app/user/actions"
import { Button } from "@/components/ui/button"
import UserDeleteDialog from "@/components/user/user-delete-dialog"
import { UserProfileTabs } from "@/components/user/user-profile-tabs"
import { UserProfileWithFollow } from "@/components/user/user-profile-with-follow"

import { getUser } from "../actions"

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [user, authUser] = await Promise.all([getUser(id), checkAuth()])

  const isOwnProfile = authUser?.id === user?.id

  // Get follow status only if not own profile
  let userIsFollowing = false
  if (user && authUser && !isOwnProfile) {
    userIsFollowing = await isFollowing(authUser.id, user.id)
  }

  // Get bookmarked posts count for user profile display
  let bookmarkCount = 0
  if (user && authUser) {
    bookmarkCount = user.bookmarkedPosts?.length || 0
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      {/* User Profile with Follow Functionality */}
      <UserProfileWithFollow
        user={user}
        bookmarkCount={bookmarkCount}
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

          {/* User Profile Tabs */}
          <UserProfileTabs
            user={user}
            currentUserId={authUser?.id}
            isOwnProfile={isOwnProfile}
          />
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
