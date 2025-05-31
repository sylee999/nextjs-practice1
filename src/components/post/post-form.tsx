"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"

import { createPostAction, updatePostAction } from "@/app/post/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type PostFormMode = "create" | "edit"

type PostFormData = {
  id?: string // Required for edit mode
  title: string
  content: string
}

type PostFormProps = {
  mode: PostFormMode
  initialData: PostFormData
} & React.ComponentProps<"form">

function SubmitButton({
  mode,
  hasChanges,
}: {
  mode: PostFormMode
  hasChanges: boolean
}) {
  const { pending } = useFormStatus()

  const buttonText = {
    create: pending ? "Creating post..." : "Create Post",
    edit: pending ? "Updating post..." : "Update Post",
  }

  // In edit mode, disable if no changes or pending
  // In create mode, only disable if pending
  const isDisabled = mode === "edit" ? !hasChanges || pending : pending

  return (
    <Button type="submit" className="w-full" disabled={isDisabled}>
      {buttonText[mode]}
    </Button>
  )
}

export function PostForm({
  mode,
  initialData,
  ...props
}: PostFormProps): React.JSX.Element {
  // Initialize form data with defaults for missing fields
  const getInitialFormData = () => {
    return {
      title: initialData.title || "",
      content: initialData.content || "",
    }
  }

  const [formData, setFormData] = useState(getInitialFormData)

  // Check if form data has changed from initial data (for edit mode)
  const hasChanges = () => {
    if (mode === "create") return true // Always allow submission in create mode

    // In edit mode, check if editable fields have changed
    return (
      formData.title !== initialData.title ||
      formData.content !== initialData.content
    )
  }

  // Use appropriate action based on mode
  const action = mode === "create" ? createPostAction : updatePostAction
  const initialState =
    mode === "create" ? { message: "", id: "" } : { message: "" }

  const [state, formAction, pending] = useActionState(action, initialState)
  const router = useRouter()

  // Handle success navigation based on mode
  useEffect(() => {
    if (state.message === "success") {
      router.refresh()

      if (mode === "create" && "id" in state && state.id) {
        router.push(`/post/${state.id}`)
      } else if (mode === "edit" && initialData.id) {
        router.push(`/post/${initialData.id}`)
      }
    }
  }, [state, router, mode, initialData.id])

  // Content configuration based on mode
  const content = {
    create: {
      title: "Create a new post",
      description: "Share your thoughts with the community",
    },
    edit: {
      title: "Edit your post",
      description: "Update your post content",
    },
  }

  return (
    <form className="flex flex-col gap-6" action={formAction} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{content[mode].title}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {content[mode].description}
        </p>
      </div>

      <div className="grid gap-6">
        {state.message && state.message !== "success" && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Hidden post ID field for edit mode */}
        {mode === "edit" && initialData.id && (
          <Input type="hidden" name="id" value={initialData.id} />
        )}

        <div className="grid gap-3">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            type="text"
            placeholder="Enter your post title"
            required
            disabled={pending}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            placeholder="Write your post content here..."
            required
            disabled={pending}
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="grid gap-3">
          <SubmitButton mode={mode} hasChanges={hasChanges()} />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              router.push(
                mode === "edit" && initialData.id
                  ? `/post/${initialData.id}`
                  : "/post"
              )
            }
            disabled={pending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
