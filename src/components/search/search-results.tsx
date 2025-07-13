import { PostCard } from "@/components/post/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Post } from "@/types/post"
import { SearchType } from "@/types/search"
import { User } from "@/types/user"

import { EmptySearchState } from "./empty-search-state"
import { UserListItem } from "./user-list-item"

interface SearchResultsProps {
  posts: Post[]
  users: User[]
  query: string
  type: SearchType
  isLoading?: boolean
}

export function SearchResults({
  posts,
  users,
  query,
  type = "all",
  isLoading = false,
}: SearchResultsProps) {
  const totalResults = posts.length + users.length
  const hasResults = totalResults > 0

  if (!isLoading && !hasResults) {
    return <EmptySearchState query={query} />
  }

  const defaultTab =
    type === "users"
      ? "users"
      : type === "posts"
        ? "posts"
        : posts.length > 0
          ? "posts"
          : "users"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Search Results
          {query && (
            <span className="text-muted-foreground ml-2">
              for &ldquo;{query}&rdquo;
            </span>
          )}
        </h2>
        {hasResults && (
          <p className="text-muted-foreground text-sm">
            {totalResults} {totalResults === 1 ? "result" : "results"} found
          </p>
        )}
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {posts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Posts</h3>
              <div className="grid gap-4">
                {posts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              {posts.length > 3 && (
                <p className="text-muted-foreground text-sm">
                  And {posts.length - 3} more posts...
                </p>
              )}
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Users</h3>
              <div className="grid gap-2">
                {users.slice(0, 3).map((user) => (
                  <UserListItem key={user.id} user={user} />
                ))}
              </div>
              {users.length > 3 && (
                <p className="text-muted-foreground text-sm">
                  And {users.length - 3} more users...
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              No posts found
            </p>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {users.length > 0 ? (
            <div className="grid gap-2">
              {users.map((user) => (
                <UserListItem key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              No users found
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
