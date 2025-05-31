import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

export function SearchForm({
  ...props
}: React.ComponentProps<"form">): React.JSX.Element {
  return (
    <form className="relative w-full" {...props}>
      <SearchIcon className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
      <Input
        type="search"
        placeholder="Search users..."
        className="bg-background w-full appearance-none pl-8 shadow-none md:w-2/3 lg:w-1/3"
        name="q"
      />
    </form>
  )
}
