import { memo } from "react"
import Link from "next/link"

import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ListSkeleton } from "@/components/ui/loading"
import { UserDetail } from "@/components/user/user-detail"
import type { UserListProps } from "@/types/components"

/**
 * UserList component for displaying a list of users
 * Renders user details with navigation links to individual user pages
 * Optimized with React.memo for performance
 *
 * @param users - Array of user objects to display
 */
export const UserList = memo(function UserList({
  users,
}: UserListProps): React.JSX.Element {
  if (!users || users.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={<ListSkeleton count={3} />}>
      <ul className="space-y-2" data-testid="user-list">
        {users.map((user) => (
          <li key={user.id} data-testid={`user-${user.id}`}>
            <Link
              href={`/user/${user.id}`}
              className="block transition-transform hover:scale-[1.02]"
            >
              <UserDetail user={user} />
            </Link>
          </li>
        ))}
      </ul>
    </ErrorBoundary>
  )
})

UserList.displayName = "UserList"
