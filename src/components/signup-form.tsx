"use client"

import { useFormState, useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createUser } from "@/app/user/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Sign up"}
    </Button>
  )
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction] = useFormState(createUser, { message: "" })

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={formAction}
      {...props}
    >
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
        <div className="grid gap-3">
          <div className="flex items-center justify-center">
            <div className="relative h-32 w-32">
              <div className="border-muted-foreground/25 bg-muted flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed">
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        const img = document.getElementById(
                          "preview"
                        ) as HTMLImageElement
                        if (img && e.target?.result) {
                          img.src = e.target.result as string
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <img
                  id="preview"
                  src="/placeholder-avatar.png"
                  alt="Avatar preview"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-center text-sm">
            Click to upload your profile picture
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            required
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
          />
        </div>
        <SubmitButton />
      </div>
    </form>
  )
}
