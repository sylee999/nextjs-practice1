"use client"

import { logout } from "@/app/auth/actions"

async function handleLogout(): Promise<void> {
  "use server"
  await logout()
}

export function LogoutLabel(): React.JSX.Element {
  return (
    <form action={handleLogout} className="w-full">
      <button
        type="submit"
        className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm"
      >
        <span>Sign out</span>
      </button>
    </form>
  )
}
