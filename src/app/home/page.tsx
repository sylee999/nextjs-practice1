import { checkAuth } from "@/app/auth/actions"
import { getPopularPosts, getPostsFromFollowedUsers } from "@/app/post/actions"
import { PostList } from "@/components/post/post-list"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // Check authentication status
  const authUser = await checkAuth()

  // Fetch appropriate content based on auth status
  const { posts, authors } = authUser
    ? await getPostsFromFollowedUsers()
    : await getPopularPosts()

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Home</h1>
        <p className="text-muted-foreground text-sm">
          {authUser
            ? posts.length > 0
              ? "See the latest posts from people you follow"
              : "Follow some users to see their posts here"
            : "Discover popular posts from our community"}
        </p>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto max-w-sm space-y-4">
            {authUser ? (
              <>
                <h3 className="text-lg font-medium">Your feed is empty</h3>
                <p className="text-muted-foreground text-sm">
                  Follow other users to see their posts in your personalized
                  feed. In the meantime, check out the popular posts below.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="text-muted-foreground text-sm">
                  Be the first to create a post and share your thoughts with the
                  community.
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <PostList
          posts={posts}
          authors={authors}
          currentUserId={authUser?.id}
        />
      )}
    </div>
  )
}
