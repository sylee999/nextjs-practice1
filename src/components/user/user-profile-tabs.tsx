"use client"

import { Suspense } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarksTab } from "@/components/user/bookmarks-tab"
import { FollowersTab } from "@/components/user/followers-tab"
import { FollowingTab } from "@/components/user/following-tab"
import { PostsTab } from "@/components/user/posts-tab"
import { User } from "@/types/user"

interface UserProfileTabsProps {
  user: User
  currentUserId?: string
  isOwnProfile?: boolean
}

// Loading component for tab content
function TabLoading() {
  return (
    <div className="py-8 text-center">
      <div className="animate-pulse">
        <div className="space-y-4">
          <div className="mx-auto h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-20 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function UserProfileTabs({
  user,
  currentUserId,
  isOwnProfile = false,
}: UserProfileTabsProps): React.JSX.Element {
  return (
    <div className="mt-8">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <Suspense fallback={<TabLoading />}>
            <PostsTab
              user={user}
              currentUserId={currentUserId}
              isOwnProfile={isOwnProfile}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          <Suspense fallback={<TabLoading />}>
            <BookmarksTab
              user={user}
              currentUserId={currentUserId}
              isOwnProfile={isOwnProfile}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <Suspense fallback={<TabLoading />}>
            <FollowersTab user={user} isOwnProfile={isOwnProfile} />
          </Suspense>
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <Suspense fallback={<TabLoading />}>
            <FollowingTab user={user} isOwnProfile={isOwnProfile} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
