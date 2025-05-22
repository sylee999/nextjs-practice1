import { checkAuth } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserDetail } from "@/components/user/user-detail"
import { User } from "@/types/user"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { getUser } from "../actions"
export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params
  const user = (await getUser(id)) as User
  const authUser = await checkAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <UserDetail user={user} />
      {authUser?.id === user.id && (
        <div className="mt-6 flex space-x-2">
          <Button variant="outline" className="flex items-center" asChild>
            <Link href={`/user/${user.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Update
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger>
              <Button
                variant="destructive"
                className="flex items-center"
                asChild
              >
                <span>
                  <Trash2 className="mr-2 size-4" />
                  Delete Account
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </DialogDescription>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">
                    <Link href={`/user/${user.id}/delete`}>Delete</Link>
                  </Button>
                </DialogFooter>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
