import { Bookmark } from "lucide-react"

import { PostList } from "@/components/post/post-list"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface BookmarkedPostsProps {
  posts: Post[]
  authors?: User[]
  currentUserId?: string
  isOwnProfile?: boolean
}

export function BookmarkedPosts({
  posts,
  authors = [],
  currentUserId,
  isOwnProfile = false,
}: BookmarkedPostsProps): React.JSX.Element {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Bookmark className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No bookmarked posts
        </h3>
        <p className="text-gray-500">
          {isOwnProfile
            ? "You haven't bookmarked any posts yet. Start exploring and bookmark posts you find interesting!"
            : "This user hasn't bookmarked any posts yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Bookmark className="h-4 w-4" />
        <span>
          {posts.length}{" "}
          {posts.length === 1 ? "bookmarked post" : "bookmarked posts"}
        </span>
      </div>
      <PostList posts={posts} authors={authors} currentUserId={currentUserId} />
    </div>
  )
}
