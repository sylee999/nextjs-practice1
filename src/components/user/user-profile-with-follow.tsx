"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { UserDetail } from "@/components/user/user-detail"
import type { User } from "@/types/user"

interface UserProfileWithFollowProps {
  user: User | null
  bookmarkCount: number
  currentUserId?: string
  initialIsFollowing: boolean
  showFollowButton: boolean
}

/**
 * Client-side wrapper for UserDetail that handles follow state updates
 * and triggers revalidation when follow status changes
 */
export function UserProfileWithFollow({
  user,
  bookmarkCount,
  currentUserId,
  initialIsFollowing,
  showFollowButton,
}: UserProfileWithFollowProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleFollowToggle = () => {
    // Optimistically update the follow state
    setIsFollowing(!isFollowing)

    // Refresh the page data after a short delay to reflect server changes
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <UserDetail
      user={user}
      bookmarkCount={bookmarkCount}
      currentUserId={currentUserId}
      isFollowing={isFollowing}
      onFollowToggle={handleFollowToggle}
      showFollowButton={showFollowButton}
    />
  )
}
