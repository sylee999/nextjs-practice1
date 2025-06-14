"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarksTab } from "@/components/user/bookmarks-tab"
import { FollowersTab } from "@/components/user/followers-tab"
import { FollowingTab } from "@/components/user/following-tab"
import { PostsTab } from "@/components/user/posts-tab"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface UserProfileTabsProps {
  user: User
  currentUserId?: string
  isOwnProfile?: boolean
  userPosts: Post[]
  bookmarkedPosts: Post[]
  bookmarkAuthors: User[]
  followers: User[]
  followingUsers: User[]
}

export function UserProfileTabs({
  user,
  currentUserId,
  isOwnProfile = false,
  userPosts,
  bookmarkedPosts,
  bookmarkAuthors,
  followers,
  followingUsers,
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
          <PostsTab
            user={user}
            currentUserId={currentUserId}
            isOwnProfile={isOwnProfile}
            userPosts={userPosts}
          />
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-6">
          <BookmarksTab
            currentUserId={currentUserId}
            isOwnProfile={isOwnProfile}
            bookmarkedPosts={bookmarkedPosts}
            bookmarkAuthors={bookmarkAuthors}
          />
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <FollowersTab
            user={user}
            isOwnProfile={isOwnProfile}
            followers={followers}
          />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <FollowingTab
            user={user}
            isOwnProfile={isOwnProfile}
            followingUsers={followingUsers}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
