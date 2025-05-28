"use client"

import { useRouter } from "next/navigation"

import { logout } from "@/app/auth/actions"

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
