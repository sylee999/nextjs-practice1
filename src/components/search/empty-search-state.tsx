import { Search } from "lucide-react"

interface EmptySearchStateProps {
  query: string
}

export function EmptySearchState({ query }: EmptySearchStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="mb-2 text-lg font-semibold">No results found</h3>
      <p className="text-muted-foreground max-w-md">
        {query ? (
          <>
            We couldn&apos;t find any posts or users matching &ldquo;{query}
            &rdquo;. Try searching with different keywords.
          </>
        ) : (
          "Start typing to search for posts and users."
        )}
      </p>
    </div>
  )
}
