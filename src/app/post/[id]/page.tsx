import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"

import { checkAuth } from "@/app/auth/actions"
import { getUser } from "@/app/user/actions"
import PostDeleteDialog from "@/components/post/post-delete-dialog"
import { PostDetail } from "@/components/post/post-detail"
import { Button } from "@/components/ui/button"

import { getPost } from "../actions"

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  // If post doesn't exist, show 404 page
  if (!post) {
    notFound()
  }

  const authUser = await checkAuth()

  // Fetch author information
  const author = await getUser(post.userId)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="outline" className="flex items-center" asChild>
          <Link href="/post">
            <ArrowLeft className="mr-2 size-4" />
            Back to Posts
          </Link>
        </Button>
      </div>

      <PostDetail post={post} author={author} />

      {authUser?.id === post.userId && (
        <div className="mt-6 flex space-x-2">
          <Button variant="outline" className="flex items-center" asChild>
            <Link href={`/post/${post.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Post
            </Link>
          </Button>
          <PostDeleteDialog post={post} />
        </div>
      )}
    </div>
  )
}
