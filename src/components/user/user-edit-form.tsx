"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFormStatus } from "react-dom"

import { updateUserAction } from "@/app/user/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "@/types/user"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Updating profile..." : "Update Profile"}
    </Button>
  )
}

export function UserEditForm({ user, ...props }: { user: User }) {
  const [formData, setFormData] = useState({
    avatar: user.avatar,
    name: user.name,
    email: user.email,
  })

  const [state, formAction, pending] = useActionState(updateUserAction, {
    message: "",
  })

  const router = useRouter()

  useEffect(() => {
    if (state.message === "success") {
      router.refresh()
      router.push(`/user/${user.id}`)
    }
  }, [state, router, user.id])

  return (
    <form className={"flex flex-col gap-6"} action={formAction} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Update your profile</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Update your name below to modify your profile
        </p>
      </div>
      <div className="grid gap-6">
        {state.message && state.message !== "success" && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Hidden user ID field */}
        <Input type="hidden" name="id" value={user.id} />

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
            disabled={true}
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
        <div className="grid gap-3">
          <SubmitButton />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/user/${user.id}`)}
            disabled={pending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
