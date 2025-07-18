import Link from "next/link"

import { PostCard } from "@/components/post/post-card"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface PostListProps {
  posts: Post[]
  authors?: User[]
  currentUserId?: string
}

export function PostList({
  posts,
  authors = [],
  currentUserId,
}: PostListProps): React.JSX.Element {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No posts found.</p>
      </div>
    )
  }

  // Helper function to find author by userId
  const getAuthor = (userId: string) => {
    return authors.find((author) => author.id === userId)
  }

  return (
    <div className="space-y-6" data-testid="post-list">
      {posts.map((post) => (
        <div key={post.id} data-testid={`post-${post.id}`}>
          <Link
            href={`/post/${post.id}`}
            className="block transition-opacity hover:opacity-80"
          >
            <PostCard
              post={post}
              author={getAuthor(post.userId)}
              currentUserId={currentUserId}
            />
          </Link>
        </div>
      ))}
    </div>
  )
}
