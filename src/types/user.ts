export interface User {
  id: string
  createdAt: string | Date
  name: string
  avatar: string
  email: string
  password?: string // Optional as it's sensitive and not always needed on client
  bookmarkedPosts?: string[] // Optional, array of post IDs bookmarked by this user
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  avatar?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  avatar?: string
}
