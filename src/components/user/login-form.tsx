"use client"

import { login } from "@/app/auth/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/user"

  // Use the server action with useFormState
  const [state, formAction] = useActionState(login, {
    success: false,
    message: "",
    from,
  })

  useEffect(() => {
    if (state.success && state.from) {
      // TODO: Use a global state or context for auth
      // Store user info and login status in a React context or global state (like Zustand, Redux, or React Context).
      // Update the context on login/logout, and have the header subscribe to this context.
      // This is the best practice for a seamless SPA experience, but requires more setup.

      // Minimal fix(Full reload after login) for now. It will be fixed using a global state for auth later.
      // router.push(state.from)
      // router.refresh()
      window.location.href = state.from
    }
  }, [state.success, state.from, router])

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={formAction}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        {state.message && !state.success && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        {/* Hidden input to store the from parameter */}
        <input type="hidden" name="from" value={from} />
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
}
