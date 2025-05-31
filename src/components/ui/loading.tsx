import { memo } from "react"
import { Loader2 } from "lucide-react"

import type { LoadingProps } from "@/types/components"

/**
 * Loading component for displaying loading states
 * Provides consistent loading UI across the application
 *
 * @param isLoading - Whether to show the loading state
 * @param loadingText - Custom loading text to display
 */
export const Loading = memo(function Loading({
  isLoading,
  loadingText = "Loading...",
}: LoadingProps): React.JSX.Element | null {
  if (!isLoading) return null

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-muted-foreground text-sm">{loadingText}</span>
    </div>
  )
})

Loading.displayName = "Loading"

/**
 * Skeleton loading component for list items
 * Provides skeleton loading state for better UX
 */
export const ListSkeleton = memo(function ListSkeleton({
  count = 3,
}: {
  count?: number
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3">
          <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-4 animate-pulse rounded" />
            <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  )
})

ListSkeleton.displayName = "ListSkeleton"
