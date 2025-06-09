"use client"

import { useActionState, useEffect, useState } from "react"
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
    success: false,
  })
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Handle successful deletion or errors
  useEffect(() => {
    if (state.success === true) {
      setIsOpen(false) // Close dialog
      router.push("/post")
    }
  }, [state.success, router])

  return (
    <form action={formAction} id="delete-post-form">
      <input type="hidden" name="id" value={post.id} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          </DialogHeader>

          {state.message && state.success === false && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
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
