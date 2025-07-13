import { Bookmark, ChevronRight } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDate, generatePostSummary } from "@/lib/utils"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface PostCardProps {
  post: Post
  author?: User
  currentUserId?: string
}

export function PostCard({
  post,
  author,
  currentUserId,
}: PostCardProps): React.JSX.Element {
  if (!post) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-gray-500">Post not found</p>
        </CardContent>
      </Card>
    )
  }

  const bookmarkCount = (post.bookmarkedBy || []).length
  const isBookmarked = currentUserId
    ? (post.bookmarkedBy || []).includes(currentUserId)
    : false

  const summary = generatePostSummary(post.content)

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Author info */}
          <div className="flex items-center space-x-3">
            <Avatar className="size-8 sm:size-10">
              <AvatarImage
                src={author?.avatar || "/default-avatar.png"}
                alt={author?.name || "Unknown"}
              />
              <AvatarFallback className="text-xs sm:text-sm">
                {author?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {author?.name || "Unknown Author"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Read more indicator for mobile */}
          <ChevronRight className="size-5 flex-shrink-0 text-gray-400 sm:hidden" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 sm:text-xl">
          {post.title}
        </h3>

        {/* Post Summary */}
        <p className="mb-4 line-clamp-3 text-sm text-gray-600 sm:text-base">
          {summary}
        </p>

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {/* Bookmark count */}
            <span className="flex items-center gap-1">
              <Bookmark
                data-testid="bookmark-icon"
                className={`size-4 ${isBookmarked ? "fill-current text-blue-600" : ""}`}
              />
              <span>{bookmarkCount}</span>
            </span>

            {/* Updated indicator */}
            {post.updatedAt !== post.createdAt && (
              <span className="text-xs">Edited</span>
            )}
          </div>

          {/* Read more indicator for desktop */}
          <span className="hidden items-center gap-1 font-medium text-blue-600 sm:flex">
            Read more
            <ChevronRight className="size-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
