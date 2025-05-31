"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { createPostAction, updatePostAction } from "@/app/post/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useFormCancelNavigation,
  useFormNavigation,
} from "@/hooks/use-form-navigation"
import { useFormState } from "@/hooks/use-form-state"
import type {
  PostFormData,
  PostFormProps,
  SubmitButtonProps,
} from "@/types/components"

/**
 * Submit button component for post forms
 * Handles different states based on form mode and pending status
 */
function SubmitButton({
  mode,
  hasChanges,
  pending = false,
}: SubmitButtonProps): React.JSX.Element {
  const { pending: formPending } = useFormStatus()
  const isActuallyPending = pending || formPending

  const buttonText = {
    create: isActuallyPending ? "Creating post..." : "Create Post",
    edit: isActuallyPending ? "Updating post..." : "Update Post",
  }

  // In edit mode, disable if no changes or pending
  // In create mode, only disable if pending
  const isDisabled =
    mode === "edit" ? !hasChanges || isActuallyPending : isActuallyPending

  return (
    <Button type="submit" className="w-full" disabled={isDisabled}>
      {buttonText[mode]}
    </Button>
  )
}

/**
 * PostForm component for creating and editing posts
 * Supports both create and edit modes with proper validation and state management
 *
 * @param mode - Form operation mode ('create' or 'edit')
 * @param initialData - Initial form data
 * @param props - Additional form props
 */
export function PostForm({
  mode,
  initialData,
  ...props
}: PostFormProps): React.JSX.Element {
  // Initialize form data with defaults for missing fields
  const normalizedInitialData: PostFormData = {
    title: initialData.title || "",
    content: initialData.content || "",
  }

  // Use custom hooks for form state and navigation
  const { formData, hasChanges, updateField } = useFormState(
    normalizedInitialData,
    mode
  )

  // Use appropriate action based on mode
  const action = mode === "create" ? createPostAction : updatePostAction
  const initialState =
    mode === "create" ? { message: "", id: "" } : { message: "" }

  const [state, formAction, pending] = useActionState(action, initialState)

  // Handle navigation
  useFormNavigation(state, mode, initialData.id, "post")
  const handleCancel = useFormCancelNavigation(mode, initialData.id, "post")

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
            onChange={(e) => updateField("title", e.target.value)}
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
              updateField("content", e.target.value)
            }
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="grid gap-3">
          <SubmitButton
            mode={mode}
            hasChanges={hasChanges()}
            pending={pending}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleCancel}
            disabled={pending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
