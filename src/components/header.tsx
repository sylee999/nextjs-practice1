import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"

import { checkAuth } from "@/app/auth/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SearchForm } from "./search-form"
import { LogoutLabel } from "./user/logout-label"
import { UserAvatar } from "./user/user-avatar"

export const dynamic = "force-dynamic"

/**
 * Header component for the main application layout
 * Provides navigation, search functionality, and user authentication controls
 */
export async function Header(): Promise<React.JSX.Element> {
  const user = await checkAuth()

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
            <UserAvatar user={user} size="md" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user?.id ? (
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
                  <LogoutLabel />
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
