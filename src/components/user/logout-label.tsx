"use client"

import { logout } from "@/app/auth/actions"
import { useRouter } from "next/navigation"

export function LogoutLabel() {
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        await logout()
        router.refresh()
      }}
      className="flex w-full items-center"
    >
      Logout
    </button>
  )
}
