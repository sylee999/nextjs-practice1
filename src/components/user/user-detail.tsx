import { User } from "@/types/user"

interface UserDetailProps {
  user: User | null
}

export async function UserDetail({
  user,
}: UserDetailProps): Promise<React.JSX.Element> {
  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="rounded border p-4">
      <h2 className="text-xl font-bold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
      {user.avatar && (
        <img
          src={user.avatar}
          alt={user.name}
          className="mt-2 h-16 w-16 rounded-full"
        />
      )}
    </div>
  )
}
