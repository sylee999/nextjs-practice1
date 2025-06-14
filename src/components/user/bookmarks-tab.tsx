import { BookmarkedPosts } from "@/components/user/bookmarked-posts"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface BookmarksTabProps {
  currentUserId?: string
  isOwnProfile?: boolean
  bookmarkedPosts: Post[]
  bookmarkAuthors: User[]
}

export function BookmarksTab({
  currentUserId,
  isOwnProfile = false,
  bookmarkedPosts,
  bookmarkAuthors,
}: BookmarksTabProps): React.JSX.Element {
  return (
    <div className="pt-4">
      <BookmarkedPosts
        posts={bookmarkedPosts}
        authors={bookmarkAuthors}
        currentUserId={currentUserId}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}
