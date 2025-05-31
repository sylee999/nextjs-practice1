import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface PostDetailProps {
  post: Post
  author?: User
}

export function PostDetail({
  post,
  author,
}: PostDetailProps): React.JSX.Element {
  if (!post) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Post not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="size-10">
            <AvatarImage
              src={author?.avatar || "/default-avatar.png"}
              alt={author?.name || "Unknown"}
            />
            <AvatarFallback>{author?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {author?.name || "Unknown Author"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()} at{" "}
              {new Date(post.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h2 className="mb-3 text-xl font-bold">{post.title}</h2>
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-gray-700">{post.content}</p>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{(post.likeUsers || []).length} likes</span>
          {post.updatedAt !== post.createdAt && (
            <span>
              Updated: {new Date(post.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
