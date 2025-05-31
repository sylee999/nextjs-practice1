export interface User {
  id: string
  createdAt: string | Date
  name: string
  avatar: string
  email: string
  password?: string // Optional as it's sensitive and not always needed on client
  likeUsers?: string[] // Optional, array of user IDs
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
