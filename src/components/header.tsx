import React from "react"
import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"

import { SearchForm } from "./search-form"

const Header: React.FC = () => {
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
      </div>
    </header>
  )
}

export default Header
