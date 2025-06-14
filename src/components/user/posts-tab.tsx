import { UserPostsList } from "@/components/user/user-posts-list"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface PostsTabProps {
  user: User
  currentUserId?: string
  isOwnProfile?: boolean
  userPosts: Post[]
}

export function PostsTab({
  user,
  currentUserId,
  isOwnProfile = false,
  userPosts,
}: PostsTabProps): React.JSX.Element {
  return (
    <div className="pt-4">
      <UserPostsList
        posts={userPosts}
        author={user}
        currentUserId={currentUserId}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}
