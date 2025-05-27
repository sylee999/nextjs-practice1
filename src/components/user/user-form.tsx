"use client"

import { createUserAction } from "@/app/user/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Sign up"}
    </Button>
  )
}

export function UserForm({
  initialUser,
  ...props
}: {
  initialUser: {
    avatar: string
    name: string
    email: string
    password: string
  }
}) {
  const [user, setUser] = useState(initialUser)
  const [state, formAction, pending] = useActionState(createUserAction, {
    message: "",
    id: "",
  })
  const router = useRouter()
  useEffect(() => {
    if (state.message === "success" && state.id) {
      router.refresh()
      router.push(`/user/${state.id}`)
    }
  }, [state, router])

  return (
    <form className={"flex flex-col gap-6"} action={formAction} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your name, email and password below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        {state.message && state.message !== "success" && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid place-items-center gap-3">
          <Avatar className="bg-muted h-32 w-32 cursor-pointer justify-center rounded-full">
            <AvatarImage
              src={
                user && user.email
                  ? `https://i.pravatar.cc/150?u=${user.email}`
                  : "/default-avatar.png"
              }
              alt="Auto generated avatar"
            />
            <AvatarFallback className="bg-muted-foreground/25">
              <AvatarImage src="/default-avatar.png" alt="Default Avatar" />
            </AvatarFallback>
          </Avatar>
          {/* <p className="text-muted-foreground text-center text-sm">
            Click to upload your profile picture
          </p> */}
          <Input type="hidden" name="avatar" value={user.avatar} />
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
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
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
            disabled={pending}
            value={user.email}
            onChange={(e) =>
              setUser({
                ...user,
                email: e.target.value,
                avatar: `https://i.pravatar.cc/150?u=${e.target.value}`,
              })
            }
          />
        </div>
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
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  )
}
