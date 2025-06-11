export interface Post {
  id: string
  userId: string
  title: string
  content: string
  bookmarkedBy?: string[] // Array of user IDs who bookmarked this post - optional since API might not return it
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
