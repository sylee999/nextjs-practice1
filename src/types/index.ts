// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  bio?: string
}

// User types
export interface User {
  id: string
  name: string
  email: string
  avatar: string
  password: string
  bio?: string
  followers: string[]
  following: string[]
  bookmarkedPosts: string[]
  createdAt?: string
  updatedAt?: string
}

export interface UserFormData {
  id?: string
  name: string
  email: string
  avatar: string
  password: string
  bio?: string
}

// Post types
export interface Post {
  id: string
  userId: string
  title: string
  content: string
  bookmarkedBy: string[]
  createdAt: string
  updatedAt: string
}

export interface PostFormData {
  id?: string
  title: string
  content: string
}

// Form state types
export interface FormState {
  message: string
  success: boolean
  id?: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Component prop types
export interface UserCardProps {
  user: User
  showFollowButton?: boolean
  className?: string
}

export interface PostCardProps {
  post: Post
  author: User
  className?: string
}

// Follow functionality types
export interface FollowStats {
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

// Bookmark functionality types  
export interface BookmarkStats {
  isBookmarked: boolean
  bookmarkCount: number
}
