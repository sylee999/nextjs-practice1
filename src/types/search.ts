import { Post } from "./post"
import { User } from "./user"

export type SearchType = "all" | "posts" | "users"

export interface SearchResult {
  posts: Post[]
  users: User[]
}

export interface SearchParams {
  query: string
  type?: SearchType
  page?: number
}
