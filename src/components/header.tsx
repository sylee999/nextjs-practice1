"use client"

import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { checkAuth, logout } from "@/app/auth/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/types/user"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { SearchForm } from "./search-form"
import { Avatar, AvatarImage } from "./ui/avatar"

const notLoggedUser = {
  id: "",
  name: "Not logged in",
  avatar: "/default-avatar.png",
  email: "",
  createdAt: "",
}
const Header: React.FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<User>(notLoggedUser)

  useEffect(() => {
    const fetchUser = async () => {
      const authUser = await checkAuth()
      setUser(authUser || notLoggedUser)
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await logout()
      if (response.success) {
        setUser({
          id: "",
          name: "Not logged in",
          avatar: "/default-avatar.png",
          email: "",
          createdAt: "",
        })
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Link href="/" className="no-wrap flex items-center gap-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">My Social Media</span>
            <span className="">v1.0.0</span>
          </div>
        </Link>
        <SearchForm className="ml-auto w-auto" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.id ? (
              <>
                <DropdownMenuItem>
                  <Link
                    href={`/user/${user.id}`}
                    className="flex w-full items-center"
                  >
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center"
                  >
                    Logout
                  </button>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>
                  <Link href="/login" className="flex w-full items-center">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/signup" className="flex w-full items-center">
                    Sign up
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header
