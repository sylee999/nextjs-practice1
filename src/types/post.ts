export interface Post {
  id: string
  userId: string
  title: string
  content: string
  likeUsers: string[] // Array of user IDs who liked this post
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreatePostData {
  userId: string
  title: string
  content: string
}

export interface UpdatePostData {
  title?: string
  content?: string
}

export interface PostFormData {
  title: string
  content: string
}
