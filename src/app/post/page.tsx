import Link from "next/link"
import { Plus } from "lucide-react"

import { getUsers } from "@/app/user/actions"
import { PostList } from "@/components/post/post-list"
import { Button } from "@/components/ui/button"

import { getPosts } from "./actions"

export default async function PostPage() {
  const [posts, users] = await Promise.all([getPosts(), getUsers()])

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/post/create">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Create Post
          </Button>
        </Link>
      </div>
      <PostList posts={posts} authors={users} />
    </div>
  )
}
