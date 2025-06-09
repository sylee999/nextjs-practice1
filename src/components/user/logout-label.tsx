"use client"

import { useRouter } from "next/navigation"

import { logout } from "@/app/auth/actions"

export function LogoutLabel(): React.JSX.Element {
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
