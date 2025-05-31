"use client"

import { useActionState } from "react"

import { logout } from "@/app/auth/actions"

export function LogoutLabel(): React.JSX.Element {
  const [, formAction] = useActionState(logout, { success: false, message: "" })

  return (
    <form action={formAction} className="w-full">
      <button
        type="submit"
        className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm"
      >
        <span>Sign out</span>
      </button>
    </form>
  )
}
