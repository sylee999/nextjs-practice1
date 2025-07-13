import { Suspense } from "react"

import { SearchBar } from "@/components/search/search-bar"
import { SearchResults } from "@/components/search/search-results"
import { searchPosts, searchUsers } from "@/lib/api"
import { SearchType } from "@/types/search"

export const dynamic = "force-dynamic"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    type?: SearchType
    page?: string
  }>
}

async function SearchResultsWrapper({
  query,
  type = "all",
  page = 1,
}: {
  query: string
  type: SearchType
  page: number
}) {
  if (!query) {
    return <SearchResults posts={[]} users={[]} query="" type={type} />
  }

  const [posts, users] = await Promise.all([
    type === "users" ? Promise.resolve([]) : searchPosts(query, page),
    type === "posts" ? Promise.resolve([]) : searchUsers(query, page),
  ])

  return <SearchResults posts={posts} users={users} query={query} type={type} />
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ""
  const type = (params.type as SearchType) || "all"
  const page = parseInt(params.page || "1", 10)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <SearchBar autoFocus />
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        }
      >
        <SearchResultsWrapper query={query} type={type} page={page} />
      </Suspense>
    </div>
  )
}
