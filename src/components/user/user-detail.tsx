import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@/types/user"

export async function UserDetail({ user }: { user: User | null }) {
  return (
    <div>
      <div className="flex items-center space-x-4">
        <Avatar className="size-14">
          <AvatarImage
            src={user?.avatar || "/default-avatar.png"}
            alt={user?.name || "Unknown"}
          />
          <AvatarFallback>{user?.name.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-bold">
            {user?.name || "Non-existent User"}
          </p>
          {user ? (
            <>
              <p className="text-md text-gray-800">{user?.email}</p>
              <p className="pt-1 text-sm text-gray-500">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p className="text-md text-gray-800">Could not find user</p>
          )}
        </div>
      </div>
    </div>
  )
}
