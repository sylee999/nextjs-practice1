import { checkAuth } from "@/app/auth/actions"
import { UserList } from "@/components/user/user-list"

import { getUsers } from "./actions"

export const dynamic = "force-dynamic"

export default async function UserPage() {
  // Get both users and current authentication context
  const [users, currentUser] = await Promise.all([getUsers(), checkAuth()])

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        {currentUser && (
          <div className="text-muted-foreground text-sm">
            Welcome, {currentUser.name}
          </div>
        )}
      </div>

      {/* Enhanced UserList with authentication context */}
      <UserList users={users} currentUserId={currentUser?.id || null} />

      {!currentUser && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Join the Community
          </h3>
          <p className="mb-4 text-gray-600">
            Sign up or log in to follow other users and see who follows you.
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="/login"
              className="bg-primary hover:bg-primary/90 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
