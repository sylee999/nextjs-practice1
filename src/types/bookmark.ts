export interface BookmarkActionData {
  userId: string
  postId: string
  isBookmarked: boolean
}

export interface BookmarkState {
  message: string
  success: boolean
  isBookmarked?: boolean
}
