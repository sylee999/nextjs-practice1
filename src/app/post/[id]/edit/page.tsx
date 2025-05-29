import { redirect } from "next/navigation"

import { checkAuth } from "@/app/auth/actions"
import { PostForm } from "@/components/post/post-form"

import { getPost } from "../../actions"

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Check if user is authenticated
  const authUser = await checkAuth()
  if (!authUser) {
    redirect(`/login?from=/post/${id}/edit`)
  }

  // Get the post data
  const post = await getPost(id)
  if (!post) {
    redirect("/post")
  }

  // Check if the authenticated user can edit this post
  if (authUser.id !== post.userId) {
    redirect(`/post/${id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PostForm
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
        }}
      />
    </div>
  )
}
