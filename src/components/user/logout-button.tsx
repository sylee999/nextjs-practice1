"use client"

import { logout } from "@/app/auth/actions"
import { useRouter } from "next/navigation"
import { Label } from "../ui/label"

export function LogoutLabel() {
  const router = useRouter()

  return (
    <Label
      onClick={async () => {
        await logout()
        router.refresh()
      }}
      className="flex w-full items-center"
    >
      Logout
    </Label>
  )
}
