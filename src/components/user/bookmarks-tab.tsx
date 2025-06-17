import { getUserBookmarks } from "@/app/post/bookmark-actions"
import { getUsersByIds } from "@/app/user/actions"
import { BookmarkedPosts } from "@/components/user/bookmarked-posts"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface BookmarksTabProps {
  user: User
  currentUserId?: string
  isOwnProfile?: boolean
}

export async function BookmarksTab({
  user,
  currentUserId,
  isOwnProfile = false,
}: BookmarksTabProps): Promise<React.JSX.Element> {
  // Fetch user's bookmarked posts and all users for author information
  let bookmarkedPosts: Post[]
  let authors: User[]
  try {
    bookmarkedPosts = await getUserBookmarks(user.id)
    authors = await getUsersByIds(bookmarkedPosts.map((post) => post.userId))
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error)
    bookmarkedPosts = []
    authors = []
  }

  return (
    <div className="pt-4">
      <BookmarkedPosts
        posts={bookmarkedPosts}
        authors={authors}
        currentUserId={currentUserId}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}
