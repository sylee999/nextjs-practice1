import { getUserPosts } from "@/app/post/actions"
import { UserPostsList } from "@/components/user/user-posts-list"
import { Post } from "@/types/post"
import { User } from "@/types/user"

interface PostsTabProps {
  user: User
  currentUserId?: string
  isOwnProfile?: boolean
}

export async function PostsTab({
  user,
  currentUserId,
  isOwnProfile = false,
}: PostsTabProps): Promise<React.JSX.Element> {
  // Fetch user's posts
  let userPosts: Post[]
  try {
    userPosts = await getUserPosts(user.id)
  } catch (error) {
    console.error("Error fetching user posts:", error)
    userPosts = []
  }

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
