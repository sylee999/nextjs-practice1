"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { createUserAction, updateUserAction } from "@/app/user/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useFormCancelNavigation,
  useFormNavigation,
} from "@/hooks/use-form-navigation"
import { useFormState } from "@/hooks/use-form-state"
import type {
  SubmitButtonProps,
  UserFormData,
  UserFormProps,
} from "@/types/components"

/**
 * Submit button component for user forms
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
    create: isActuallyPending ? "Creating account..." : "Sign up",
    edit: isActuallyPending ? "Updating profile..." : "Update Profile",
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
 * UserForm component for creating and editing user profiles
 * Supports both create and edit modes with proper validation and state management
 *
 * @param mode - Form operation mode ('create' or 'edit')
 * @param initialData - Initial form data
 * @param props - Additional form props
 */
export function UserForm({
  mode,
  initialData,
  ...props
}: UserFormProps): React.JSX.Element {
  // Initialize form data with defaults for missing fields
  const normalizedInitialData: UserFormData = {
    avatar: initialData.avatar,
    name: initialData.name,
    email: initialData.email,
    password: initialData.password || "",
  }

  // Use custom hooks for form state and navigation
  const { formData, hasChanges, updateField, updateFields } = useFormState(
    normalizedInitialData,
    mode
  )

  // Use appropriate action based on mode
  const action = mode === "create" ? createUserAction : updateUserAction
  const initialState =
    mode === "create" ? { message: "", id: "" } : { message: "" }

  const [state, formAction, pending] = useActionState(action, initialState)

  // Handle navigation
  useFormNavigation(state, mode, initialData.id, "user")
  const handleCancel = useFormCancelNavigation(mode, initialData.id, "user")

  // Content configuration based on mode
  const content = {
    create: {
      title: "Create your account",
      description:
        "Enter your name, email and password below to create your account",
    },
    edit: {
      title: "Update your profile",
      description: "Update your name and password below to modify your profile",
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

        {/* Hidden user ID field for edit mode */}
        {mode === "edit" && initialData.id && (
          <Input type="hidden" name="id" value={initialData.id} />
        )}

        <div className="grid place-items-center gap-3">
          <Avatar className="bg-muted h-32 w-32 cursor-pointer justify-center rounded-full">
            <AvatarImage
              src={
                formData.email
                  ? `https://i.pravatar.cc/150?u=${formData.email}`
                  : "/default-avatar.png"
              }
              alt="Auto generated avatar"
            />
            <AvatarFallback className="bg-muted-foreground/25">
              <AvatarImage src="/default-avatar.png" alt="Default Avatar" />
            </AvatarFallback>
          </Avatar>
          <Input type="hidden" name="avatar" value={formData.avatar} />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            required
            disabled={pending}
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            disabled={mode === "edit" || pending}
            value={formData.email}
            onChange={(e) =>
              updateFields({
                email: e.target.value,
                avatar: `https://i.pravatar.cc/150?u=${e.target.value}`,
              })
            }
          />
        </div>

        {/* Password field for both create and edit modes */}
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">
              {mode === "edit" ? "New Password (optional)" : "Password"}
            </Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={
              mode === "edit" ? "Leave blank to keep current password" : ""
            }
            required={mode === "create"}
            autoComplete={
              mode === "create" ? "new-password" : "current-password"
            }
            minLength={8}
            disabled={pending}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
          />
        </div>

        <div className="grid gap-3">
          <SubmitButton
            mode={mode}
            hasChanges={hasChanges()}
            pending={pending}
          />
          {mode === "edit" && initialData.id && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={pending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
