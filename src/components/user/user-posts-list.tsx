import Link from "next/link"

import { PostCard } from "@/components/post/post-card"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface UserPostsListProps {
  posts: Post[]
  author: User
  currentUserId?: string
  isOwnProfile?: boolean
}

export function UserPostsList({
  posts,
  author,
  currentUserId,
  isOwnProfile = false,
}: UserPostsListProps): React.JSX.Element {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {isOwnProfile ? "No posts yet" : `${author.name} hasn't posted yet`}
          </h3>
          <p className="text-gray-600">
            {isOwnProfile
              ? "Share your thoughts by creating your first post!"
              : "Check back later for new posts."}
          </p>
          {isOwnProfile && (
            <div className="mt-4">
              <Link
                href="/post/create"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Create your first post
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="user-posts-list">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>
      {posts.map((post) => (
        <div key={post.id} data-testid={`user-post-${post.id}`}>
          <Link
            href={`/post/${post.id}`}
            className="block transition-opacity hover:opacity-80"
          >
            <PostCard
              post={post}
              author={author}
              currentUserId={currentUserId}
            />
          </Link>
        </div>
      ))}
    </div>
  )
}
