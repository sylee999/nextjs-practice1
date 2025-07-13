"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  className,
  placeholder = "Search posts and users...",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      } else {
        router.push("/")
      }
    },
    [router]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce search
    if (value.trim()) {
      setIsSearching(true)
      timeoutRef.current = setTimeout(() => {
        handleSearch(value)
        setIsSearching(false)
      }, 300)
    } else {
      setIsSearching(false)
      handleSearch("")
    }
  }

  const handleClear = () => {
    setQuery("")
    handleSearch("")
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    handleSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pr-10 pl-10"
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
        {isSearching && (
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        )}
      </div>
      <div className="pointer-events-none absolute top-1/2 right-12 hidden -translate-y-1/2 sm:block">
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </form>
  )
}
