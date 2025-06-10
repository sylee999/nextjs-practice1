import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"

import { checkAuth } from "@/app/auth/actions"
import { getUserBookmarks } from "@/app/post/bookmark-actions"
import { getUsers } from "@/app/user/actions"
import { Button } from "@/components/ui/button"
import { BookmarkedPosts } from "@/components/user/bookmarked-posts"
import UserDeleteDialog from "@/components/user/user-delete-dialog"
import { UserDetail } from "@/components/user/user-detail"

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <UserDetail user={user} bookmarkCount={bookmarkedPosts.length} />

      {user ? (
        <>
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
