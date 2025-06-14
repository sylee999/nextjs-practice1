"use client"

import { memo, useState, useTransition } from "react"
import { Heart } from "lucide-react"

import { followUser, unfollowUser } from "@/app/user/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  currentUserId: string | null | undefined
  targetUserId: string
  isFollowing: boolean
  onToggle?: () => void
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "outline" | "ghost"
  className?: string
}

/**
 * FollowButton component with heart icon for follow/unfollow functionality
 * Handles loading states, authentication, and provides visual feedback
 *
 * @param currentUserId - ID of the current authenticated user
 * @param targetUserId - ID of the user to follow/unfollow
 * @param isFollowing - Current follow status
 * @param onToggle - Optional callback for successful follow/unfollow operations
 * @param size - Button size variant
 * @param variant - Button style variant
 * @param className - Additional CSS classes
 */
export const FollowButton = memo(function FollowButton({
  currentUserId,
  targetUserId,
  isFollowing,
  onToggle,
  size = "default",
  variant = "outline",
  className,
}: FollowButtonProps): React.JSX.Element | null {
  const [isPending, startTransition] = useTransition()
  const [localFollowState, setLocalFollowState] = useState(isFollowing)

  // Don't render button if no current user (not authenticated)
  if (!currentUserId) {
    return null
  }

  // Don't render button if trying to follow self
  if (currentUserId === targetUserId) {
    return null
  }

  const handleToggleFollow = async () => {
    if (isPending) return

    startTransition(async () => {
      try {
        let result
        if (localFollowState) {
          result = await unfollowUser(currentUserId, targetUserId)
        } else {
          result = await followUser(currentUserId, targetUserId)
        }

        if (result.success) {
          // Optimistically update local state
          setLocalFollowState(!localFollowState)
          // Call optional callback for parent component updates
          onToggle?.()
        } else {
          // Handle error - could show toast or error message
          console.error("Follow operation failed:", result.message)
        }
      } catch (error) {
        console.error("Follow operation error:", error)
      }
    })
  }

  const heartIconClass = cn(
    "transition-colors duration-200",
    localFollowState
      ? "fill-red-500 text-red-500"
      : "text-gray-400 hover:text-red-400"
  )

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isPending}
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200",
        localFollowState && variant === "outline" && "border-red-200 bg-red-50",
        className
      )}
      aria-label={localFollowState ? "Unfollow user" : "Follow user"}
    >
      <Heart
        className={cn("size-4", heartIconClass, isPending && "animate-pulse")}
      />
      {size !== "icon" && (
        <span className="ml-1">
          {isPending
            ? localFollowState
              ? "Unfollowing..."
              : "Following..."
            : localFollowState
              ? "Following"
              : "Follow"}
        </span>
      )}
    </Button>
  )
})

FollowButton.displayName = "FollowButton"
