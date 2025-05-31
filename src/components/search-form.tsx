import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import type { SearchFormProps } from "@/types/components"

/**
 * SearchForm component for user search functionality
 * Provides a search input with icon for filtering users
 *
 * @param placeholder - Custom placeholder text for the search input
 * @param defaultValue - Default value for the search input
 * @param props - Additional form props
 */
export function SearchForm({
  placeholder = "Search users...",
  defaultValue,
  ...props
}: SearchFormProps): React.JSX.Element {
  return (
    <form className="relative w-full" {...props}>
      <SearchIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
      <Input
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="bg-background w-full appearance-none pl-8 shadow-none md:w-2/3 lg:w-1/3"
        name="q"
      />
    </form>
  )
}
