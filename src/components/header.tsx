"use client"

import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { SearchForm } from "./search-form"
import { Avatar, AvatarImage } from "./ui/avatar"

interface User {
  id: string
  name: string
  avatar: string
}

const Header: React.FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<User>({
    id: "",
    name: "Not logged in",
    avatar: "/default-avatar.png",
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in by checking for session cookie
    const checkSession = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser({
              avatar: data.user.avatar || "/default-avatar.png",
              ...data.user,
            })
            setIsLoggedIn(true)
          }
        }
      } catch (error) {
        console.error("Failed to check authentication status:", error)
      }
    }

    checkSession()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setUser({
          id: "",
          name: "Not logged in",
          avatar: "/default-avatar.png",
        })
        setIsLoggedIn(false)
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
            {isLoggedIn ? (
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
