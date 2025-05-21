import { UserDetail } from "@/components/user/user-detail"
import { getUser } from "../actions"
import { User } from "@/types/user"
export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params
  const user = (await getUser(id)) as User

  return <UserDetail user={user} />
}
