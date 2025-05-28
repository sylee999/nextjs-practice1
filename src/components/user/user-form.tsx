"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"

import { createUserAction, updateUserAction } from "@/app/user/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type UserFormMode = "create" | "edit"

type UserFormData = {
  id?: string // Required for edit mode
  avatar: string
  name: string
  email: string
  password?: string // Only used in create mode
}

type UserFormProps = {
  mode: UserFormMode
  initialData: UserFormData
} & React.ComponentProps<"form">

function SubmitButton({
  mode,
  hasChanges,
}: {
  mode: UserFormMode
  hasChanges: boolean
}) {
  const { pending } = useFormStatus()

  const buttonText = {
    create: pending ? "Creating account..." : "Sign up",
    edit: pending ? "Updating profile..." : "Update Profile",
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

export function UserForm({ mode, initialData, ...props }: UserFormProps) {
  // Initialize form data with defaults for missing fields
  const getInitialFormData = () => {
    return {
      avatar: initialData.avatar || "",
      name: initialData.name || "",
      email: initialData.email || "",
      password: initialData.password || "",
    }
  }

  const [formData, setFormData] = useState(getInitialFormData)

  // Check if form data has changed from initial data (for edit mode)
  const hasChanges = () => {
    if (mode === "create") return true // Always allow submission in create mode

    // In edit mode, check if editable fields have changed
    return (
      formData.name !== (initialData.name || "") ||
      formData.avatar !== (initialData.avatar || "")
    )
  }

  // Use appropriate action based on mode
  const action = mode === "create" ? createUserAction : updateUserAction
  const initialState =
    mode === "create" ? { message: "", id: "" } : { message: "" }

  const [state, formAction, pending] = useActionState(action, initialState)
  const router = useRouter()

  // Handle success navigation based on mode
  useEffect(() => {
    if (state.message === "success") {
      router.refresh()

      if (mode === "create" && "id" in state && state.id) {
        router.push(`/user/${state.id}`)
      } else if (mode === "edit" && initialData.id) {
        router.push(`/user/${initialData.id}`)
      }
    }
  }, [state, router, mode, initialData.id])

  // Content configuration based on mode
  const content = {
    create: {
      title: "Create your account",
      description:
        "Enter your name, email and password below to create your account",
    },
    edit: {
      title: "Update your profile",
      description: "Update your name below to modify your profile",
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              setFormData({
                ...formData,
                email: e.target.value,
                avatar: `https://i.pravatar.cc/150?u=${e.target.value}`,
              })
            }
          />
        </div>

        {/* Password field only for create mode */}
        {mode === "create" && (
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              disabled={pending}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
        )}

        <div className="grid gap-3">
          <SubmitButton mode={mode} hasChanges={hasChanges()} />
          {mode === "edit" && initialData.id && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/user/${initialData.id}`)}
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
