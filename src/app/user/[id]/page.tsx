import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"

import { checkAuth } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import UserDeleteDialog from "@/components/user/user-delete-dialog"
import { UserDetail } from "@/components/user/user-detail"

import { getUser } from "../actions"

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser(id)
  const authUser = await checkAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <UserDetail user={user} />
      {user ? (
        authUser?.id === user.id && (
          <div className="mt-6 flex space-x-2">
            <Button variant="outline" className="flex items-center" asChild>
              <Link href={`/user/${user.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Update
              </Link>
            </Button>
            <UserDeleteDialog user={user} />
          </div>
        )
      ) : (
        <div className="mt-6 flex space-x-2">
          <Button variant="outline" className="flex items-center" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Link>
          </Button>
          {!authUser && (
            <>
              <Button variant="outline" className="flex items-center" asChild>
                <Link href={`/login`}>Login</Link>
              </Button>
              <Button variant="outline" className="flex items-center" asChild>
                <Link href={`/signup`}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
