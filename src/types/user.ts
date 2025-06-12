export interface User {
  id: string
  createdAt: string | Date
  name: string
  avatar: string
  email: string
  password?: string // Optional as it's sensitive and not always needed on client
  bookmarkedPosts?: string[] // Optional, array of post IDs bookmarked by this user
  followers?: string[] // Optional, array of user IDs who follow this user
  following?: string[] // Optional, array of user IDs this user is following
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  avatar?: string
  followers?: string[]
  following?: string[]
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  avatar?: string
  followers?: string[]
  following?: string[]
}
