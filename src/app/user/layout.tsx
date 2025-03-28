import React, { Suspense } from "react"

import { UserListSkeleton } from "@/components/user/user-list-skeleton"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>
      <Suspense fallback={<UserListSkeleton />}>{children}</Suspense>
    </div>
  )
}
