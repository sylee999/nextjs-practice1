import Link from "next/link"

import { checkAuth } from "@/app/auth/actions"
import { getPostsFromFollowedUsers } from "@/app/post/actions"
import { PostList } from "@/components/post/post-list"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function Home() {
  // Check authentication
  const authUser = await checkAuth()

  if (!authUser) {
    // Show welcome page for unauthenticated users
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome to Our Community
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Connect with people, share your thoughts, and discover amazing
                content from the community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Join our community to see posts from people you follow, share
                your own posts, and engage with others.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Link href="/signup" className="w-full">
                <Button className="w-full" size="lg">
                  Get Started
                </Button>
              </Link>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>Already have an account?</span>
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Fetch posts from followed users for authenticated user
  const { posts, authors } = await getPostsFromFollowedUsers()

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-muted-foreground text-sm">
          See the latest posts from people you follow
        </p>
      </div>

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your feed is empty</h2>
              <p className="text-muted-foreground">
                {authUser.following?.length === 0 || !authUser.following
                  ? "Start following people to see their posts here."
                  : "The people you follow haven't posted anything yet."}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
              <Link href="/user">
                <Button variant="default">Discover People</Button>
              </Link>
              <Link href="/post">
                <Button variant="outline">Browse All Posts</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PostList posts={posts} authors={authors} currentUserId={authUser.id} />
      )}
    </div>
  )
}
