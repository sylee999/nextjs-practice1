"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { deletePostAction } from "@/app/post/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Post } from "@/types/post"

export default function PostDeleteDialog({ post }: { post: Post }) {
  const [state, formAction, pending] = useActionState(deletePostAction, {
    message: "",
  })
  const router = useRouter()

  // Handle successful deletion
  useEffect(() => {
    if (state.message === "success") {
      router.push("/post")
    }
  }, [state.message, router])

  return (
    <form action={formAction} id="delete-post-form">
      <input type="hidden" name="id" value={post.id} />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" className="flex items-center">
            <Trash2 className="mr-2 size-4" />
            Delete Post
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              post &ldquo;{post.title}&rdquo; and remove it from our servers.
            </DialogDescription>
            {state.message && state.message !== "success" && (
              <Alert variant="destructive">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              type="submit"
              form="delete-post-form"
              disabled={pending}
            >
              {pending ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
