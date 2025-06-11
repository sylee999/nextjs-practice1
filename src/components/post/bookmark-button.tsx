"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"

import { toggleBookmarkAction } from "@/app/post/bookmark-actions"
import { Button } from "@/components/ui/button"

interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
  userId?: string
  className?: string
}

export function BookmarkButton({
  postId,
  initialBookmarked,
  userId,
  className = "",
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const handleToggle = () => {
    if (!userId) return // Not authenticated

    // Optimistic update
    const previousState = isBookmarked
    setIsBookmarked(!isBookmarked)

    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(postId)
        if (!result.success) {
          // Revert optimistic update on failure
          setIsBookmarked(previousState)
          console.error("Bookmark action failed:", result.message)
        } else {
          // Ensure state matches server response
          setIsBookmarked(result.isBookmarked ?? !previousState)
        }
      } catch (error) {
        // Revert optimistic update on error
        setIsBookmarked(previousState)
        console.error("Bookmark action error:", error)
      }
    })
  }

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    handleToggle()
  }

  const handleUnauthenticatedClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const loginUrl = `/login?from=${encodeURIComponent(pathname)}`
    router.push(loginUrl)
  }

  if (!userId) {
    // Show button that redirects to login for unauthenticated users
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUnauthenticatedClick}
        className={`flex items-center gap-1 ${className}`}
        title="Login to bookmark posts"
      >
        <Bookmark className="h-4 w-4" />
        <span className="hidden sm:inline">Bookmark</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1 transition-colors ${
        isBookmarked
          ? "text-blue-600 hover:text-blue-700"
          : "text-gray-500 hover:text-gray-700"
      } ${className}`}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
    >
      <Bookmark
        className={`h-4 w-4 transition-all ${
          isBookmarked ? "fill-current" : ""
        } ${isPending ? "animate-pulse" : ""}`}
      />
      <span className="hidden sm:inline">
        {isPending ? "..." : isBookmarked ? "Bookmarked" : "Bookmark"}
      </span>
    </Button>
  )
}
