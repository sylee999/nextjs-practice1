"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Home page error:", error)
  }, [error])

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Card className="border-destructive">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Something went wrong!</CardTitle>
          <CardDescription className="text-base">
            We encountered an error while loading your home feed. This might be
            a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-md p-4">
            <p className="text-muted-foreground text-sm">
              Error details: {error.message || "An unexpected error occurred"}
            </p>
            {error.digest && (
              <p className="text-muted-foreground mt-1 text-xs">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="text-muted-foreground space-y-2 text-sm">
            <p>Here are some things you can try:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Refresh the page to try loading your feed again</li>
              <li>Check your internet connection</li>
              <li>Browse all posts instead of your personalized feed</li>
              <li>Try again in a few moments</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/post" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Browse All Posts
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full">
              Go to Landing Page
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
