import Link from "next/link"

import { checkAuth } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function LandingPage() {
  const authUser = await checkAuth()

  return (
    <div className="mx-auto max-w-6xl space-y-16 p-4 py-12">
      {/* Hero Section */}
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to Our Community
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Connect with like-minded people, share your thoughts, and discover
          amazing content from our vibrant community.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/home">
            <Button size="lg" className="min-w-[200px]">
              {authUser ? "Go to Home Feed" : "Explore Popular Posts"}
            </Button>
          </Link>
          {!authUser && (
            <Link href="/signup">
              <Button size="lg" variant="outline" className="min-w-[200px]">
                Join the Community
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">Why Join Our Platform?</h2>
          <p className="text-muted-foreground">
            Everything you need to connect and share with your community
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="bg-primary/10 mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <CardTitle>Connect with People</CardTitle>
              <CardDescription>
                Follow interesting people and build your network. See their
                latest posts in your personalized home feed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary/10 mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                  />
                </svg>
              </div>
              <CardTitle>Share Your Voice</CardTitle>
              <CardDescription>
                Create posts to share your thoughts, ideas, and experiences with
                the community. Your voice matters.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary/10 mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <CardTitle>Bookmark Favorites</CardTitle>
              <CardDescription>
                Save posts you love to revisit them later. Build your personal
                collection of inspiring content.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 space-y-6 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold">
          {authUser ? "Continue Exploring" : "Ready to Get Started?"}
        </h2>
        <p className="text-muted-foreground mx-auto max-w-xl">
          {authUser
            ? "Visit your home feed to see posts from people you follow, or explore popular posts from the community."
            : "Join thousands of users who are already sharing and connecting on our platform."}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {authUser ? (
            <>
              <Link href="/home">
                <Button size="lg">Go to Home Feed</Button>
              </Link>
              <Link href="/post/create">
                <Button size="lg" variant="outline">
                  Create a Post
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg">Sign Up Free</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-t pt-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground text-sm">Explore more</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/home" className="text-sm hover:underline">
              Home Feed
            </Link>
            <Link href="/post" className="text-sm hover:underline">
              All Posts
            </Link>
            <Link href="/user" className="text-sm hover:underline">
              Discover People
            </Link>
            {authUser && (
              <Link href="/post/create" className="text-sm hover:underline">
                Create Post
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
